'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSupabaseAuth } from './SupabaseAuthContext'
import { 
  supabase, 
  createFile, 
  createDirectory, 
  getFileSystemTree, 
  updateFile, 
  deleteFile,
  subscribeToFileSystem 
} from '@/lib/supabase'

export interface FileSystemItem {
  id: string
  user_id: string
  path: string
  name: string
  type: 'file' | 'directory' | 'symlink'
  content: string
  metadata: any
  permissions: string
  owner_uid: number
  group_gid: number
  size: number
  created_at: string
  modified_at: string
  accessed_at: string
  parent_id: string | null
}

interface FileSystemContextType {
  files: FileSystemItem[]
  currentDirectory: string
  loading: boolean
  error: string | null
  
  // Navigation
  changeDirectory: (path: string) => void
  getDirectoryContents: (path: string) => FileSystemItem[]
  
  // File operations
  createFile: (path: string, content?: string, metadata?: any) => Promise<FileSystemItem | null>
  createDirectory: (path: string, metadata?: any) => Promise<FileSystemItem | null>
  readFile: (path: string) => Promise<string | null>
  writeFile: (path: string, content: string) => Promise<boolean>
  deleteItem: (path: string) => Promise<boolean>
  moveItem: (oldPath: string, newPath: string) => Promise<boolean>
  copyItem: (sourcePath: string, destPath: string) => Promise<boolean>
  
  // Utility functions
  exists: (path: string) => boolean
  isDirectory: (path: string) => boolean
  isFile: (path: string) => boolean
  getFileInfo: (path: string) => FileSystemItem | null
  getParentDirectory: (path: string) => string
  joinPath: (...parts: string[]) => string
  
  // Real-time updates
  refreshFileSystem: () => Promise<void>
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export function SupabaseFileSystemProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useSupabaseAuth()
  const [files, setFiles] = useState<FileSystemItem[]>([])
  const [currentDirectory, setCurrentDirectory] = useState('/')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load file system when user changes
  useEffect(() => {
    if (user && userProfile) {
      setCurrentDirectory(userProfile.home_directory)
      loadFileSystem()
      
      // Subscribe to real-time updates
      const subscription = subscribeToFileSystem(user.id, (payload) => {
        console.log('File system update:', payload)
        loadFileSystem() // Refresh on any change
      })

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setFiles([])
      setCurrentDirectory('/')
    }
  }, [user, userProfile])

  const loadFileSystem = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await getFileSystemTree(user.id)
      
