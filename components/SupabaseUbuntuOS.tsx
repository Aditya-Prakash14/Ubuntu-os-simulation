'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { SupabaseFileSystemProvider } from '@/contexts/SupabaseFileSystemContext'
import { SupabaseTerminalProvider } from '@/contexts/SupabaseTerminalContext'
import { SupabaseCollaborationProvider } from '@/contexts/SupabaseCollaborationContext'
import SupabaseAuthScreen from '@/components/auth/SupabaseAuthScreen'
import Desktop from '@/desktop'
import { WallpaperProvider } from '@/contexts/WallpaperContext'
import { Loader2, Wifi, WifiOff, Database } from 'lucide-react'

function UbuntuOSContent() {
  const { user, userProfile, loading } = useSupabaseAuth()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')

  useEffect(() => {
    // Monitor connection status
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    }

    checkConnection()
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)

    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ubuntu OS Simulator</h2>
          <p className="text-white/80">Initializing your environment...</p>
          
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Supabase</span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className={connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
                {connectionStatus === 'connected' ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Real-time</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show authentication screen if not logged in
  if (!user) {
    return <SupabaseAuthScreen />
  }

  // Show welcome animation for new users
  if (user && userProfile && !userProfile.last_login) {
    return <WelcomeAnimation userProfile={userProfile} />
  }

  // Show main Ubuntu OS interface
  return (
    <WallpaperProvider>
      <SupabaseFileSystemProvider>
        <SupabaseTerminalProvider>
          <SupabaseCollaborationProvider>
            <UbuntuDesktop />
          </SupabaseCollaborationProvider>
        </SupabaseTerminalProvider>
      </SupabaseFileSystemProvider>
    </WallpaperProvider>
  )
}

function WelcomeAnimation({ userProfile }: { userProfile: any }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep(step + 1)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [step])

  const steps = [
    {
      title: `Welcome, ${userProfile.full_name}!`,
      description: 'Setting up your Ubuntu environment...',
      icon: '👋'
    },
    {
      title: 'Creating your home directory',
      description: `Initializing /home/${userProfile.username}`,
      icon: '🏠'
    },
    {
      title: 'Configuring your workspace',
      description: 'Setting up terminal and applications...',
      icon: '⚙️'
    },
    {
      title: 'Ready to go!',
      description: 'Your Ubuntu OS Simulator is ready',
      icon: '🚀'
    }
  ]

  const currentStep = steps[step]

  if (step >= 3) {
    // Redirect to main interface after welcome
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white max-w-md"
      >
        <motion.div
          key={step}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-6"
        >
          {currentStep.icon}
        </motion.div>
        
        <motion.h1
          key={`title-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold mb-4"
        >
          {currentStep.title}
        </motion.h1>
        
        <motion.p
          key={`desc-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/80 text-lg mb-8"
        >
          {currentStep.description}
        </motion.p>

        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= step ? 'bg-white' : 'bg-white/30'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function UbuntuDesktop() {
  return (
    <div className="relative">
      {/* Connection Status Indicator */}
      <ConnectionStatusIndicator />

      {/* Main Desktop */}
      <Desktop />
    </div>
  )
}

function ConnectionStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50"
    >
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>Offline Mode - Changes will sync when connection is restored</span>
      </div>
    </motion.div>
  )
}



export default function SupabaseUbuntuOS() {
  return (
    <SupabaseAuthProvider>
      <UbuntuOSContent />
    </SupabaseAuthProvider>
  )
}
