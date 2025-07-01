"use client"

import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useFileSystem, type FileNode } from '@/contexts/FileSystemContext'
import {
  File,
  Folder,
  FolderOpen,
  Search,
  Settings,
  GitBranch,
  Bug,
  Play,
  Save,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

interface VSCodeEditorProps {
  className?: string
  username?: string
}

const VSCodeEditor: React.FC<VSCodeEditorProps> = ({ className = '', username = 'user' }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({})
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/home/' + username, '/home/' + username + '/src']))
  const [editorError, setEditorError] = useState<string | null>(null)

  // Use shared file system context
  const { readFile, updateFile, getNode } = useFileSystem()

  // Error boundary for Monaco Editor
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('monaco') || event.message.includes('ChunkLoadError')) {
        setEditorError('Failed to load Monaco Editor. Please refresh the page.')
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  // Helper function to build file tree from shared file system
  const buildFileTree = (node: FileNode | null, path: string): { [key: string]: any } => {
    if (!node || node.type !== 'directory' || !node.children) return {}

    const result: { [key: string]: any } = {}
    Object.entries(node.children).forEach(([name, childNode]) => {
      result[name] = {
        name,
        type: childNode.type === 'directory' ? 'folder' : 'file',
        content: childNode.content,
        isOpen: expandedFolders.has(`${path}/${name}`),
        children: childNode.type === 'directory' ? buildFileTree(childNode, `${path}/${name}`) : undefined
      }
    })
    return result
  }

  const currentFileSystem = buildFileTree(getNode(`/home/${username}`), `/home/${username}`)


  const getFileIcon = (fileName: string, isFolder: boolean, isOpen?: boolean) => {
    if (isFolder) {
      return isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
        return <div className="w-4 h-4 bg-yellow-500 rounded text-xs flex items-center justify-center text-white font-bold">JS</div>
      case 'ts':
      case 'tsx':
        return <div className="w-4 h-4 bg-blue-500 rounded text-xs flex items-center justify-center text-white font-bold">TS</div>
      case 'md':
        return <div className="w-4 h-4 bg-gray-600 rounded text-xs flex items-center justify-center text-white font-bold">MD</div>
      case 'json':
        return <div className="w-4 h-4 bg-green-500 rounded text-xs flex items-center justify-center text-white font-bold">JSON</div>
      default:
        return <File className="w-4 h-4" />
    }
  }

  const getLanguageFromFileName = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'md':
        return 'markdown'
      case 'json':
        return 'json'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'py':
        return 'python'
      default:
        return 'plaintext'
    }
  }

  const openFile = (filePath: string) => {
    const fullPath = filePath.startsWith('/') ? filePath : `/home/${username}/${filePath}`
    const content = readFile(fullPath)

    if (content !== null) {
      if (!openTabs.includes(fullPath)) {
        setOpenTabs(prev => [...prev, fullPath])
      }
      setActiveFile(fullPath)
      if (!fileContents[fullPath]) {
        setFileContents(prev => ({ ...prev, [fullPath]: content }))
      }
    }
  }

  const closeTab = (filePath: string) => {
    setOpenTabs(prev => prev.filter(tab => tab !== filePath))
    if (activeFile === filePath) {
      const remainingTabs = openTabs.filter(tab => tab !== filePath)
      setActiveFile(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null)
    }
  }

  const toggleFolder = (folderPath: string) => {
    const fullPath = folderPath.startsWith('/') ? folderPath : `/home/${username}/${folderPath}`
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fullPath)) {
        newSet.delete(fullPath)
      } else {
        newSet.add(fullPath)
      }
      return newSet
    })
  }

  const renderFileTree = (nodes: { [key: string]: any }, basePath = '') => {
    return Object.entries(nodes).map(([name, node]) => {
      const fullPath = basePath ? `${basePath}/${name}` : name

      if (node.type === 'folder') {
        const isOpen = expandedFolders.has(fullPath.startsWith('/') ? fullPath : `/home/${username}/${fullPath}`)
        return (
          <div key={fullPath}>
            <div
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => toggleFolder(fullPath)}
            >
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {getFileIcon(name, true, isOpen)}
              <span>{name}</span>
            </div>
            {isOpen && node.children && (
              <div className="ml-4">
                {renderFileTree(node.children, fullPath)}
              </div>
            )}
          </div>
        )
      } else {
        return (
          <div
            key={fullPath}
            className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm ml-4 ${
              activeFile === fullPath ? 'bg-blue-100' : ''
            }`}
            onClick={() => openFile(fullPath)}
          >
            {getFileIcon(name, false)}
            <span>{name}</span>
          </div>
        )
      }
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      setFileContents(prev => ({ ...prev, [activeFile]: value }))
      // Auto-save to shared file system
      updateFile(activeFile, value)
    }
  }

  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="flex flex-col bg-gray-100 border-r" style={{ width: sidebarWidth }}>
          {/* Sidebar Header */}
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm">EXPLORER</h3>
          </div>
          
          {/* File Tree */}
          <div className="flex-1 overflow-auto">
            {renderFileTree(currentFileSystem)}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        {openTabs.length > 0 && (
          <div className="flex bg-gray-200 border-b overflow-x-auto">
            {openTabs.map(tab => (
              <div
                key={tab}
                className={`flex items-center gap-2 px-3 py-2 border-r cursor-pointer text-sm ${
                  activeFile === tab ? 'bg-white' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveFile(tab)}
              >
                {getFileIcon(tab.split('/').pop() || '', false)}
                <span>{tab.split('/').pop()}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab)
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1">
          {editorError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Editor Error</p>
                <p className="text-sm">{editorError}</p>
                <Button
                  onClick={() => setEditorError(null)}
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : activeFile ? (
            <Editor
              height="100%"
              language={getLanguageFromFileName(activeFile)}
              value={fileContents[activeFile] || ''}
              onChange={handleEditorChange}
              theme="vs-dark"
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading Monaco Editor...</p>
                  </div>
                </div>
              }
              onMount={() => setEditorError(null)}
              onValidate={(markers) => {
                if (markers.length > 0) {
                  console.log('Editor validation markers:', markers)
                }
              }}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No file selected</p>
                <p className="text-sm">Open a file from the explorer to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VSCodeEditor
