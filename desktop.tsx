"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { FileSystemProvider } from '@/contexts/FileSystemContext'
import { WallpaperProvider, useWallpaper } from '@/contexts/WallpaperContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Dynamically import components to avoid SSR issues
const XTerminal = dynamic(() => import('@/components/XTerminal'), { ssr: false })
const VSCodeEditor = dynamic(() => import('@/components/VSCodeEditor'), { ssr: false })
const WallpaperSettings = dynamic(() => import('@/components/WallpaperSettings'), { ssr: false })
const AuthScreen = dynamic(() => import('@/components/auth/AuthScreen'), { ssr: false })
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Activity,
  AppWindow,
  Battery,
  Calendar,
  Code,
  FileText,
  Folder,
  Globe,
  Grid3X3,
  HardDrive,
  Home,
  ImageIcon,
  Maximize2,
  Minimize2,
  Monitor,
  Music,
  Network,
  Play,
  Search,
  Settings,
  Terminal,
  Trash2,
  User,
  Volume2,
  Wifi,
  X,
  Zap,
  ChevronRight,
} from "lucide-react"

type SystemState = "loading" | "desktop"

interface Application {
  id: string
  name: string
  icon: React.ReactNode
  component: React.ReactNode
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMaximized: boolean
}

interface FileItem {
  name: string
  type: "folder" | "file"
  icon: React.ReactNode
  size?: string
  modified?: string
}

