"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface FileNode {
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: { [key: string]: FileNode }
  size?: number
  modified?: Date
  created?: Date
}

export interface FileSystemContextType {
  fileSystem: { [key: string]: FileNode }
  currentPath: string
  setCurrentPath: (path: string) => void
  getNode: (path: string) => FileNode | null
  createFile: (path: string, content?: string) => boolean
  createDirectory: (path: string) => boolean
  deleteNode: (path: string) => boolean
  updateFile: (path: string, content: string) => boolean
  listDirectory: (path: string) => string[] | null
  readFile: (path: string) => string | null
  exists: (path: string) => boolean
  isDirectory: (path: string) => boolean
  isFile: (path: string) => boolean
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}

interface FileSystemProviderProps {
  children: React.ReactNode
  username?: string
}

export const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ 
  children, 
  username = 'user' 
}) => {
  const [currentPath, setCurrentPath] = useState(`/home/${username}`)
  
  const [fileSystem, setFileSystem] = useState<{ [key: string]: FileNode }>({
    '/': {
      name: '',
      type: 'directory',
      children: {
        'home': {
          name: 'home',
          type: 'directory',
          children: {
            [username]: {
              name: username,
              type: 'directory',
              children: {
                'Documents': { 
                  name: 'Documents', 
                  type: 'directory', 
                  children: {},
                  created: new Date(),
                  modified: new Date()
                },
                'Downloads': { 
                  name: 'Downloads', 
                  type: 'directory', 
                  children: {},
                  created: new Date(),
                  modified: new Date()
                },
                'Pictures': { 
                  name: 'Pictures', 
                  type: 'directory', 
                  children: {},
                  created: new Date(),
                  modified: new Date()
                },
                'Music': { 
                  name: 'Music', 
                  type: 'directory', 
                  children: {},
                  created: new Date(),
                  modified: new Date()
                },
                'Videos': { 
                  name: 'Videos', 
                  type: 'directory', 
                  children: {},
                  created: new Date(),
                  modified: new Date()
                },
                'Desktop': { 
                  name: 'Desktop', 
                  type: 'directory', 
                  children: {},
                  created: new Date(),
                  modified: new Date()
                },
                'project.txt': { 
                  name: 'project.txt',
                  type: 'file', 
                  content: `# My Ubuntu Project

This is a sample project file created in the Ubuntu OS simulator.

## Features
- Real terminal with xterm.js
- VS Code editor with Monaco
- File system simulation
- Syntax highlighting
- Multiple language support

## Getting Started
1. Open the terminal
2. Navigate through the file system
3. Edit files with this VS Code editor
4. Save your changes

Happy coding!`,
                  size: 512,
                  created: new Date(),
                  modified: new Date()
                },
                'README.md': {
                  name: 'README.md',
                  type: 'file',
                  content: `# Ubuntu OS Simulator

Welcome to the Ubuntu OS simulator built with Next.js and React!

## Features

### Terminal
- Real terminal using xterm.js
- Command history with arrow keys
- Basic Unix commands (ls, cd, pwd, cat, etc.)
- Virtual file system

### Code Editor
- Monaco Editor (VS Code engine)
- Syntax highlighting for multiple languages
- File explorer
- Tab management
- Auto-save functionality

### Desktop Environment
- Window management
- Application launcher
- System tray
- Notifications

## Usage

Use the terminal to navigate the file system and the code editor to modify files.
All changes are saved automatically.

Enjoy exploring this Ubuntu simulation!`,
                  size: 1024,
                  created: new Date(),
                  modified: new Date()
                },
                'src': {
                  name: 'src',
                  type: 'directory',
                  children: {
                    'main.js': {
                      name: 'main.js',
                      type: 'file',
                      content: `// Main application entry point
console.log('Welcome to Ubuntu OS Simulator!');

function initializeSystem() {
    console.log('Initializing system...');
    
    // Load desktop environment
    loadDesktop();
    
    // Start system services
    startServices();
    
    console.log('System ready!');
}

function loadDesktop() {
    console.log('Loading desktop environment...');
    // Desktop loading logic here
}

function startServices() {
    console.log('Starting system services...');
    // Service startup logic here
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSystem);`,
                      size: 768,
                      created: new Date(),
                      modified: new Date()
                    },
                    'utils.js': {
                      name: 'utils.js',
                      type: 'file',
                      content: `// Utility functions for the Ubuntu OS simulator

export function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}`,
                      size: 896,
                      created: new Date(),
                      modified: new Date()
                    }
                  },
                  created: new Date(),
                  modified: new Date()
                }
              },
              created: new Date(),
              modified: new Date()
            }
          },
          created: new Date(),
          modified: new Date()
        },
        'usr': {
          name: 'usr',
          type: 'directory',
          children: {
            'bin': { name: 'bin', type: 'directory', children: {}, created: new Date(), modified: new Date() },
            'lib': { name: 'lib', type: 'directory', children: {}, created: new Date(), modified: new Date() }
          },
          created: new Date(),
          modified: new Date()
        },
        'etc': {
          name: 'etc',
          type: 'directory',
          children: {
            'passwd': { 
              name: 'passwd',
              type: 'file', 
              content: `root:x:0:0:root:/root:/bin/bash\n${username}:x:1000:1000:${username}:/home/${username}:/bin/bash\n`,
              size: 128,
              created: new Date(),
              modified: new Date()
            }
          },
          created: new Date(),
          modified: new Date()
        }
      },
      created: new Date(),
      modified: new Date()
    }
  })

  const normalizePath = (path: string): string => {
    if (path === '') return '/'
    if (!path.startsWith('/')) path = '/' + path
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }

  const getNode = useCallback((path: string): FileNode | null => {
    const normalizedPath = normalizePath(path)
    if (normalizedPath === '/') return fileSystem['/']
    
    const parts = normalizedPath.split('/').filter(Boolean)
    let current = fileSystem['/']
    
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part]
      } else {
        return null
      }
    }
    return current
  }, [fileSystem])

  const exists = useCallback((path: string): boolean => {
    return getNode(path) !== null
  }, [getNode])

  const isDirectory = useCallback((path: string): boolean => {
    const node = getNode(path)
    return node?.type === 'directory'
  }, [getNode])

  const isFile = useCallback((path: string): boolean => {
    const node = getNode(path)
    return node?.type === 'file'
  }, [getNode])

  const listDirectory = useCallback((path: string): string[] | null => {
    const node = getNode(path)
    if (node?.type === 'directory' && node.children) {
      return Object.keys(node.children)
    }
    return null
  }, [getNode])

  const readFile = useCallback((path: string): string | null => {
    const node = getNode(path)
    if (node?.type === 'file') {
      return node.content || ''
    }
    return null
  }, [getNode])

  const updateFile = useCallback((path: string, content: string): boolean => {
    const normalizedPath = normalizePath(path)
    const parts = normalizedPath.split('/').filter(Boolean)
    
    setFileSystem(prev => {
      const newFileSystem = { ...prev }
      let current = newFileSystem['/']
      
      // Navigate to parent directory
      for (let i = 0; i < parts.length - 1; i++) {
        if (current.children && current.children[parts[i]]) {
          current.children = { ...current.children }
          current = current.children[parts[i]]
        } else {
          return prev // Path doesn't exist
        }
      }
      
      const fileName = parts[parts.length - 1]
      if (current.children && current.children[fileName] && current.children[fileName].type === 'file') {
        current.children = { ...current.children }
        current.children[fileName] = {
          ...current.children[fileName],
          content,
          size: content.length,
          modified: new Date()
        }
        return newFileSystem
      }
      
      return prev
    })
    
    return true
  }, [])

  const createFile = useCallback((path: string, content = ''): boolean => {
    const normalizedPath = normalizePath(path)
    const parts = normalizedPath.split('/').filter(Boolean)
    const fileName = parts[parts.length - 1]
    
    setFileSystem(prev => {
      const newFileSystem = { ...prev }
      let current = newFileSystem['/']
      
      // Navigate to parent directory
      for (let i = 0; i < parts.length - 1; i++) {
        if (current.children && current.children[parts[i]]) {
          current.children = { ...current.children }
          current = current.children[parts[i]]
        } else {
          return prev // Path doesn't exist
        }
      }
      
      if (current.children) {
        current.children = { ...current.children }
        current.children[fileName] = {
          name: fileName,
          type: 'file',
          content,
          size: content.length,
          created: new Date(),
          modified: new Date()
        }
      }
      
      return newFileSystem
    })
    
    return true
  }, [])

  const createDirectory = useCallback((path: string): boolean => {
    const normalizedPath = normalizePath(path)
    const parts = normalizedPath.split('/').filter(Boolean)
    const dirName = parts[parts.length - 1]
    
    setFileSystem(prev => {
      const newFileSystem = { ...prev }
      let current = newFileSystem['/']
      
      // Navigate to parent directory
      for (let i = 0; i < parts.length - 1; i++) {
        if (current.children && current.children[parts[i]]) {
          current.children = { ...current.children }
          current = current.children[parts[i]]
        } else {
          return prev // Path doesn't exist
        }
      }
      
      if (current.children) {
        current.children = { ...current.children }
        current.children[dirName] = {
          name: dirName,
          type: 'directory',
          children: {},
          created: new Date(),
          modified: new Date()
        }
      }
      
      return newFileSystem
    })
    
    return true
  }, [])

  const deleteNode = useCallback((path: string): boolean => {
    const normalizedPath = normalizePath(path)
    const parts = normalizedPath.split('/').filter(Boolean)
    const nodeName = parts[parts.length - 1]
    
    setFileSystem(prev => {
      const newFileSystem = { ...prev }
      let current = newFileSystem['/']
      
      // Navigate to parent directory
      for (let i = 0; i < parts.length - 1; i++) {
        if (current.children && current.children[parts[i]]) {
          current.children = { ...current.children }
          current = current.children[parts[i]]
        } else {
          return prev // Path doesn't exist
        }
      }
      
      if (current.children && current.children[nodeName]) {
        current.children = { ...current.children }
        delete current.children[nodeName]
      }
      
      return newFileSystem
    })
    
    return true
  }, [])

  const value: FileSystemContextType = {
    fileSystem,
    currentPath,
    setCurrentPath,
    getNode,
    createFile,
    createDirectory,
    deleteNode,
    updateFile,
    listDirectory,
    readFile,
    exists,
    isDirectory,
    isFile
  }

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  )
}
