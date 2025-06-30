"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  profilePicture?: string
  bio?: string
  location?: string
  website?: string
  joinDate: string
  lastLogin: string
  isOnline: boolean
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
    notifications: boolean
    privacy: 'public' | 'friends' | 'private'
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginAttempts: number
    accountLocked: boolean
  }
}

export interface AuthContextType {
  currentUser: UserProfile | null
  users: UserProfile[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  deleteAccount: (password: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  verifyTwoFactor: (code: string) => Promise<boolean>
}

export interface RegisterData {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Default demo user
const createDemoUser = (): UserProfile => ({
  id: 'demo-user-1',
  firstName: 'Demo',
  lastName: 'User',
  username: 'demo',
  email: 'demo@ubuntu.com',
  phoneNumber: '+1 (555) 123-4567',
  dateOfBirth: '1990-01-01',
  profilePicture: '/placeholder-user.jpg',
  bio: 'Welcome to Ubuntu OS Simulator! This is a demo account.',
  location: 'San Francisco, CA',
  website: 'https://ubuntu.com',
  joinDate: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isOnline: true,
  preferences: {
    theme: 'auto',
    language: 'en-US',
    timezone: 'America/Los_Angeles',
    notifications: true,
    privacy: 'public'
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: new Date().toISOString(),
    loginAttempts: 0,
    accountLocked: false
  }
})

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([createDemoUser()])
  const [isLoading, setIsLoading] = useState(false)
  const [userPasswords] = useState<{ [userId: string]: string }>({
    'demo-user-1': 'demo123'
  })

  const isAuthenticated = currentUser !== null

  // Simulate API delay
  const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms))

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    await simulateDelay(1500) // Simulate network request

    try {
      const user = users.find(u => u.username === username || u.email === username)
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }

      if (user.security.accountLocked) {
        return { success: false, error: 'Account is locked. Please contact support.' }
      }

      const storedPassword = userPasswords[user.id]
      if (storedPassword !== password) {
        // Increment login attempts
        setUsers(prev => prev.map(u => 
          u.id === user.id 
            ? { 
                ...u, 
                security: { 
                  ...u.security, 
                  loginAttempts: u.security.loginAttempts + 1,
                  accountLocked: u.security.loginAttempts >= 4
                }
              }
            : u
        ))
        return { success: false, error: 'Invalid password' }
      }

      // Successful login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString(),
        isOnline: true,
        security: {
          ...user.security,
          loginAttempts: 0
        }
      }

      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u))
      setCurrentUser(updatedUser)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    await simulateDelay(2000) // Simulate network request

    try {
      // Validation
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' }
      }

      if (users.find(u => u.username === userData.username)) {
        return { success: false, error: 'Username already exists' }
      }

      if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email already registered' }
      }

      if (!userData.agreeToTerms) {
        return { success: false, error: 'You must agree to the terms and conditions' }
      }

      // Create new user
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isOnline: true,
        preferences: {
          theme: 'auto',
          language: 'en-US',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: true,
          privacy: 'public'
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date().toISOString(),
          loginAttempts: 0,
          accountLocked: false
        }
      }

      setUsers(prev => [...prev, newUser])
      // Store password (in real app, this would be hashed)
      userPasswords[newUser.id] = userData.password
      setCurrentUser(newUser)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (currentUser) {
      setUsers(prev => prev.map(u => 
        u.id === currentUser.id ? { ...u, isOnline: false } : u
      ))
    }
    setCurrentUser(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) return false

    try {
      const updatedUser = { ...currentUser, ...updates }
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
      setCurrentUser(updatedUser)
      return true
    } catch (error) {
      return false
    }
  }

  const deleteAccount = async (password: string): Promise<boolean> => {
    if (!currentUser) return false

    try {
      const storedPassword = userPasswords[currentUser.id]
      if (storedPassword !== password) return false

      setUsers(prev => prev.filter(u => u.id !== currentUser.id))
      delete userPasswords[currentUser.id]
      setCurrentUser(null)
      return true
    } catch (error) {
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    await simulateDelay(1000)
    const user = users.find(u => u.email === email)
    return !!user
  }

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    await simulateDelay(500)
    return code === '123456' // Demo code
  }

  const value: AuthContextType = {
    currentUser,
    users,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    resetPassword,
    verifyTwoFactor
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