// Desktop content component that uses wallpaper context
function DesktopContent() {
  const { currentWallpaper } = useWallpaper()
  const { isAuthenticated, currentUser } = useAuth()
  const [systemState, setSystemState] = useState<SystemState>("loading")

  // Loading state
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [bootMessages, setBootMessages] = useState<string[]>([])



  // Desktop state
  const [currentTime, setCurrentTime] = useState(new Date())
  const [applications, setApplications] = useState<Application[]>([])
  const [showApplications, setShowApplications] = useState(false)
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [dockHover, setDockHover] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const dragRef = useRef<{ appId: string; startX: number; startY: number } | null>(null)

  // Responsive state
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Theme and customization state
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState("")
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "System Update",
      message: "Ubuntu 24.04 LTS is available",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      type: "success",
      title: "Backup Complete",
      message: "Your files have been backed up successfully",
      timestamp: "1 hour ago",
    },
  ])

  // Widgets state
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "weather",
      type: "weather" as const,
      position: { x: screenSize.width - 320, y: 80 },
      size: { width: 280, height: 120 },
    },
    {
      id: "system-monitor",
      type: "system-monitor" as const,
      position: { x: screenSize.width - 320, y: 220 },
      size: { width: 280, height: 100 },
    },
  ])

  // Search results state
  const [searchResults, setSearchResults] = useState<{
    applications: Array<{
      name: string;
      icon: React.ReactNode;
      color: string;
      onClick: () => void;
    }>;
    files: Array<{
      name: string;
      type: "folder" | "file";
      icon: React.ReactNode;
      size?: string;
      modified?: string;
      path?: string;
    }>;
    settings: Array<{
      name: string;
      description: string;
    }>;
  }>({
    applications: [],
    files: [],
    settings: [],
  })

  // Enhanced user settings with theme support
  const [userSettings, setUserSettings] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    theme: "auto",
    accentColor: "blue",
    iconStyle: "rounded",
  })



  // Screen size detection
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
      setIsMobile(window.innerWidth < 768)
    }

    updateScreenSize()
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // Boot sequence effect
  useEffect(() => {
    if (systemState === "loading") {
      const messages = [
        "Loading Linux kernel...",
        "Initializing hardware...",
        "Starting system services...",
        "Loading Ubuntu desktop environment...",
        "Preparing user interface...",
        "Almost ready...",
      ]

      let messageIndex = 0
      let progress = 0

      const bootInterval = setInterval(() => {
        progress += Math.random() * 12 + 8
        setLoadingProgress(Math.min(progress, 100))

        if (messageIndex < messages.length && progress > (messageIndex + 1) * 16) {
          setBootMessages((prev) => [...prev, messages[messageIndex]])
          messageIndex++
        }

        if (progress >= 100) {
          clearInterval(bootInterval)
          setTimeout(() => setSystemState("desktop"), 1000)
        }
      }, 300)

      return () => clearInterval(bootInterval)
    }
  }, [systemState])

  // Clock effect
  useEffect(() => {
    if (systemState === "desktop") {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(timer)
    }
  }, [systemState])

  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setApplications([])
    setActiveApp(null)
  }

  const CalculatorApp = () => {
    const [display, setDisplay] = useState("0")
    const [previousValue, setPreviousValue] = useState<number | null>(null)
    const [operation, setOperation] = useState<string | null>(null)
    const [waitingForOperand, setWaitingForOperand] = useState(false)

    const calculate = (firstOperand: number, secondOperand: number, operation: string): number => {
      switch (operation) {
        case "+":
          return firstOperand + secondOperand
        case "-":
          return firstOperand - secondOperand
        case "×":
          return firstOperand * secondOperand
        case "÷":
          return secondOperand !== 0 ? firstOperand / secondOperand : 0
        default:
          return secondOperand
      }
    }

    const inputNumber = (num: string) => {
      if (waitingForOperand) {
        setDisplay(num)
        setWaitingForOperand(false)
      } else {
        setDisplay(display === "0" ? num : display + num)
      }
    }

    const inputOperation = (nextOperation: string) => {
      const inputValue = Number.parseFloat(display)

      if (previousValue === null) {
        setPreviousValue(inputValue)
      } else if (operation) {
        const currentValue = previousValue || 0
        const newValue = calculate(currentValue, inputValue, operation)

        setDisplay(String(newValue))
        setPreviousValue(newValue)
      }

      setWaitingForOperand(true)
      setOperation(nextOperation)
    }

    const performCalculation = () => {
      const inputValue = Number.parseFloat(display)

      if (previousValue !== null && operation) {
        const newValue = calculate(previousValue, inputValue, operation)
        setDisplay(String(newValue))
        setPreviousValue(null)
        setOperation(null)
        setWaitingForOperand(true)
      }
    }

    const clear = () => {
      setDisplay("0")
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(false)
    }

    return (
      <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gray-900 text-white p-6 text-right">
            <div className="text-3xl font-mono">{display}</div>
          </div>
          <div className="grid grid-cols-4 gap-1 p-4">
            {[
              { label: "C", onClick: clear, className: "bg-red-500 hover:bg-red-600 text-white" },
              { label: "±", onClick: () => {}, className: "bg-gray-300 hover:bg-gray-400" },
              { label: "%", onClick: () => {}, className: "bg-gray-300 hover:bg-gray-400" },
              {
                label: "÷",
                onClick: () => inputOperation("÷"),
                className: "bg-orange-500 hover:bg-orange-600 text-white",
              },
              { label: "7", onClick: () => inputNumber("7"), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "8", onClick: () => inputNumber("8"), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "9", onClick: () => inputNumber("9"), className: "bg-gray-200 hover:bg-gray-300" },
              {
                label: "×",
                onClick: () => inputOperation("×"),
                className: "bg-orange-500 hover:bg-orange-600 text-white",
              },
              { label: "4", onClick: () => inputNumber("4"), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "5", onClick: () => inputNumber("5"), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "6", onClick: () => inputNumber("6"), className: "bg-gray-200 hover:bg-gray-300" },
              {
                label: "-",
                onClick: () => inputOperation("-"),
                className: "bg-orange-500 hover:bg-orange-600 text-white",
              },
              { label: "1", onClick: () => inputNumber("1"), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "2", onClick: () => inputNumber("2"), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "3", onClick: () => inputNumber("3"), className: "bg-gray-200 hover:bg-gray-300" },
              {
                label: "+",
                onClick: () => inputOperation("+"),
                className: "bg-orange-500 hover:bg-orange-600 text-white",
              },
              { label: "0", onClick: () => inputNumber("0"), className: "bg-gray-200 hover:bg-gray-300 col-span-2" },
              { label: ".", onClick: () => inputNumber("."), className: "bg-gray-200 hover:bg-gray-300" },
              { label: "=", onClick: performCalculation, className: "bg-orange-500 hover:bg-orange-600 text-white" },
            ].map((button, index) => (
              <Button
                key={index}
                onClick={button.onClick}
                className={`h-12 text-lg font-semibold rounded-xl ${button.className}`}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const CalendarApp = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [events, setEvents] = useState([
      { id: 1, date: new Date(), title: "Team Meeting", time: "10:00 AM" },
      { id: 2, date: new Date(Date.now() + 86400000), title: "Project Deadline", time: "5:00 PM" },
    ])

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()

      const days = []
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null)
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i))
      }
      return days
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const navigateMonth = (direction: number) => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
    }

    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <Button onClick={() => navigateMonth(-1)} variant="ghost" className="text-white hover:bg-white/20">
                ←
              </Button>
              <h2 className="text-2xl font-bold">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <Button onClick={() => navigateMonth(1)} variant="ghost" className="text-white hover:bg-white/20">
                →
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`h-12 flex items-center justify-center rounded-lg cursor-pointer ${
                    day ? "hover:bg-blue-100" : ""
                  } ${
                    selectedDate && day && day.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-500 text-white"
                      : day && day.toDateString() === new Date().toDateString()
                        ? "bg-blue-200 text-blue-800"
                        : "text-gray-700"
                  }`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day?.getDate()}
                </div>
              ))}
            </div>
            {selectedDate && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-lg mb-2">{formatDate(selectedDate)}</h3>
                <div className="space-y-2">
                  {events
                    .filter((event) => event.date.toDateString() === selectedDate.toDateString())
                    .map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-600">{event.time}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const MusicApp = () => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrack, setCurrentTrack] = useState(0)
    const [volume, setVolume] = useState(75)
    const [progress, setProgress] = useState(0)

    const tracks = [
      { id: 1, title: "Ubuntu Sounds", artist: "System Audio", duration: "3:24" },
      { id: 2, title: "Desktop Ambience", artist: "Ubuntu Team", duration: "4:12" },
      { id: 3, title: "Notification Bell", artist: "System", duration: "0:03" },
      { id: 4, title: "Startup Theme", artist: "Ubuntu", duration: "2:45" },
    ]

    const togglePlayPause = () => {
      setIsPlaying(!isPlaying)
    }

    const nextTrack = () => {
      setCurrentTrack((prev) => (prev + 1) % tracks.length)
      setProgress(0)
    }

    const previousTrack = () => {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length)
      setProgress(0)
    }

    useEffect(() => {
      if (isPlaying) {
        const interval = setInterval(() => {
          setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
        }, 1000)
        return () => clearInterval(interval)
      }
    }, [isPlaying])

    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 text-white">
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
              <div className="w-48 h-48 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Music className="w-24 h-24" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{tracks[currentTrack].title}</h2>
              <p className="text-white/70 mb-6">{tracks[currentTrack].artist}</p>

              <div className="mb-6">
                <Progress value={progress} className="h-2 bg-white/20" />
                <div className="flex justify-between text-sm text-white/70 mt-2">
                  <span>
                    {Math.floor((progress * 2.04) / 60)}:{String(Math.floor((progress * 2.04) % 60)).padStart(2, "0")}
                  </span>
                  <span>{tracks[currentTrack].duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mb-6">
                <Button
                  onClick={previousTrack}
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-3 rounded-full"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </Button>
                <Button onClick={togglePlayPause} className="bg-white text-black hover:bg-white/90 p-4 rounded-full">
                  {isPlaying ? <X className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
                <Button onClick={nextTrack} variant="ghost" className="text-white hover:bg-white/20 p-3 rounded-full">
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm">{volume}%</span>
              </div>
            </div>

            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="font-semibold mb-4">Playlist</h3>
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${
                      index === currentTrack ? "bg-white/20" : "hover:bg-white/10"
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-white/70">{track.artist}</div>
                    </div>
                    <span className="text-sm text-white/70">{track.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const PhotosApp = () => {
    const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<"grid" | "slideshow">("grid")

    const photos = [
      { id: 1, name: "Ubuntu Desktop", src: "/placeholder.svg?height=300&width=400", date: "Today" },
      { id: 2, name: "System Screenshot", src: "/placeholder.svg?height=300&width=400", date: "Yesterday" },
      { id: 3, name: "Terminal Session", src: "/placeholder.svg?height=300&width=400", date: "2 days ago" },
      { id: 4, name: "Code Editor", src: "/placeholder.svg?height=300&width=400", date: "1 week ago" },
      { id: 5, name: "File Manager", src: "/placeholder.svg?height=300&width=400", date: "1 week ago" },
      { id: 6, name: "Settings Panel", src: "/placeholder.svg?height=300&width=400", date: "2 weeks ago" },
    ]

    return (
      <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Photos</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "slideshow" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("slideshow")}
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo.id)}
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 truncate">{photo.name}</h3>
                    <p className="text-xs text-gray-500">{photo.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <ImageIcon className="w-24 h-24 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Slideshow Mode</h3>
                  <p className="text-white/70">Click on photos to view them</p>
                </div>
              </div>
            </div>
          )}

          {selectedPhoto && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="max-w-4xl max-h-full p-4">
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                    <ImageIcon className="w-32 h-32 text-gray-400" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{photos.find((p) => p.id === selectedPhoto)?.name}</h3>
                      <p className="text-sm text-gray-600">{photos.find((p) => p.id === selectedPhoto)?.date}</p>
                    </div>
                    <Button onClick={() => setSelectedPhoto(null)} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const SystemMonitorApp = () => {
    const [cpuUsage, setCpuUsage] = useState(45)
    const [memoryUsage, setMemoryUsage] = useState(62)
    const [diskUsage, setDiskUsage] = useState(38)
    const [networkSpeed, setNetworkSpeed] = useState({ download: 125, upload: 45 })

    const processes = [
      { name: "Firefox", cpu: 15.2, memory: 1024, pid: 1234 },
      { name: "Code Editor", cpu: 8.7, memory: 512, pid: 1235 },
      { name: "Terminal", cpu: 2.1, memory: 128, pid: 1236 },
      { name: "Files", cpu: 1.5, memory: 256, pid: 1237 },
      { name: "Settings", cpu: 0.8, memory: 64, pid: 1238 },
    ]

    useEffect(() => {
      const interval = setInterval(() => {
        setCpuUsage((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)))
        setMemoryUsage((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)))
        setDiskUsage((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)))
        setNetworkSpeed((prev) => ({
          download: Math.max(0, prev.download + (Math.random() - 0.5) * 50),
          upload: Math.max(0, prev.upload + (Math.random() - 0.5) * 20),
        }))
      }, 2000)

      return () => clearInterval(interval)
    }, [])

    return (
      <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">System Monitor</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{cpuUsage.toFixed(1)}%</div>
                <Progress value={cpuUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{memoryUsage.toFixed(1)}%</div>
                <Progress value={memoryUsage} className="mt-2" />
                <div className="text-xs text-gray-500 mt-1">4.2 GB / 8.0 GB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{diskUsage.toFixed(1)}%</div>
                <Progress value={diskUsage} className="mt-2" />
                <div className="text-xs text-gray-500 mt-1">156 GB / 512 GB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>↓ {networkSpeed.download.toFixed(1)} MB/s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>↑ {networkSpeed.upload.toFixed(1)} MB/s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Running Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Process</th>
                      <th className="text-left p-2">PID</th>
                      <th className="text-left p-2">CPU %</th>
                      <th className="text-left p-2">Memory (MB)</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((process) => (
                      <tr key={process.pid} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{process.name}</td>
                        <td className="p-2 text-gray-600">{process.pid}</td>
                        <td className="p-2">{process.cpu}%</td>
                        <td className="p-2">{process.memory}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            End Process
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const openApplication = useCallback(
    (appId: string, appName: string, icon: React.ReactNode, component: React.ReactNode) => {
      try {
        const existingApp = applications.find((app) => app.id === appId)
        if (existingApp) {
          if (existingApp.isMinimized) {
            setApplications((apps) =>
              apps.map((app) =>
                app.id === appId
                  ? { ...app, isMinimized: false, zIndex: Math.max(...apps.map((a) => a.zIndex)) + 1 }
                  : app,
              ),
            )
          }
          setActiveApp(appId)
          return
        }

        const baseSize = isMobile
          ? { width: screenSize.width - 20, height: screenSize.height - 100 }
          : { width: 900, height: 650 }

        const newApp: Application = {
          id: appId,
          name: appName,
          icon,
          component,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: applications.length + 1,
          position: {
            x: isMobile ? 10 : 100 + applications.length * 30,
            y: isMobile ? 50 : 100 + applications.length * 30,
          },
          size: baseSize,
        }

        setApplications((prev) => [...prev, newApp])
        setActiveApp(appId)

        // Add success notification
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "success",
            title: "Application Launched",
            message: `${appName} opened successfully`,
            timestamp: "Just now",
          },
        ])
      } catch (error) {
        console.error(`Failed to open application ${appName}:`, error)
        // Add error notification
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "error",
            title: "Application Error",
            message: `Failed to open ${appName}. Please try again.`,
            timestamp: "Just now",
          },
        ])
      }
    },
    [applications, isMobile, screenSize],
  )

  const closeApplication = (appId: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== appId))
    if (activeApp === appId) {
      const remainingApps = applications.filter((app) => app.id !== appId)
      setActiveApp(remainingApps.length > 0 ? remainingApps[remainingApps.length - 1].id : null)
    }
  }

  const minimizeApplication = (appId: string) => {
    setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, isMinimized: true } : app)))
  }

  const maximizeApplication = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              isMaximized: !app.isMaximized,
              position: app.isMaximized ? { x: 100, y: 100 } : { x: 0, y: 40 },
              size: app.isMaximized
                ? { width: 900, height: 650 }
                : { width: screenSize.width, height: screenSize.height - 80 },
            }
          : app,
      ),
    )
  }

  const bringToFront = (appId: string) => {
    const maxZ = Math.max(...applications.map((app) => app.zIndex))
    setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, zIndex: maxZ + 1 } : app)))
    setActiveApp(appId)
  }

  const handleMouseDown = (e: React.MouseEvent, appId: string) => {
    if (isMobile) return // Disable dragging on mobile

    dragRef.current = {
      appId,
      startX: e.clientX,
      startY: e.clientY,
    }
    bringToFront(appId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || isMobile) return

    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY

    setApplications((prev) =>
      prev.map((app) =>
        app.id === dragRef.current!.appId
          ? {
              ...app,
              position: {
                x: Math.max(0, Math.min(screenSize.width - app.size.width, app.position.x + deltaX)),
                y: Math.max(40, Math.min(screenSize.height - app.size.height, app.position.y + deltaY)),
              },
            }
          : app,
      ),
    )

    dragRef.current.startX = e.clientX
    dragRef.current.startY = e.clientY
  }

  const handleMouseUp = () => {
    dragRef.current = null
  }

  interface NotificationDismissHandler {
    (id: number): void
  }

  const dismissNotification: NotificationDismissHandler = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  interface Widget {
    id: string
    type: "weather" | "system-monitor"
    position: { x: number; y: number }
    size: { width: number; height: number }
  }

  interface WeatherData {
    temperature: string
    condition: string
    emoji: string
  }

  interface SystemPerformance {
    cpu: number
    memory: number
  }

  const renderWidget = (widget: Widget): React.ReactNode | null => {
    switch (widget.type) {
      case "weather":
        const weatherData: WeatherData = {
          temperature: "22°C",
          condition: "Partly Cloudy",
          emoji: "⛅"
        }
        return (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{weatherData.temperature}</h3>
                  <p className="text-sm text-gray-600">{weatherData.condition}</p>
                </div>
                <div className="text-4xl">{weatherData.emoji}</div>
              </div>
            </CardContent>
          </Card>
        )
      case "system-monitor":
        const systemPerformance: SystemPerformance = {
          cpu: 45,
          memory: 62
        }
        return (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">System Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>CPU</span>
                  <span>{systemPerformance.cpu}%</span>
                </div>
                <Progress value={systemPerformance.cpu} className="h-1" />
                <div className="flex justify-between text-xs">
                  <span>Memory</span>
                  <span>{systemPerformance.memory}%</span>
                </div>
                <Progress value={systemPerformance.memory} className="h-1" />
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  // Enhanced search functionality
  useEffect(() => {
    if (globalSearchQuery) {
      const apps = [
        {
          name: "Files",
          icon: <Folder className="w-6 h-6" />,
          color: "from-orange-500 to-red-600",
          onClick: () => openApplication("files", "Files", <Folder className="w-5 h-5" />, <FileManager />),
        },
        {
          name: "Terminal",
          icon: <Terminal className="w-6 h-6" />,
          color: "from-gray-700 to-gray-900",
          onClick: () => openApplication("terminal", "Terminal", <Terminal className="w-5 h-5" />, <TerminalApp />),
        },
        {
          name: "VS Code",
          icon: <Code className="w-6 h-6" />,
          color: "from-blue-600 to-blue-800",
          onClick: () => openApplication("vscode", "VS Code", <Code className="w-5 h-5" />, <VSCodeApp />),
        },
        {
          name: "Settings",
          icon: <Settings className="w-6 h-6" />,
          color: "from-gray-600 to-gray-800",
          onClick: () => openApplication("settings", "Settings", <Settings className="w-5 h-5" />, <SettingsApp />),
        },
      ].filter((app) => app.name.toLowerCase().includes(globalSearchQuery.toLowerCase()))

      const files = fileManagerFiles
        .filter((file) => file.name.toLowerCase().includes(globalSearchQuery.toLowerCase()))
        .map((file) => ({
          ...file,
          path: `/home/${currentUser?.username}/${file.name}`,
        }))

      const settings = [
        { name: "Network Settings", description: "Configure Wi-Fi and network connections" },
        { name: "Display Settings", description: "Adjust brightness and resolution" },
        { name: "User Account", description: "Manage user profile and preferences" },
      ].filter(
        (setting) =>
          setting.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          setting.description.toLowerCase().includes(globalSearchQuery.toLowerCase()),
      )

      setSearchResults({ applications: apps, files, settings })
    } else {
      setSearchResults({ applications: [], files: [], settings: [] })
    }
  }, [globalSearchQuery, currentUser])

  // Application components
  const fileManagerFiles: FileItem[] = [
    { name: "Documents", type: "folder", icon: <Folder className="w-4 h-4" /> },
    { name: "Downloads", type: "folder", icon: <Folder className="w-4 h-4" /> },
    { name: "Pictures", type: "folder", icon: <Folder className="w-4 h-4" /> },
    { name: "Music", type: "folder", icon: <Music className="w-4 h-4" /> },
    { name: "Videos", type: "folder", icon: <Play className="w-4 h-4" /> },
    { name: "Desktop", type: "folder", icon: <Folder className="w-4 h-4" /> },
    {
      name: "project.txt",
      type: "file",
      icon: <FileText className="w-4 h-4" />,
      size: "2.4 KB",
      modified: "2 hours ago",
    },
    {
      name: "screenshot.png",
      type: "file",
      icon: <ImageIcon className="w-4 h-4" />,
      size: "1.2 MB",
      modified: "1 day ago",
    },
  ]

  const FileManager = () => (
    <div className="flex h-full">
      <div className="w-48 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-2">
        <div className="space-y-1">
          {[
            { icon: <Home className="w-4 h-4" />, label: "Home" },
            { icon: <Folder className="w-4 h-4" />, label: "Documents" },
            { icon: <HardDrive className="w-4 h-4" />, label: "Downloads" },
            { icon: <ImageIcon className="w-4 h-4" />, label: "Pictures" },
            { icon: <Music className="w-4 h-4" />, label: "Music" },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 hover:bg-blue-50 hover:text-blue-700"
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
          <Separator className="my-2" />
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 hover:bg-blue-50 hover:text-blue-700">
            <HardDrive className="w-4 h-4" />
            Computer
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Trash
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 bg-gradient-to-br from-white to-gray-50">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span>home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-blue-600">{currentUser?.username}</span>
          </div>
          <Input placeholder="Search files..." className="max-w-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fileManagerFiles.map((file, index) => (
            <div
              key={index}
              className="p-3 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">{file.icon}</div>
                <span className="text-sm text-center font-medium">{file.name}</span>
                {file.size && <span className="text-xs text-gray-500">{file.size}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const TerminalApp = () => {
    return <XTerminal username={currentUser?.username || 'user'} />
  }

  const VSCodeApp = () => {
    return <VSCodeEditor username={currentUser?.username || 'user'} />
  }

  const SettingsApp = () => {
    const [activeSection, setActiveSection] = useState("wallpaper")
    const [networkSettings, setNetworkSettings] = useState({
      wifi: true,
      ethernet: false,
      hotspot: false,
    })
    const [displaySettings, setDisplaySettings] = useState({
      brightness: 75,
      resolution: "1920x1080",
      nightMode: false,
    })
    const [soundSettings, setSoundSettings] = useState({
      volume: 75,
      muted: false,
      notifications: true,
    })
    const [powerSettings, setPowerSettings] = useState({
      sleepMode: "15min",
      batteryOptimization: true,
      powerSaver: false,
    })

    const sections = [
      {
        id: "wallpaper",
        icon: <ImageIcon className="w-4 h-4" />,
        label: "Wallpaper",
        color: "pink",
      },
      {
        id: "network",
        icon: <Wifi className="w-4 h-4" />,
        label: "Network",
        color: "blue",
      },
      {
        id: "displays",
        icon: <Monitor className="w-4 h-4" />,
        label: "Displays",
        color: "purple",
      },
      {
        id: "sound",
        icon: <Volume2 className="w-4 h-4" />,
        label: "Sound",
        color: "green",
      },
      {
        id: "power",
        icon: <Battery className="w-4 h-4" />,
        label: "Power",
        color: "yellow",
      },
      {
        id: "users",
        icon: <User className="w-4 h-4" />,
        label: "Users",
        color: "indigo",
      },
    ]

    const renderContent = () => {
      switch (activeSection) {
        case "wallpaper":
          return <WallpaperSettings />

        case "network":
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Network Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Connection Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-green-500" />
                      <span>Wi-Fi</span>
                    </div>
                    <Button
                      variant={networkSettings.wifi ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNetworkSettings((prev) => ({ ...prev, wifi: !prev.wifi }))}
                    >
                      {networkSettings.wifi ? "Connected" : "Disconnected"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-gray-500" />
                      <span>Ethernet</span>
                    </div>
                    <Button
                      variant={networkSettings.ethernet ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNetworkSettings((prev) => ({ ...prev, ethernet: !prev.ethernet }))}
                    >
                      {networkSettings.ethernet ? "Connected" : "Disconnected"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <span>Mobile Hotspot</span>
                    </div>
                    <Button
                      variant={networkSettings.hotspot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNetworkSettings((prev) => ({ ...prev, hotspot: !prev.hotspot }))}
                    >
                      {networkSettings.hotspot ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        case "displays":
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Display Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Screen Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Brightness: {displaySettings.brightness}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={displaySettings.brightness}
                      onChange={(e) =>
                        setDisplaySettings((prev) => ({ ...prev, brightness: Number.parseInt(e.target.value) }))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Resolution</Label>
                    <select
                      value={displaySettings.resolution}
                      onChange={(e) => setDisplaySettings((prev) => ({ ...prev, resolution: e.target.value }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="1920x1080">1920 x 1080 (Full HD)</option>
                      <option value="2560x1440">2560 x 1440 (2K)</option>
                      <option value="3840x2160">3840 x 2160 (4K)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Night Mode</Label>
                    <Button
                      variant={displaySettings.nightMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDisplaySettings((prev) => ({ ...prev, nightMode: !prev.nightMode }))}
                    >
                      {displaySettings.nightMode ? "On" : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        case "sound":
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Sound Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Audio Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Volume: {soundSettings.volume}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundSettings.volume}
                      onChange={(e) =>
                        setSoundSettings((prev) => ({ ...prev, volume: Number.parseInt(e.target.value) }))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Muted</Label>
                    <Button
                      variant={soundSettings.muted ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setSoundSettings((prev) => ({ ...prev, muted: !prev.muted }))}
                    >
                      {soundSettings.muted ? "Muted" : "Unmuted"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Notification Sounds</Label>
                    <Button
                      variant={soundSettings.notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSoundSettings((prev) => ({ ...prev, notifications: !prev.notifications }))}
                    >
                      {soundSettings.notifications ? "On" : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        case "power":
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Power Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Power Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Sleep Mode</Label>
                    <select
                      value={powerSettings.sleepMode}
                      onChange={(e) => setPowerSettings((prev) => ({ ...prev, sleepMode: e.target.value }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="5min">5 minutes</option>
                      <option value="15min">15 minutes</option>
                      <option value="30min">30 minutes</option>
                      <option value="1hour">1 hour</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Battery Optimization</Label>
                    <Button
                      variant={powerSettings.batteryOptimization ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setPowerSettings((prev) => ({ ...prev, batteryOptimization: !prev.batteryOptimization }))
                      }
                    >
                      {powerSettings.batteryOptimization ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Power Saver Mode</Label>
                    <Button
                      variant={powerSettings.powerSaver ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPowerSettings((prev) => ({ ...prev, powerSaver: !prev.powerSaver }))}
                    >
                      {powerSettings.powerSaver ? "On" : "Off"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )

        case "users":
        default:
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">User Account</h2>
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                      <User className="w-5 h-5" />
                    </div>
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Username</Label>
                    <Input
                      value={userSettings.username}
                      onChange={(e) => setUserSettings((prev) => ({ ...prev, username: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <Input
                      type="email"
                      value={userSettings.email}
                      onChange={(e) => setUserSettings((prev) => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Theme</Label>
                    <select
                      value={userSettings.theme}
                      onChange={(e) => setUserSettings((prev) => ({ ...prev, theme: e.target.value }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        // Update current user with new settings
                        if (currentUser) {
                          // Note: In a real application, you would update the user data through the AuthContext
                          // For now, we'll just show a success notification
                          setNotifications((prev) => [
                            ...prev,
                            {
                              id: Date.now(),
                              type: "success",
                              title: "Settings Updated",
                              message: "Your account settings have been saved successfully",
                              timestamp: "Just now",
                            },
                          ])
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 bg-transparent"
                    >
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
      }
    }

    return (
      <div className="flex h-full">
        <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className={`w-full justify-start gap-2 ${
                  activeSection === section.id
                    ? `bg-${section.color}-100 text-${section.color}-700 hover:bg-${section.color}-200`
                    : `hover:bg-${section.color}-50 hover:text-${section.color}-700`
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                {section.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 bg-gradient-to-br from-white to-gray-50 overflow-auto">{renderContent()}</div>
      </div>
    )
  }

  const BrowserApp = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 cursor-pointer"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 cursor-pointer"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 cursor-pointer"></div>
        </div>
        <Button size="sm" variant="ghost" className="hover:bg-gray-200">
          ←
        </Button>
        <Button size="sm" variant="ghost" className="hover:bg-gray-200">
          →
        </Button>
        <Button size="sm" variant="ghost" className="hover:bg-gray-200">
          ↻
        </Button>
        <Input className="flex-1" value="https://ubuntu.com" readOnly />
        <Button size="sm" variant="ghost" className="hover:bg-gray-200">
          ⋮
        </Button>
      </div>
      <div className="flex-1 p-8 bg-gradient-to-br from-white via-orange-50 to-red-50 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">U</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Ubuntu
            </h1>
            <p className="text-xl text-gray-600">Welcome, {currentUser?.username}! 🎉</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Monitor className="w-8 h-8" />,
                title: "Desktop",
                description: "Complete desktop environment for productivity and creativity.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Server",
                description: "Secure, fast and economically scalable server platform.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Cloud",
                description: "Multi-cloud operations with enterprise security and support.",
                color: "from-green-500 to-teal-500",
              },
            ].map((item) => (
              <Card key={item.title} className="hover:shadow-2xl cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl text-white`}>{item.icon}</div>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 group-hover:text-gray-800">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const CodeEditorApp = () => (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 cursor-pointer"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 cursor-pointer"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 cursor-pointer"></div>
        </div>
        <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
          File
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
          Edit
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">
          View
        </Button>
        <div className="flex-1"></div>
        <span className="text-sm text-gray-400">● welcome.py</span>
      </div>
      <div className="flex-1 p-4 font-mono text-sm overflow-auto">
        <div className="space-y-1">
          {[
            { line: 1, content: "#!/usr/bin/env python3", color: "text-purple-400" },
            { line: 2, content: "", color: "" },
            { line: 3, content: "def welcome_user(username):", color: "" },
            { line: 4, content: '    print(f"Welcome to Ubuntu, {username}!")', color: "" },
            { line: 5, content: "", color: "" },
            { line: 6, content: 'if __name__ == "__main__":', color: "" },
            { line: 7, content: `    welcome_user("${currentUser?.username}")`, color: "" },
          ].map((item) => (
            <div key={item.line} className="flex hover:bg-gray-800/50 px-2 py-1 rounded">
              <span className="w-8 text-gray-500 text-right mr-4 select-none">{item.line}</span>
              <span className={item.color || "text-white"}>
                {item.content.includes("def") && (
                  <>
                    <span className="text-blue-400">def</span>
                    <span className="text-yellow-400 ml-2">welcome_user</span>
                    <span className="text-white">(username):</span>
                  </>
                )}
                {item.content.includes("print") && (
                  <>
                    <span className="ml-4 text-blue-400">print</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">f"Welcome to Ubuntu, {"{username}"}!"</span>
                    <span className="text-white">)</span>
                  </>
                )}
                {item.content.includes("if __name__") && (
                  <>
                    <span className="text-blue-400">if</span>
                    <span className="text-white ml-2">__name__</span>
                    <span className="text-white ml-2">==</span>
                    <span className="text-green-400 ml-2">"__main__"</span>
                    <span className="text-white">:</span>
                  </>
                )}
                {item.content.includes("welcome_user(") && (
                  <>
                    <span className="ml-4 text-yellow-400">welcome_user</span>
                    <span className="text-white">(</span>
                    <span className="text-green-400">"{currentUser?.username}"</span>
                    <span className="text-white">)</span>
                  </>
                )}
                {item.content === "#!/usr/bin/env python3" && <span className="text-purple-400">{item.content}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Loading Screen
  if (systemState === "loading") {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-orange-500/50">
              <span className="text-5xl font-bold text-white">U</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Ubuntu
            </h1>
            <p className="text-gray-400 mt-2">Loading your desktop environment...</p>
          </div>

          <div className="w-96 mb-8">
            <Progress value={loadingProgress} className="h-3 bg-gray-800" />
            <div className="text-center text-sm text-gray-400 mt-2 font-mono">
              {Math.round(loadingProgress)}% Complete
            </div>
          </div>

          <div className="h-40 overflow-hidden">
            <div className="space-y-2 text-sm text-gray-400 font-mono">
              {bootMessages.map((message, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }



  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />
  }

  // Desktop
  return (
    <FileSystemProvider username={currentUser?.username || 'user'}>
      <div
        className="h-screen w-full relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          background: currentWallpaper.background,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
      {/* Dynamic Theme Overlay */}
      <div
        className={`absolute inset-0 ${
          userSettings?.theme === "dark"
            ? "bg-black/20"
            : userSettings?.theme === "light"
              ? "bg-white/10"
              : "bg-black/10"
        } backdrop-blur-[0.5px]`}
      ></div>

      {/* Widgets Layer */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="absolute pointer-events-auto"
            style={{
              left: widget.position.x,
              top: widget.position.y,
              width: widget.size.width,
              height: widget.size.height,
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Notification Center */}
      {showNotifications && (
        <div className="absolute top-12 right-4 w-80 max-h-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)} className="p-1">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === "error"
                          ? "bg-red-500"
                          : notification.type === "warning"
                            ? "bg-yellow-500"
                            : notification.type === "success"
                              ? "bg-green-500"
                              : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <span className="text-xs text-gray-400">{notification.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Advanced Search Overlay */}
      {showAdvancedSearch && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  placeholder="Search files, applications, settings..."
                  className="w-full text-xl pl-14 h-16 bg-gray-50 border-0 focus:bg-white rounded-2xl"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSearch(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {globalSearchQuery && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Applications Results */}
                {searchResults.applications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Applications</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {searchResults.applications.map((app) => (
                        <div
                          key={app.name}
                          className="p-3 rounded-xl hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            app.onClick()
                            setShowAdvancedSearch(false)
                            setGlobalSearchQuery("")
                          }}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center text-white`}
                            >
                              {app.icon}
                            </div>
                            <span className="text-xs font-medium text-center">{app.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Results */}
                {searchResults.files.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Files</h3>
                    <div className="space-y-2">
                      {searchResults.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          {file.icon}
                          <div>
                            <div className="font-medium text-sm">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.path}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settings Results */}
                {searchResults.settings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Settings</h3>
                    <div className="space-y-2">
                      {searchResults.settings.map((setting, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm">{setting.name}</div>
                            <div className="text-xs text-gray-500">{setting.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Customization Panel */}
      {showThemePanel && (
        <div className="absolute top-12 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Customize Theme</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowThemePanel(false)} className="p-1">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">Theme Mode</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["light", "dark", "auto"].map((theme) => (
                  <Button
                    key={theme}
                    variant={userSettings?.theme === theme ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserSettings((prev) => ({ ...prev, theme }))}
                    className="capitalize"
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Accent Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {["blue", "purple", "green", "orange", "red", "pink"].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    size="sm"
                    onClick={() => setUserSettings((prev) => ({ ...prev, accentColor: color }))}
                    className={`w-8 h-8 p-0 bg-${color}-500 hover:bg-${color}-600 border-2 ${
                      userSettings?.accentColor === color ? "border-gray-800" : "border-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Icon Style</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["rounded", "square"].map((style) => (
                  <Button
                    key={style}
                    variant={userSettings?.iconStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserSettings((prev) => ({ ...prev, iconStyle: style }))}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black/90 backdrop-blur-md flex items-center justify-between px-4 z-50 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 px-4 py-2 rounded-lg"
            onClick={() => setShowApplications(!showApplications)}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Activities
            </div>
          </Button>
        </div>

        <div className="text-white text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
            {currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            {
              icon: <Network className="w-4 h-4" />,
              color: "text-green-400",
              label: "Network Connected",
              status: "connected",
            },
            {
              icon: <Volume2 className="w-4 h-4" />,
              color: "text-blue-400",
              label: "Volume: 75%",
              status: "active",
            },
            {
              icon: <Battery className="w-4 h-4" />,
              color: "text-yellow-400",
              label: "Battery: 85%",
              status: "charging",
            },
          ].map((item, index) => (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2 rounded-lg relative group"
                >
                  <div className={item.color}>{item.icon}</div>
                  <div className="absolute -bottom-1 right-0 w-2 h-2 bg-green-400 rounded-full opacity-80"></div>
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <DropdownMenuItem className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <div className={item.color}>{item.icon}</div>
                    <span>{item.label}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-gray-50">
                  Status: <span className="ml-1 text-green-600 font-medium">{item.status}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {currentUser?.username.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <DropdownMenuItem className="hover:bg-blue-50">
                <User className="w-4 h-4 mr-2" />
                {currentUser?.username}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  openApplication("settings", "Settings", <Settings className="w-5 h-5" />, <SettingsApp />)
                }
                className="hover:bg-blue-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 text-red-600">
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-20 left-4 space-y-4">
        {[
          {
            name: "Files",
            icon: <Folder className="w-6 h-6" />,
            color: "from-orange-500 to-red-600",
            onClick: () => openApplication("files", "Files", <Folder className="w-5 h-5" />, <FileManager />),
          },
          {
            name: "Terminal",
            icon: <Terminal className="w-6 h-6" />,
            color: "from-gray-700 to-gray-900",
            onClick: () => openApplication("terminal", "Terminal", <Terminal className="w-5 h-5" />, <TerminalApp />),
          },
          {
            name: "VS Code",
            icon: <Code className="w-6 h-6" />,
            color: "from-blue-600 to-blue-800",
            onClick: () => openApplication("vscode", "VS Code", <Code className="w-5 h-5" />, <VSCodeApp />),
          },
          {
            name: "Firefox",
            icon: <Globe className="w-6 h-6" />,
            color: "from-orange-600 to-red-700",
            onClick: () => openApplication("browser", "Firefox", <Globe className="w-5 h-5" />, <BrowserApp />),
          },
        ].map((app) => (
          <div
            key={app.name}
            className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer hover:bg-white/20 group"
            onClick={app.onClick}
          >
            <div
              className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}
            >
              {app.icon}
            </div>
            <span className="text-white text-xs font-medium group-hover:text-orange-200">{app.name}</span>
          </div>
        ))}
      </div>

      {/* Application Launcher */}
      {showApplications && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-40 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-5xl w-full mx-4 shadow-2xl">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  className="w-full text-lg pl-12 h-14 bg-gray-50 border-0 focus:bg-white rounded-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {[
                {
                  name: "Files",
                  icon: <Folder className="w-8 h-8" />,
                  color: "from-orange-500 to-red-600",
                  onClick: () => openApplication("files", "Files", <Folder className="w-5 h-5" />, <FileManager />),
                },
                {
                  name: "Terminal",
                  icon: <Terminal className="w-8 h-8" />,
                  color: "from-gray-700 to-gray-900",
                  onClick: () =>
                    openApplication("terminal", "Terminal", <Terminal className="w-5 h-5" />, <TerminalApp />),
                },
                {
                  name: "VS Code",
                  icon: <Code className="w-8 h-8" />,
                  color: "from-blue-600 to-blue-800",
                  onClick: () =>
                    openApplication("vscode", "VS Code", <Code className="w-5 h-5" />, <VSCodeApp />),
                },
                {
                  name: "Firefox",
                  icon: <Globe className="w-8 h-8" />,
                  color: "from-orange-600 to-red-700",
                  onClick: () => openApplication("browser", "Firefox", <Globe className="w-5 h-5" />, <BrowserApp />),
                },
                {
                  name: "Settings",
                  icon: <Settings className="w-8 h-8" />,
                  color: "from-gray-600 to-gray-800",
                  onClick: () =>
                    openApplication("settings", "Settings", <Settings className="w-5 h-5" />, <SettingsApp />),
                },
                {
                  name: "Code Editor",
                  icon: <Code className="w-8 h-8" />,
                  color: "from-blue-600 to-purple-700",
                  onClick: () =>
                    openApplication("code", "Code Editor", <Code className="w-5 h-5" />, <CodeEditorApp />),
                },
                {
                  name: "Calculator",
                  icon: <Grid3X3 className="w-8 h-8" />,
                  color: "from-green-600 to-teal-700",
                  onClick: () =>
                    openApplication("calculator", "Calculator", <Grid3X3 className="w-5 h-5" />, <CalculatorApp />),
                },
                {
                  name: "Calendar",
                  icon: <Calendar className="w-8 h-8" />,
                  color: "from-red-500 to-pink-600",
                  onClick: () =>
                    openApplication("calendar", "Calendar", <Calendar className="w-5 h-5" />, <CalendarApp />),
                },
                {
                  name: "Music",
                  icon: <Music className="w-8 h-8" />,
                  color: "from-purple-500 to-indigo-600",
                  onClick: () => openApplication("music", "Music Player", <Music className="w-5 h-5" />, <MusicApp />),
                },
                {
                  name: "Photos",
                  icon: <ImageIcon className="w-8 h-8" />,
                  color: "from-yellow-500 to-orange-600",
                  onClick: () => openApplication("photos", "Photos", <ImageIcon className="w-5 h-5" />, <PhotosApp />),
                },
                {
                  name: "System Monitor",
                  icon: <Activity className="w-8 h-8" />,
                  color: "from-teal-500 to-cyan-600",
                  onClick: () =>
                    openApplication(
                      "system-monitor",
                      "System Monitor",
                      <Activity className="w-5 h-5" />,
                      <SystemMonitorApp />,
                    ),
                },
              ]
                .filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((app) => (
                  <div
                    key={app.name}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/70 cursor-pointer group"
                    onClick={() => {
                      app.onClick()
                      setShowApplications(false)
                      setSearchQuery("")
                    }}
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${app.color} rounded-3xl flex items-center justify-center text-white shadow-lg`}
                    >
                      {app.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{app.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Windows */}
      {applications
        .filter((app) => app.isOpen && !app.isMinimized)
        .map((app) => (
          <div
            key={app.id}
            className="absolute bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            style={{
              left: app.position.x,
              top: app.position.y,
              width: app.size.width,
              height: app.size.height,
              zIndex: app.zIndex,
            }}
          >
            {/* Window Title Bar */}
            <div
              className="h-12 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 flex items-center justify-between px-4 cursor-move hover:from-gray-200 hover:to-gray-300"
              onMouseDown={(e) => handleMouseDown(e, app.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded-lg shadow-sm">{app.icon}</div>
                <span className="font-semibold text-gray-800">{app.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-yellow-200 rounded-full"
                  onClick={() => minimizeApplication(app.id)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-green-200 rounded-full"
                  onClick={() => maximizeApplication(app.id)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 hover:bg-red-200 rounded-full"
                  onClick={() => closeApplication(app.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Window Content */}
            <div className="h-full overflow-hidden" style={{ height: app.size.height - 48 }}>
              {app.component}
            </div>
          </div>
        ))}

      {/* Dock */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md rounded-3xl p-3 flex items-center gap-3 shadow-2xl border border-white/10">
        {applications.map((app) => (
          <Button
            key={app.id}
            variant="ghost"
            size="sm"
            className={`w-14 h-14 p-0 rounded-2xl relative group ${
              activeApp === app.id ? "bg-white/30 shadow-lg" : "hover:bg-white/20"
            }`}
            onClick={() => {
              if (app.isMinimized) {
                setApplications((apps) => apps.map((a) => (a.id === app.id ? { ...a, isMinimized: false } : a)))
              }
              bringToFront(app.id)
            }}
            onMouseEnter={() => setDockHover(app.id)}
            onMouseLeave={() => setDockHover(null)}
          >
            <div className="text-white">{app.icon}</div>
            {activeApp === app.id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
            {dockHover === app.id && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                {app.name}
              </div>
            )}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-10 bg-white/20 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          className="w-14 h-14 p-0 rounded-2xl hover:bg-white/20 group"
          onClick={() => setShowApplications(true)}
        >
          <div className="text-white">
            <AppWindow className="w-6 h-6" />
          </div>
        </Button>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Button
          className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-2xl z-40"
          onClick={() => setShowApplications(true)}
        >
          <Grid3X3 className="w-8 h-8 text-white" />
        </Button>
      )}
    </div>
    </FileSystemProvider>
  )
}

// Main export component with all providers
export default function UbuntuSystem() {
  return (
    <AuthProvider>
      <WallpaperProvider>
        <DesktopContent />
      </WallpaperProvider>
    </AuthProvider>
  )
}