      if (error) {
        setError(error.message)
      } else if (data) {
        setFiles(data)
      }
    } catch (err) {
      setError('Failed to load file system')
      console.error('File system load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const refreshFileSystem = useCallback(async () => {
    await loadFileSystem()
  }, [loadFileSystem])

  const changeDirectory = useCallback((path: string) => {
    const normalizedPath = normalizePath(path)
    if (exists(normalizedPath) && isDirectory(normalizedPath)) {
      setCurrentDirectory(normalizedPath)
    } else {
      setError(`Directory not found: ${path}`)
    }
  }, [files])

  const getDirectoryContents = useCallback((path: string): FileSystemItem[] => {
    const normalizedPath = normalizePath(path)
    return files.filter(file => {
      const parentPath = getParentDirectory(file.path)
      return parentPath === normalizedPath
    }).sort((a, b) => {
      // Directories first, then files, alphabetically
      if (a.type === 'directory' && b.type !== 'directory') return -1
      if (a.type !== 'directory' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    })
  }, [files])

  const createFileItem = useCallback(async (path: string, content: string = '', metadata: any = {}): Promise<FileSystemItem | null> => {
    if (!user) return null

    try {
      const { data, error } = await createFile(user.id, path, content, metadata)
      
      if (error) {
        setError(error.message)
        return null
      }

      if (data) {
        await refreshFileSystem()
        return data
      }
    } catch (err) {
      setError('Failed to create file')
      console.error('Create file error:', err)
    }

    return null
  }, [user, refreshFileSystem])

  const createDirectoryItem = useCallback(async (path: string, metadata: any = {}): Promise<FileSystemItem | null> => {
    if (!user) return null

    try {
      const { data, error } = await createDirectory(user.id, path, metadata)
      
      if (error) {
        setError(error.message)
        return null
      }

      if (data) {
        await refreshFileSystem()
        return data
      }
    } catch (err) {
      setError('Failed to create directory')
      console.error('Create directory error:', err)
    }

    return null
  }, [user, refreshFileSystem])

  const readFile = useCallback(async (path: string): Promise<string | null> => {
    const file = getFileInfo(path)
    if (!file || file.type !== 'file') {
      setError(`File not found: ${path}`)
      return null
    }

    // Update accessed_at timestamp
    if (user) {
      await supabase
        .from('file_system')
        .update({ accessed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('path', path)
    }

    return file.content
  }, [files, user])

  const writeFile = useCallback(async (path: string, content: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await updateFile(user.id, path, content)
      
      if (error) {
        setError(error.message)
        return false
      }

      await refreshFileSystem()
      return true
    } catch (err) {
      setError('Failed to write file')
      console.error('Write file error:', err)
      return false
    }
  }, [user, refreshFileSystem])

  const deleteItem = useCallback(async (path: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await deleteFile(user.id, path)
      
      if (error) {
        setError(error.message)
        return false
      }

      await refreshFileSystem()
      return true
    } catch (err) {
      setError('Failed to delete item')
      console.error('Delete item error:', err)
      return false
    }
  }, [user, refreshFileSystem])

  const moveItem = useCallback(async (oldPath: string, newPath: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('file_system')
        .update({ 
          path: newPath,
          name: newPath.split('/').pop() || '',
          modified_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('path', oldPath)

      if (error) {
        setError(error.message)
        return false
      }

      await refreshFileSystem()
      return true
    } catch (err) {
      setError('Failed to move item')
      console.error('Move item error:', err)
      return false
    }
  }, [user, refreshFileSystem])

  const copyItem = useCallback(async (sourcePath: string, destPath: string): Promise<boolean> => {
    const sourceFile = getFileInfo(sourcePath)
    if (!sourceFile) {
      setError(`Source file not found: ${sourcePath}`)
      return false
    }

    if (sourceFile.type === 'file') {
      const newFile = await createFileItem(destPath, sourceFile.content, sourceFile.metadata)
      return newFile !== null
    } else if (sourceFile.type === 'directory') {
      const newDir = await createDirectoryItem(destPath, sourceFile.metadata)
      if (!newDir) return false

      // Copy all contents recursively
      const contents = getDirectoryContents(sourcePath)
      for (const item of contents) {
        const newItemPath = joinPath(destPath, item.name)
        const success = await copyItem(item.path, newItemPath)
        if (!success) return false
      }
      return true
    }

    return false
  }, [files, createFileItem, createDirectoryItem, getDirectoryContents])

  // Utility functions
  const exists = useCallback((path: string): boolean => {
    const normalizedPath = normalizePath(path)
    return files.some(file => file.path === normalizedPath)
  }, [files])

  const isDirectory = useCallback((path: string): boolean => {
    const file = getFileInfo(path)
    return file?.type === 'directory'
  }, [files])

  const isFile = useCallback((path: string): boolean => {
    const file = getFileInfo(path)
    return file?.type === 'file'
  }, [files])

  const getFileInfo = useCallback((path: string): FileSystemItem | null => {
    const normalizedPath = normalizePath(path)
    return files.find(file => file.path === normalizedPath) || null
  }, [files])

  const getParentDirectory = useCallback((path: string): string => {
    const normalizedPath = normalizePath(path)
    const parts = normalizedPath.split('/').filter(Boolean)
    if (parts.length <= 1) return '/'
    return '/' + parts.slice(0, -1).join('/')
  }, [])

  const joinPath = useCallback((...parts: string[]): string => {
    return normalizePath(parts.join('/'))
  }, [])

  const value = {
    files,
    currentDirectory,
    loading,
    error,
    changeDirectory,
    getDirectoryContents,
    createFile: createFileItem,
    createDirectory: createDirectoryItem,
    readFile,
    writeFile,
    deleteItem,
    moveItem,
    copyItem,
    exists,
    isDirectory,
    isFile,
    getFileInfo,
    getParentDirectory,
    joinPath,
    refreshFileSystem
  }

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  )
}

export function useSupabaseFileSystem() {
  const context = useContext(FileSystemContext)
  if (context === undefined) {
    throw new Error('useSupabaseFileSystem must be used within a SupabaseFileSystemProvider')
  }
  return context
}

// Helper function to normalize paths
function normalizePath(path: string): string {
  if (!path || path === '') return '/'
  
  // Remove multiple slashes and normalize
  const normalized = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  
  // Ensure it starts with /
  return normalized.startsWith('/') ? normalized : '/' + normalized
}
