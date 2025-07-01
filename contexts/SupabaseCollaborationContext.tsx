'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSupabaseAuth } from './SupabaseAuthContext'
import { supabase } from '@/lib/supabase'

interface Workspace {
  id: string
  owner_id: string
  name: string
  description: string
  permissions: any
  is_public: boolean
  created_at: string
}

interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: any
  joined_at: string
  user?: {
    username: string
    full_name: string
    email: string
  }
}

interface UserPresence {
  user_id: string
  username: string
  full_name: string
  workspace_id: string
  current_path: string
  last_seen: string
  is_online: boolean
  cursor_position?: { x: number; y: number }
  current_file?: string
}

interface CollaborationContextType {
  // Workspace management
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  workspaceMembers: WorkspaceMember[]
  userPresence: UserPresence[]
  
  // Workspace operations
  createWorkspace: (name: string, description: string, isPublic?: boolean) => Promise<Workspace | null>
  joinWorkspace: (workspaceId: string) => Promise<boolean>
  leaveWorkspace: (workspaceId: string) => Promise<boolean>
  switchWorkspace: (workspaceId: string) => Promise<boolean>
  inviteToWorkspace: (workspaceId: string, email: string, role?: string) => Promise<boolean>
  removeFromWorkspace: (workspaceId: string, userId: string) => Promise<boolean>
  
  // Real-time collaboration
  updatePresence: (data: Partial<UserPresence>) => void
  broadcastCursorPosition: (x: number, y: number) => void
  broadcastFileEdit: (filePath: string, content: string, cursorPosition?: number) => void
  
  // Shared file editing
  sharedFiles: Map<string, { content: string; editors: string[]; lastModified: string }>
  openSharedFile: (filePath: string) => void
  closeSharedFile: (filePath: string) => void
  
  // Notifications
  notifications: Array<{ id: string; type: string; message: string; timestamp: string }>
  addNotification: (type: string, message: string) => void
  clearNotification: (id: string) => void
  
  loading: boolean
  error: string | null
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

export function SupabaseCollaborationProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useSupabaseAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([])
  const [userPresence, setUserPresence] = useState<UserPresence[]>([])
  const [sharedFiles, setSharedFiles] = useState<Map<string, any>>(new Map())
  const [notifications, setNotifications] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load workspaces when user changes
  useEffect(() => {
    if (user) {
      loadWorkspaces()
      setupRealtimeSubscriptions()
    } else {
      setWorkspaces([])
      setCurrentWorkspace(null)
      setWorkspaceMembers([])
      setUserPresence([])
      setSharedFiles(new Map())
    }
  }, [user])

  const loadWorkspaces = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load workspaces where user is a member
      const { data: memberWorkspaces, error: memberError } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          shared_workspaces (
            id,
            owner_id,
            name,
            description,
            permissions,
            is_public,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (memberError) {
        setError(memberError.message)
        return
      }

      // Load public workspaces
      const { data: publicWorkspaces, error: publicError } = await supabase
        .from('shared_workspaces')
        .select('*')
        .eq('is_public', true)

      if (publicError) {
        setError(publicError.message)
        return
      }

      // Combine and deduplicate workspaces
      const allWorkspaces = new Map<string, Workspace>()
      
      memberWorkspaces?.forEach(member => {
        if (member.shared_workspaces) {
          allWorkspaces.set(member.shared_workspaces.id, member.shared_workspaces as Workspace)
        }
      })

      publicWorkspaces?.forEach(workspace => {
        allWorkspaces.set(workspace.id, workspace)
      })

      setWorkspaces(Array.from(allWorkspaces.values()))
    } catch (err) {
      setError('Failed to load workspaces')
      console.error('Workspace load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user) return

    // Subscribe to workspace changes
    const workspaceSubscription = supabase
      .channel('workspace_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shared_workspaces'
      }, (payload) => {
        console.log('Workspace change:', payload)
        loadWorkspaces()
      })
      .subscribe()

    // Subscribe to workspace member changes
    const memberSubscription = supabase
      .channel('member_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_members'
      }, (payload) => {
        console.log('Member change:', payload)
        if (currentWorkspace) {
          loadWorkspaceMembers(currentWorkspace.id)
        }
      })
      .subscribe()

