'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSupabaseAuth } from './SupabaseAuthContext'
import { useSupabaseFileSystem } from './SupabaseFileSystemContext'
import { 
  supabase, 
  saveTerminalSession, 
  getTerminalSession,
  subscribeToTerminalSession 
} from '@/lib/supabase'

interface TerminalSession {
  id: string
  user_id: string
  session_name: string
  current_directory: string
  environment_vars: Record<string, string>
  command_history: string[]
  session_state: any
  is_active: boolean
  created_at: string
  last_activity: string
}

interface TerminalContextType {
  session: TerminalSession | null
  currentDirectory: string
  commandHistory: string[]
  environmentVars: Record<string, string>
  loading: boolean
  
  // Terminal operations
  executeCommand: (command: string) => Promise<string>
  addToHistory: (command: string) => void
  changeDirectory: (path: string) => Promise<boolean>
  setEnvironmentVar: (key: string, value: string) => void
  getEnvironmentVar: (key: string) => string | undefined
  
  // Session management
  saveSession: () => Promise<void>
  loadSession: (sessionId?: string) => Promise<void>
  createNewSession: (name?: string) => Promise<void>
  
  // Built-in commands
  listFiles: (path?: string) => string
  printWorkingDirectory: () => string
  makeDirectory: (path: string) => Promise<string>
  removeFile: (path: string) => Promise<string>
  copyFile: (source: string, dest: string) => Promise<string>
  moveFile: (source: string, dest: string) => Promise<string>
  catFile: (path: string) => Promise<string>
  echoText: (text: string, path?: string) => Promise<string>
  touchFile: (path: string) => Promise<string>
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined)

