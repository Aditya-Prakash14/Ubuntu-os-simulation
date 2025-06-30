"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface WallpaperOption {
  id: string
  name: string
  type: 'gradient' | 'pattern' | 'image' | 'dynamic'
  preview: string
  background: string
  description?: string
}

export interface WallpaperContextType {
  currentWallpaper: WallpaperOption
  wallpapers: WallpaperOption[]
  setWallpaper: (wallpaper: WallpaperOption) => void
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  isDynamicMode: boolean
  setDynamicMode: (enabled: boolean) => void
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined)

export const useWallpaper = () => {
  const context = useContext(WallpaperContext)
  if (!context) {
    throw new Error('useWallpaper must be used within a WallpaperProvider')
  }
  return context
}

const wallpaperOptions: WallpaperOption[] = [
  {
    id: 'ubuntu-default',
    name: 'Ubuntu Default',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #e73c7e, #23a6d5, #23d5ab)',
    background: 'linear-gradient(135deg, #e73c7e, #23a6d5, #23d5ab)',
    description: 'Classic Ubuntu gradient'
  },
  {
    id: 'purple-mountains',
    name: 'Purple Mountains',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Majestic purple mountain gradient'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #6c5ce7 100%)',
    background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #6c5ce7 100%)',
    description: 'Deep ocean blue waves'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%)',
    background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%)',
    description: 'Warm sunset colors'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #55a3ff 100%)',
    background: 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #55a3ff 100%)',
    description: 'Fresh forest and sky'
  },
  {
    id: 'dark-space',
    name: 'Dark Space',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #74b9ff 100%)',
    background: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #74b9ff 100%)',
    description: 'Deep space darkness'
  },
  {
    id: 'geometric-pattern',
    name: 'Geometric Pattern',
    type: 'pattern',
    preview: 'linear-gradient(45deg, #667eea 25%, transparent 25%), linear-gradient(-45deg, #667eea 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #764ba2 75%), linear-gradient(-45deg, transparent 75%, #764ba2 75%)',
    background: `
      linear-gradient(45deg, rgba(102, 126, 234, 0.1) 25%, transparent 25%), 
      linear-gradient(-45deg, rgba(102, 126, 234, 0.1) 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, rgba(118, 75, 162, 0.1) 75%), 
      linear-gradient(-45deg, transparent 75%, rgba(118, 75, 162, 0.1) 75%),
      linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    `,
    description: 'Modern geometric pattern'
  },
  {
    id: 'hexagon-pattern',
    name: 'Hexagon Pattern',
    type: 'pattern',
    preview: 'radial-gradient(circle at 50% 50%, #74b9ff 2px, transparent 2px)',
    background: `
      radial-gradient(circle at 25% 25%, rgba(116, 185, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, rgba(116, 185, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 25% 75%, rgba(108, 92, 231, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 75% 25%, rgba(108, 92, 231, 0.1) 2px, transparent 2px),
      linear-gradient(135deg, #74b9ff 0%, #6c5ce7 100%)
    `,
    description: 'Hexagonal dot pattern'
  },
  {
    id: 'dynamic-time',
    name: 'Dynamic Time-based',
    type: 'dynamic',
    preview: 'linear-gradient(135deg, #fdcb6e 0%, #fd79a8 50%, #6c5ce7 100%)',
    background: 'linear-gradient(135deg, #fdcb6e 0%, #fd79a8 50%, #6c5ce7 100%)',
    description: 'Changes based on time of day'
  }
]

const getDynamicWallpaper = (timeOfDay: string): string => {
  switch (timeOfDay) {
    case 'morning':
      return 'linear-gradient(135deg, #fdcb6e 0%, #fd79a8 30%, #74b9ff 100%)'
    case 'afternoon':
      return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%)'
    case 'evening':
      return 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 30%, #e17055 100%)'
    case 'night':
      return 'linear-gradient(135deg, #2d3436 0%, #636e72 30%, #74b9ff 100%)'
    default:
      return 'linear-gradient(135deg, #74b9ff 0%, #6c5ce7 100%)'
  }
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

interface WallpaperProviderProps {
  children: React.ReactNode
}

export const WallpaperProvider: React.FC<WallpaperProviderProps> = ({ children }) => {
  const [currentWallpaper, setCurrentWallpaper] = useState<WallpaperOption>(wallpaperOptions[0])
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(getTimeOfDay())
  const [isDynamicMode, setIsDynamicMode] = useState(false)

  // Update time of day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay())
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Update dynamic wallpaper when time changes
  useEffect(() => {
    if (isDynamicMode && currentWallpaper.type === 'dynamic') {
      const dynamicWallpaper = {
        ...currentWallpaper,
        background: getDynamicWallpaper(timeOfDay)
      }
      setCurrentWallpaper(dynamicWallpaper)
    }
  }, [timeOfDay, isDynamicMode])

  const setWallpaper = (wallpaper: WallpaperOption) => {
    if (wallpaper.type === 'dynamic') {
      const dynamicWallpaper = {
        ...wallpaper,
        background: getDynamicWallpaper(timeOfDay)
      }
      setCurrentWallpaper(dynamicWallpaper)
      setIsDynamicMode(true)
    } else {
      setCurrentWallpaper(wallpaper)
      setIsDynamicMode(false)
    }
  }

  const setDynamicMode = (enabled: boolean) => {
    setIsDynamicMode(enabled)
    if (enabled && currentWallpaper.type === 'dynamic') {
      const dynamicWallpaper = {
        ...currentWallpaper,
        background: getDynamicWallpaper(timeOfDay)
      }
      setCurrentWallpaper(dynamicWallpaper)
    }
  }

  const value: WallpaperContextType = {
    currentWallpaper,
    wallpapers: wallpaperOptions,
    setWallpaper,
    timeOfDay,
    isDynamicMode,
    setDynamicMode
  }

  return (
    <WallpaperContext.Provider value={value}>
      {children}
    </WallpaperContext.Provider>
  )
}