    return () => {
      workspaceSubscription.unsubscribe()
      memberSubscription.unsubscribe()
    }
  }, [user, currentWorkspace])

  const loadWorkspaceMembers = useCallback(async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          users (
            username,
            full_name,
            email
          )
        `)
        .eq('workspace_id', workspaceId)

      if (error) {
        setError(error.message)
        return
      }

      setWorkspaceMembers(data || [])
    } catch (err) {
      setError('Failed to load workspace members')
      console.error('Member load error:', err)
    }
  }, [])

  const createWorkspace = useCallback(async (name: string, description: string, isPublic: boolean = false): Promise<Workspace | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('shared_workspaces')
        .insert({
          owner_id: user.id,
          name,
          description,
          is_public: isPublic,
          permissions: { default_role: 'member' }
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
        return null
      }

      // Add creator as owner
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: data.id,
          user_id: user.id,
          role: 'owner',
          permissions: { all: true }
        })

      await loadWorkspaces()
      return data
    } catch (err) {
      setError('Failed to create workspace')
      console.error('Create workspace error:', err)
      return null
    }
  }, [user, loadWorkspaces])

  const joinWorkspace = useCallback(async (workspaceId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: user.id,
          role: 'member',
          permissions: { read: true, write: true }
        })

      if (error) {
        setError(error.message)
        return false
      }

      await loadWorkspaces()
      return true
    } catch (err) {
      setError('Failed to join workspace')
      console.error('Join workspace error:', err)
      return false
    }
  }, [user, loadWorkspaces])

  const leaveWorkspace = useCallback(async (workspaceId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)

      if (error) {
        setError(error.message)
        return false
      }

      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(null)
        setWorkspaceMembers([])
        setUserPresence([])
      }

      await loadWorkspaces()
      return true
    } catch (err) {
      setError('Failed to leave workspace')
      console.error('Leave workspace error:', err)
      return false
    }
  }, [user, currentWorkspace, loadWorkspaces])

  const switchWorkspace = useCallback(async (workspaceId: string): Promise<boolean> => {
    const workspace = workspaces.find(w => w.id === workspaceId)
    if (!workspace) return false

    setCurrentWorkspace(workspace)
    await loadWorkspaceMembers(workspaceId)
    
    // Setup presence tracking for this workspace
    if (user && userProfile) {
      updatePresence({
        user_id: user.id,
        username: userProfile.username,
        full_name: userProfile.full_name,
        workspace_id: workspaceId,
        current_path: userProfile.home_directory,
        is_online: true
      })
    }

    return true
  }, [workspaces, user, userProfile, loadWorkspaceMembers])

  const inviteToWorkspace = useCallback(async (workspaceId: string, email: string, role: string = 'member'): Promise<boolean> => {
    if (!user) return false

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        setError('User not found')
        return false
      }

      // Add to workspace
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: userData.id,
          role,
          permissions: { read: true, write: role !== 'viewer' }
        })

      if (error) {
        setError(error.message)
        return false
      }

      await loadWorkspaceMembers(workspaceId)
      addNotification('success', `Invited ${email} to workspace`)
      return true
    } catch (err) {
      setError('Failed to invite user')
      console.error('Invite error:', err)
      return false
    }
  }, [user, loadWorkspaceMembers])

  const removeFromWorkspace = useCallback(async (workspaceId: string, userId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)

      if (error) {
        setError(error.message)
        return false
      }

      await loadWorkspaceMembers(workspaceId)
      return true
    } catch (err) {
      setError('Failed to remove user')
      console.error('Remove user error:', err)
      return false
    }
  }, [user, loadWorkspaceMembers])

  const updatePresence = useCallback((data: Partial<UserPresence>) => {
    if (!user || !currentWorkspace) return

    const presenceData = {
      user_id: user.id,
      workspace_id: currentWorkspace.id,
      last_seen: new Date().toISOString(),
      is_online: true,
      ...data
    }

    // Broadcast presence update
    supabase.channel(`workspace:${currentWorkspace.id}`)
      .send({
        type: 'broadcast',
        event: 'presence_update',
        payload: presenceData
      })

    // Update local presence
    setUserPresence(prev => {
      const filtered = prev.filter(p => p.user_id !== user.id)
      return [...filtered, presenceData as UserPresence]
    })
  }, [user, currentWorkspace])

  const broadcastCursorPosition = useCallback((x: number, y: number) => {
    if (!currentWorkspace) return

    updatePresence({ cursor_position: { x, y } })
  }, [currentWorkspace, updatePresence])

  const broadcastFileEdit = useCallback((filePath: string, content: string, cursorPosition?: number) => {
    if (!user || !currentWorkspace) return

    const editData = {
      user_id: user.id,
      file_path: filePath,
      content,
      cursor_position: cursorPosition,
      timestamp: new Date().toISOString()
    }

    supabase.channel(`workspace:${currentWorkspace.id}`)
      .send({
        type: 'broadcast',
        event: 'file_edit',
        payload: editData
      })
  }, [user, currentWorkspace])

  const openSharedFile = useCallback((filePath: string) => {
    if (!user || !currentWorkspace) return

    setSharedFiles(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(filePath)
      
      if (existing) {
        existing.editors.push(user.id)
      } else {
        newMap.set(filePath, {
          content: '',
          editors: [user.id],
          lastModified: new Date().toISOString()
        })
      }
      
      return newMap
    })

    updatePresence({ current_file: filePath })
  }, [user, currentWorkspace, updatePresence])

  const closeSharedFile = useCallback((filePath: string) => {
    if (!user) return

    setSharedFiles(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(filePath)
      
      if (existing) {
        existing.editors = existing.editors.filter(id => id !== user.id)
        if (existing.editors.length === 0) {
          newMap.delete(filePath)
        }
      }
      
      return newMap
    })

    updatePresence({ current_file: undefined })
  }, [user, updatePresence])

  const addNotification = useCallback((type: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString()
    }

    setNotifications(prev => [...prev, notification])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const value = {
    workspaces,
    currentWorkspace,
    workspaceMembers,
    userPresence,
    createWorkspace,
    joinWorkspace,
    leaveWorkspace,
    switchWorkspace,
    inviteToWorkspace,
    removeFromWorkspace,
    updatePresence,
    broadcastCursorPosition,
    broadcastFileEdit,
    sharedFiles,
    openSharedFile,
    closeSharedFile,
    notifications,
    addNotification,
    clearNotification,
    loading,
    error
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
}

export function useSupabaseCollaboration() {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error('useSupabaseCollaboration must be used within a SupabaseCollaborationProvider')
  }
  return context
}