export function SupabaseTerminalProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useSupabaseAuth()
  const fileSystem = useSupabaseFileSystem()
  const [session, setSession] = useState<TerminalSession | null>(null)
  const [currentDirectory, setCurrentDirectory] = useState('/')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [environmentVars, setEnvironmentVars] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize terminal session when user changes
  useEffect(() => {
    if (user && userProfile) {
      setCurrentDirectory(userProfile.home_directory)
      setEnvironmentVars({
        HOME: userProfile.home_directory,
        USER: userProfile.username,
        SHELL: userProfile.shell,
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin',
        PWD: userProfile.home_directory
      })
      loadSession()

      // Subscribe to real-time terminal updates
      const subscription = subscribeToTerminalSession(user.id, (payload) => {
        console.log('Terminal session update:', payload)
        if (payload.new && payload.new.id === session?.id) {
          setSession(payload.new)
          setCurrentDirectory(payload.new.current_directory)
          setCommandHistory(payload.new.command_history ? payload.new.command_history.split('\n').filter(Boolean) : [])
          setEnvironmentVars(payload.new.environment_vars || {})
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setSession(null)
      setCurrentDirectory('/')
      setCommandHistory([])
      setEnvironmentVars({})
    }
  }, [user, userProfile])

  const loadSession = useCallback(async (sessionId?: string) => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await getTerminalSession(user.id, sessionId)
      
      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error loading terminal session:', error)
      } else if (data) {
        setSession(data)
        setCurrentDirectory(data.current_directory)
        setCommandHistory(data.command_history ? data.command_history.split('\n').filter(Boolean) : [])
        setEnvironmentVars(data.environment_vars || {})
      } else {
        // Create new session if none exists
        await createNewSession()
      }
    } catch (err) {
      console.error('Terminal session load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const saveSession = useCallback(async () => {
    if (!user || !session) return

    try {
      const sessionData = {
        id: session.id,
        session_name: session.session_name,
        current_directory: currentDirectory,
        environment_vars: environmentVars,
        command_history: commandHistory.join('\n'),
        session_state: {},
        is_active: true,
        last_activity: new Date().toISOString()
      }

      await saveTerminalSession(user.id, sessionData)
    } catch (err) {
      console.error('Error saving terminal session:', err)
    }
  }, [user, session, currentDirectory, environmentVars, commandHistory])

  const createNewSession = useCallback(async (name: string = 'main') => {
    if (!user || !userProfile) return

    const newSession: Partial<TerminalSession> = {
      user_id: user.id,
      session_name: name,
      current_directory: userProfile.home_directory,
      environment_vars: {
        HOME: userProfile.home_directory,
        USER: userProfile.username,
        SHELL: userProfile.shell,
        PATH: '/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin',
        PWD: userProfile.home_directory
      },
      command_history: '',
      session_state: {},
      is_active: true
    }

    try {
      const { data, error } = await saveTerminalSession(user.id, newSession)
      if (error) {
        console.error('Error creating terminal session:', error)
      } else if (data) {
        setSession(data)
        setCurrentDirectory(data.current_directory)
        setCommandHistory([])
        setEnvironmentVars(data.environment_vars || {})
      }
    } catch (err) {
      console.error('Error creating terminal session:', err)
    }
  }, [user, userProfile])

  const addToHistory = useCallback((command: string) => {
    setCommandHistory(prev => {
      const newHistory = [...prev, command]
      // Keep only last 1000 commands
      return newHistory.slice(-1000)
    })
  }, [])

  const changeDirectory = useCallback(async (path: string): Promise<boolean> => {
    let targetPath = path

    // Handle relative paths
    if (!path.startsWith('/')) {
      targetPath = fileSystem.joinPath(currentDirectory, path)
    }

    // Handle special cases
    if (path === '~') {
      targetPath = environmentVars.HOME || '/home/user'
    } else if (path === '..') {
      targetPath = fileSystem.getParentDirectory(currentDirectory)
    } else if (path === '.') {
      targetPath = currentDirectory
    }

    if (fileSystem.exists(targetPath) && fileSystem.isDirectory(targetPath)) {
      setCurrentDirectory(targetPath)
      setEnvironmentVars(prev => ({ ...prev, PWD: targetPath }))
      return true
    }

    return false
  }, [currentDirectory, environmentVars, fileSystem])

  const setEnvironmentVar = useCallback((key: string, value: string) => {
    setEnvironmentVars(prev => ({ ...prev, [key]: value }))
  }, [])

  const getEnvironmentVar = useCallback((key: string): string | undefined => {
    return environmentVars[key]
  }, [environmentVars])

  // Built-in command implementations
  const listFiles = useCallback((path?: string): string => {
    const targetPath = path || currentDirectory
    const contents = fileSystem.getDirectoryContents(targetPath)
    
    if (contents.length === 0) {
      return ''
    }

    return contents.map(item => {
      const permissions = item.permissions || '644'
      const size = item.size.toString().padStart(8)
      const date = new Date(item.modified_at).toLocaleDateString()
      const name = item.type === 'directory' ? `${item.name}/` : item.name
      return `${permissions} ${size} ${date} ${name}`
    }).join('\n')
  }, [currentDirectory, fileSystem])

  const printWorkingDirectory = useCallback((): string => {
    return currentDirectory
  }, [currentDirectory])

  const makeDirectory = useCallback(async (path: string): Promise<string> => {
    let targetPath = path
    if (!path.startsWith('/')) {
      targetPath = fileSystem.joinPath(currentDirectory, path)
    }

    const result = await fileSystem.createDirectory(targetPath)
    return result ? `Directory created: ${targetPath}` : `Failed to create directory: ${targetPath}`
  }, [currentDirectory, fileSystem])

  const removeFile = useCallback(async (path: string): Promise<string> => {
    let targetPath = path
    if (!path.startsWith('/')) {
      targetPath = fileSystem.joinPath(currentDirectory, path)
    }

    const success = await fileSystem.deleteItem(targetPath)
    return success ? `Removed: ${targetPath}` : `Failed to remove: ${targetPath}`
  }, [currentDirectory, fileSystem])

  const copyFile = useCallback(async (source: string, dest: string): Promise<string> => {
    let sourcePath = source
    let destPath = dest

    if (!source.startsWith('/')) {
      sourcePath = fileSystem.joinPath(currentDirectory, source)
    }
    if (!dest.startsWith('/')) {
      destPath = fileSystem.joinPath(currentDirectory, dest)
    }

    const success = await fileSystem.copyItem(sourcePath, destPath)
    return success ? `Copied: ${sourcePath} -> ${destPath}` : `Failed to copy: ${sourcePath} -> ${destPath}`
  }, [currentDirectory, fileSystem])

  const moveFile = useCallback(async (source: string, dest: string): Promise<string> => {
    let sourcePath = source
    let destPath = dest

    if (!source.startsWith('/')) {
      sourcePath = fileSystem.joinPath(currentDirectory, source)
    }
    if (!dest.startsWith('/')) {
      destPath = fileSystem.joinPath(currentDirectory, dest)
    }

    const success = await fileSystem.moveItem(sourcePath, destPath)
    return success ? `Moved: ${sourcePath} -> ${destPath}` : `Failed to move: ${sourcePath} -> ${destPath}`
  }, [currentDirectory, fileSystem])

  const catFile = useCallback(async (path: string): Promise<string> => {
    let targetPath = path
    if (!path.startsWith('/')) {
      targetPath = fileSystem.joinPath(currentDirectory, path)
    }

    const content = await fileSystem.readFile(targetPath)
    return content || `cat: ${targetPath}: No such file or directory`
  }, [currentDirectory, fileSystem])

  const echoText = useCallback(async (text: string, path?: string): Promise<string> => {
    if (path) {
      let targetPath = path
      if (!path.startsWith('/')) {
        targetPath = fileSystem.joinPath(currentDirectory, path)
      }

      const success = await fileSystem.writeFile(targetPath, text)
      return success ? `Text written to: ${targetPath}` : `Failed to write to: ${targetPath}`
    }

    return text
  }, [currentDirectory, fileSystem])

  const touchFile = useCallback(async (path: string): Promise<string> => {
    let targetPath = path
    if (!path.startsWith('/')) {
      targetPath = fileSystem.joinPath(currentDirectory, path)
    }

    if (fileSystem.exists(targetPath)) {
      // File exists, just update timestamp (simulated)
      return `Updated timestamp: ${targetPath}`
    } else {
      // Create new empty file
      const result = await fileSystem.createFile(targetPath, '')
      return result ? `Created file: ${targetPath}` : `Failed to create file: ${targetPath}`
    }
  }, [currentDirectory, fileSystem])

  const executeCommand = useCallback(async (command: string): Promise<string> => {
    const trimmedCommand = command.trim()
    if (!trimmedCommand) return ''

    addToHistory(trimmedCommand)

    const parts = trimmedCommand.split(' ')
    const cmd = parts[0]
    const args = parts.slice(1)

    try {
      switch (cmd) {
        case 'ls':
          return listFiles(args[0])
        
        case 'pwd':
          return printWorkingDirectory()
        
        case 'cd':
          const success = await changeDirectory(args[0] || environmentVars.HOME || '/')
          return success ? '' : `cd: ${args[0]}: No such file or directory`
        
        case 'mkdir':
          if (!args[0]) return 'mkdir: missing operand'
          return await makeDirectory(args[0])
        
        case 'rm':
          if (!args[0]) return 'rm: missing operand'
          return await removeFile(args[0])
        
        case 'cp':
          if (args.length < 2) return 'cp: missing operand'
          return await copyFile(args[0], args[1])
        
        case 'mv':
          if (args.length < 2) return 'mv: missing operand'
          return await moveFile(args[0], args[1])
        
        case 'cat':
          if (!args[0]) return 'cat: missing operand'
          return await catFile(args[0])
        
        case 'echo':
          const text = args.join(' ')
          const outputRedirect = text.includes(' > ')
          if (outputRedirect) {
            const [content, filePath] = text.split(' > ')
            return await echoText(content.trim(), filePath.trim())
          }
          return await echoText(text)
        
        case 'touch':
          if (!args[0]) return 'touch: missing operand'
          return await touchFile(args[0])
        
        case 'whoami':
          return environmentVars.USER || 'user'
        
        case 'date':
          return new Date().toString()
        
        case 'clear':
          return '\x1b[2J\x1b[H' // ANSI escape codes for clear screen
        
        case 'help':
          return `Available commands:
ls [path]     - List directory contents
pwd           - Print working directory
cd [path]     - Change directory
mkdir <path>  - Create directory
rm <path>     - Remove file or directory
cp <src> <dst> - Copy file or directory
mv <src> <dst> - Move/rename file or directory
cat <file>    - Display file contents
echo <text>   - Display text or write to file (echo "text" > file)
touch <file>  - Create empty file or update timestamp
whoami        - Display current user
date          - Display current date and time
clear         - Clear terminal screen
help          - Show this help message`
        
        default:
          return `${cmd}: command not found`
      }
    } catch (error) {
      console.error('Command execution error:', error)
      return `Error executing command: ${cmd}`
    }
  }, [addToHistory, listFiles, printWorkingDirectory, changeDirectory, makeDirectory, removeFile, copyFile, moveFile, catFile, echoText, touchFile, environmentVars])

  // Auto-save session periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (session) {
        saveSession()
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [session, saveSession])

  const value = {
    session,
    currentDirectory,
    commandHistory,
    environmentVars,
    loading,
    executeCommand,
    addToHistory,
    changeDirectory,
    setEnvironmentVar,
    getEnvironmentVar,
    saveSession,
    loadSession,
    createNewSession,
    listFiles,
    printWorkingDirectory,
    makeDirectory,
    removeFile,
    copyFile,
    moveFile,
    catFile,
    echoText,
    touchFile
  }

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  )
}

export function useSupabaseTerminal() {
  const context = useContext(TerminalContext)
  if (context === undefined) {
    throw new Error('useSupabaseTerminal must be used within a SupabaseTerminalProvider')
  }
  return context
}
