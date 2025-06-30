"use client"

import React, { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useFileSystem } from '@/contexts/FileSystemContext'

interface XTerminalProps {
  className?: string
  username?: string
}

const XTerminal: React.FC<XTerminalProps> = ({ className = '', username = 'user' }) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal | null>(null)
  const commandHistory = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const currentCommand = useRef('')

  // Use shared file system context
  const {
    currentPath,
    setCurrentPath,
    listDirectory,
    readFile,
    exists,
    isDirectory,
    isFile
  } = useFileSystem()

  const executeCommand = (command: string) => {
    const args = command.trim().split(/\s+/)
    const cmd = args[0]

    switch (cmd) {
      case 'ls':
        const lsPath = args[1] || currentPath
        const items = listDirectory(lsPath)
        if (items) {
          terminal.current?.writeln(items.join('  '))
        } else {
          terminal.current?.writeln(`ls: cannot access '${lsPath}': No such file or directory`)
        }
        break

      case 'pwd':
        terminal.current?.writeln(currentPath)
        break

      case 'cd':
        const newPath = args[1] || `/home/${username}`
        if (newPath === '..') {
          const parts = currentPath.split('/').filter(Boolean)
          parts.pop()
          const parentPath = '/' + parts.join('/') || '/'
          if (isDirectory(parentPath)) {
            setCurrentPath(parentPath)
          }
        } else if (newPath.startsWith('/')) {
          if (isDirectory(newPath)) {
            setCurrentPath(newPath)
          } else {
            terminal.current?.writeln(`cd: ${newPath}: No such file or directory`)
          }
        } else {
          const fullPath = currentPath === '/' ? `/${newPath}` : `${currentPath}/${newPath}`
          if (isDirectory(fullPath)) {
            setCurrentPath(fullPath)
          } else {
            terminal.current?.writeln(`cd: ${newPath}: No such file or directory`)
          }
        }
        break

      case 'cat':
        if (args[1]) {
          const filePath = args[1].startsWith('/') ? args[1] : `${currentPath}/${args[1]}`
          const content = readFile(filePath)
          if (content !== null) {
            terminal.current?.writeln(content)
          } else {
            terminal.current?.writeln(`cat: ${args[1]}: No such file or directory`)
          }
        } else {
          terminal.current?.writeln('cat: missing file operand')
        }
        break
        
      case 'echo':
        terminal.current?.writeln(args.slice(1).join(' '))
        break
        
      case 'whoami':
        terminal.current?.writeln(username)
        break
        
      case 'date':
        terminal.current?.writeln(new Date().toString())
        break
        
      case 'clear':
        terminal.current?.clear()
        break
        
      case 'help':
        terminal.current?.writeln('Available commands:')
        terminal.current?.writeln('  ls [path]     - list directory contents')
        terminal.current?.writeln('  cd [path]     - change directory')
        terminal.current?.writeln('  pwd           - print working directory')
        terminal.current?.writeln('  cat [file]    - display file contents')
        terminal.current?.writeln('  echo [text]   - display text')
        terminal.current?.writeln('  whoami        - display current user')
        terminal.current?.writeln('  date          - display current date')
        terminal.current?.writeln('  clear         - clear terminal')
        terminal.current?.writeln('  help          - show this help')
        break
        
      default:
        if (cmd) {
          terminal.current?.writeln(`${cmd}: command not found`)
        }
    }
  }

  const writePrompt = () => {
    const prompt = `\x1b[32m${username}@ubuntu\x1b[0m:\x1b[34m${currentPath}\x1b[0m$ `
    terminal.current?.write(prompt)
  }

  useEffect(() => {
    if (terminalRef.current && !terminal.current) {
      terminal.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        theme: {
          background: '#300a24',
          foreground: '#ffffff',
          cursor: '#ffffff',
        },
        cols: 80,
        rows: 24,
      })

      terminal.current.open(terminalRef.current)
      
      // Welcome message
      terminal.current.writeln('\x1b[1;32mWelcome to Ubuntu 24.04 LTS Terminal Simulator\x1b[0m')
      terminal.current.writeln('Type "help" for available commands.')
      terminal.current.writeln('')
      
      writePrompt()

      let currentLine = ''

      terminal.current.onData((data) => {
        const code = data.charCodeAt(0)
        
        if (code === 13) { // Enter
          terminal.current?.writeln('')
          if (currentLine.trim()) {
            commandHistory.current.push(currentLine)
            historyIndex.current = commandHistory.current.length
            executeCommand(currentLine)
          }
          currentLine = ''
          writePrompt()
        } else if (code === 127) { // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1)
            terminal.current?.write('\b \b')
          }
        } else if (code === 27) { // Escape sequences (arrow keys)
          // Handle arrow keys for command history
          if (data === '\x1b[A') { // Up arrow
            if (historyIndex.current > 0) {
              // Clear current line
              terminal.current?.write('\r')
              writePrompt()
              terminal.current?.write(' '.repeat(currentLine.length))
              terminal.current?.write('\r')
              writePrompt()
              
              historyIndex.current--
              currentLine = commandHistory.current[historyIndex.current]
              terminal.current?.write(currentLine)
            }
          } else if (data === '\x1b[B') { // Down arrow
            if (historyIndex.current < commandHistory.current.length - 1) {
              // Clear current line
              terminal.current?.write('\r')
              writePrompt()
              terminal.current?.write(' '.repeat(currentLine.length))
              terminal.current?.write('\r')
              writePrompt()
              
              historyIndex.current++
              currentLine = commandHistory.current[historyIndex.current]
              terminal.current?.write(currentLine)
            } else if (historyIndex.current === commandHistory.current.length - 1) {
              // Clear current line
              terminal.current?.write('\r')
              writePrompt()
              terminal.current?.write(' '.repeat(currentLine.length))
              terminal.current?.write('\r')
              writePrompt()
              
              historyIndex.current = commandHistory.current.length
              currentLine = ''
            }
          }
        } else if (code >= 32) { // Printable characters
          currentLine += data
          terminal.current?.write(data)
        }
      })
    }

    return () => {
      if (terminal.current) {
        terminal.current.dispose()
        terminal.current = null
      }
    }
  }, [username])

  return (
    <div className={`h-full bg-gray-900 ${className}`}>
      <div ref={terminalRef} className="h-full p-2" />
    </div>
  )
}

export default XTerminal
