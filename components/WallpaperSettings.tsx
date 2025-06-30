"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWallpaper, type WallpaperOption } from '@/contexts/WallpaperContext'
import {
  Monitor,
  Palette,
  Clock,
  Check,
  Sparkles,
  Mountain,
  Waves,
  Sun,
  Trees,
  Moon,
  Grid3X3,
  Hexagon
} from 'lucide-react'

const WallpaperSettings: React.FC = () => {
  const { currentWallpaper, wallpapers, setWallpaper, timeOfDay, isDynamicMode, setDynamicMode } = useWallpaper()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gradient' | 'pattern' | 'dynamic'>('all')

  const getWallpaperIcon = (wallpaper: WallpaperOption) => {
    switch (wallpaper.id) {
      case 'ubuntu-default':
        return <Monitor className="w-5 h-5" />
      case 'purple-mountains':
        return <Mountain className="w-5 h-5" />
      case 'ocean-blue':
        return <Waves className="w-5 h-5" />
      case 'sunset-orange':
        return <Sun className="w-5 h-5" />
      case 'forest-green':
        return <Trees className="w-5 h-5" />
      case 'dark-space':
        return <Moon className="w-5 h-5" />
      case 'geometric-pattern':
        return <Grid3X3 className="w-5 h-5" />
      case 'hexagon-pattern':
        return <Hexagon className="w-5 h-5" />
      case 'dynamic-time':
        return <Clock className="w-5 h-5" />
      default:
        return <Palette className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gradient':
        return 'bg-blue-100 text-blue-800'
      case 'pattern':
        return 'bg-purple-100 text-purple-800'
      case 'dynamic':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredWallpapers = wallpapers.filter(wallpaper => 
    selectedCategory === 'all' || wallpaper.type === selectedCategory
  )

  const categories = [
    { id: 'all', name: 'All', icon: <Palette className="w-4 h-4" /> },
    { id: 'gradient', name: 'Gradients', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'pattern', name: 'Patterns', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'dynamic', name: 'Dynamic', icon: <Clock className="w-4 h-4" /> }
  ]

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Wallpaper & Background</h1>
          <p className="text-gray-600">Customize your desktop background with beautiful wallpapers</p>
        </div>

        {/* Current Wallpaper Preview */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Current Wallpaper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div 
                className="w-32 h-20 rounded-lg border-2 border-gray-200 shadow-inner"
                style={{ background: currentWallpaper.preview }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getWallpaperIcon(currentWallpaper)}
                  <h3 className="font-semibold text-lg">{currentWallpaper.name}</h3>
                  <Badge className={getTypeColor(currentWallpaper.type)}>
                    {currentWallpaper.type}
                  </Badge>
                  {isDynamicMode && (
                    <Badge className="bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {timeOfDay}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{currentWallpaper.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 justify-center">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id as any)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Dynamic Mode Toggle */}
        {currentWallpaper.type === 'dynamic' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Dynamic Mode</h3>
                    <p className="text-sm text-gray-600">Automatically change wallpaper based on time of day</p>
                  </div>
                </div>
                <Button
                  variant={isDynamicMode ? 'default' : 'outline'}
                  onClick={() => setDynamicMode(!isDynamicMode)}
                  className="flex items-center gap-2"
                >
                  {isDynamicMode ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  {isDynamicMode ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallpapers.map(wallpaper => (
            <Card 
              key={wallpaper.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                currentWallpaper.id === wallpaper.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setWallpaper(wallpaper)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Preview */}
                  <div className="relative">
                    <div 
                      className="w-full h-32 rounded-lg border border-gray-200 shadow-inner"
                      style={{ background: wallpaper.preview }}
                    />
                    {currentWallpaper.id === wallpaper.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getWallpaperIcon(wallpaper)}
                      <h3 className="font-semibold text-sm">{wallpaper.name}</h3>
                      <Badge className={`text-xs ${getTypeColor(wallpaper.type)}`}>
                        {wallpaper.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{wallpaper.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Time of Day Info for Dynamic Wallpapers */}
        {selectedCategory === 'dynamic' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time-based Wallpapers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { time: 'morning', label: 'Morning (6AM-12PM)', color: 'linear-gradient(135deg, #fdcb6e 0%, #fd79a8 30%, #74b9ff 100%)' },
                  { time: 'afternoon', label: 'Afternoon (12PM-5PM)', color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%)' },
                  { time: 'evening', label: 'Evening (5PM-9PM)', color: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 30%, #e17055 100%)' },
                  { time: 'night', label: 'Night (9PM-6AM)', color: 'linear-gradient(135deg, #2d3436 0%, #636e72 30%, #74b9ff 100%)' }
                ].map(period => (
                  <div key={period.time} className="text-center">
                    <div 
                      className={`w-full h-16 rounded-lg border border-gray-200 mb-2 ${
                        timeOfDay === period.time ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ background: period.color }}
                    />
                    <p className="text-xs font-medium">{period.label}</p>
                    {timeOfDay === period.time && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default WallpaperSettings
