'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient, getUserProfile, createUserProfile, isSupabaseConfigured } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string
  phone: string | null
  created_at: string
  last_login: string | null
  preferences: any
  home_directory: string
  shell: string
  uid: number
  gid: number
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: any }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only initialize if Supabase is configured
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        }
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
          // Update last login
          const client = getSupabaseClient()
          if (client) {
            await client
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id)
          }
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId)
      if (error) {
        console.error('Error loading user profile:', error)
      } else if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const supabase = getSupabaseClient()
    if (!supabase) return { error: new Error('Supabase not configured') }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.fullName,
            phone: userData.phone
          }
        }
      })

      if (error) {
        return { error }
      }

      // The user profile will be created automatically by the database trigger
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) return { error: new Error('Supabase not configured') }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return { error: new Error('Supabase not configured') }

    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setUserProfile(null)
        setSession(null)
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const supabase = getSupabaseClient()
    if (!supabase) return { error: new Error('Supabase not configured') }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' }
    const supabase = getSupabaseClient()
    if (!supabase) return { error: new Error('Supabase not configured') }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { error }
      }

      if (data) {
        setUserProfile(data)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
