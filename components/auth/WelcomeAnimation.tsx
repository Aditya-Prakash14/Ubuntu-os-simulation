"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/contexts/AuthContext'
import { Sparkles, Heart, Star, Zap } from 'lucide-react'

interface WelcomeAnimationProps {
  user: UserProfile
  onComplete: () => void
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showParticles, setShowParticles] = useState(false)

  const steps = [
    {
      title: "Welcome to Ubuntu OS",
      subtitle: `Hello, ${user.firstName}!`,
      description: "Your journey begins now",
      duration: 2000
    },
    {
      title: "Setting up your workspace",
      subtitle: "Preparing your desktop environment",
      description: "This will only take a moment",
      duration: 2500
    },
    {
      title: "Almost ready",
      subtitle: "Finalizing your experience",
      description: "Get ready to explore",
      duration: 2000
    },
    {
      title: "Welcome aboard!",
      subtitle: `Enjoy your Ubuntu experience, ${user.firstName}`,
      description: "Let's get started",
      duration: 2000
    }
  ]

  useEffect(() => {
    setShowParticles(true)
    
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setTimeout(onComplete, 1000)
      }
    }, steps[currentStep].duration)

    return () => clearTimeout(timer)
  }, [currentStep, onComplete])

  const generateParticles = () => {
    return [...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
          y: [0, -100, -200],
          x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeOut"
        }}
      >
        {i % 4 === 0 && <Sparkles className="w-2 h-2 text-yellow-400" />}
        {i % 4 === 1 && <Star className="w-2 h-2 text-blue-400" />}
        {i % 4 === 2 && <Heart className="w-2 h-2 text-pink-400" />}
        {i % 4 === 3 && <Zap className="w-2 h-2 text-purple-400" />}
      </motion.div>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
              "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
              "linear-gradient(225deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))",
              "linear-gradient(315deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {generateParticles()}
        </div>
      )}

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-xl opacity-30"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-500 rounded-full filter blur-xl opacity-30"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-32 h-32 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 text-white"
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold text-white mb-4"
            >
              {steps[currentStep].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl md:text-3xl font-semibold text-white/80 mb-2"
            >
              {steps[currentStep].subtitle}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-white/60 mb-8"
            >
              {steps[currentStep].description}
            </motion.p>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center space-x-3"
            >
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                  style={{ width: index === currentStep ? '32px' : '8px' }}
                  animate={{
                    width: index === currentStep ? '32px' : '8px',
                    backgroundColor: index <= currentStep ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </motion.div>

            {/* Loading Animation */}
            {currentStep < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center justify-center space-x-2 mt-8"
              >
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            )}

            {/* Final Step - Get Started Button */}
            {currentStep === steps.length - 1 && (
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={onComplete}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Corner Sparkles */}
      <motion.div
        className="absolute top-10 left-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-yellow-400 opacity-60" />
      </motion.div>
      <motion.div
        className="absolute top-10 right-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <Star className="w-6 h-6 text-blue-400 opacity-60" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Heart className="w-7 h-7 text-pink-400 opacity-60" />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <Zap className="w-5 h-5 text-purple-400 opacity-60" />
      </motion.div>
    </div>
  )
}

export default WelcomeAnimation
