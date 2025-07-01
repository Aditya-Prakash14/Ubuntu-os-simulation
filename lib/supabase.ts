import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey)

// Create Supabase client lazily
let _supabase: SupabaseClient<Database> | null = null

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) return null

  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }

  return _supabase
}

// Export for backward compatibility
export const supabase = getSupabaseClient()

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const client = getSupabaseClient()
  if (!client) return { data: null, error: new Error('Supabase not configured') }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const client = getSupabaseClient()
  if (!client) return { data: null, error: new Error('Supabase not configured') }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const client = getSupabaseClient()
  if (!client) return { error: new Error('Supabase not configured') }

  const { error } = await client.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const client = getSupabaseClient()
  if (!client) return { user: null, error: new Error('Supabase not configured') }

  const { data: { user }, error } = await client.auth.getUser()
  return { user, error }
}

// Database helpers
export const createUserProfile = async (userId: string, profileData: any) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      ...profileData
    })
    .select()
    .single()

  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// File system helpers
export const createFile = async (userId: string, path: string, content: string, metadata: any = {}) => {
  const { data, error } = await supabase
    .from('file_system')
    .insert({
      user_id: userId,
      path,
      name: path.split('/').pop() || '',
      type: 'file',
      content,
      metadata,
      permissions: '644',
      owner_uid: 1000,
      group_gid: 1000,
      size: content.length
    })
    .select()
    .single()
  
  return { data, error }
}

export const createDirectory = async (userId: string, path: string, metadata: any = {}) => {
  const { data, error } = await supabase
    .from('file_system')
    .insert({
      user_id: userId,
      path,
      name: path.split('/').pop() || '',
      type: 'directory',
      content: '',
      metadata,
      permissions: '755',
      owner_uid: 1000,
      group_gid: 1000,
      size: 0
    })
    .select()
    .single()
  
  return { data, error }
}

export const getFileSystemTree = async (userId: string, path: string = '/') => {
  const { data, error } = await supabase
    .from('file_system')
    .select('*')
    .eq('user_id', userId)
    .like('path', `${path}%`)
    .order('path')
  
  return { data, error }
}

export const updateFile = async (userId: string, path: string, content: string) => {
  const { data, error } = await supabase
    .from('file_system')
    .update({
      content,
      size: content.length,
      modified_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('path', path)
    .select()
    .single()
  
  return { data, error }
}

export const deleteFile = async (userId: string, path: string) => {
  const { data, error } = await supabase
    .from('file_system')
    .delete()
    .eq('user_id', userId)
    .eq('path', path)
  
  return { data, error }
}

// Terminal session helpers
export const saveTerminalSession = async (userId: string, sessionData: any) => {
  const { data, error } = await supabase
    .from('terminal_sessions')
    .upsert({
      user_id: userId,
      ...sessionData
    })
    .select()
    .single()
  
  return { data, error }
}

export const getTerminalSession = async (userId: string, sessionId?: string) => {
  let query = supabase
    .from('terminal_sessions')
    .select('*')
    .eq('user_id', userId)
  
  if (sessionId) {
    query = query.eq('id', sessionId)
  } else {
    query = query.eq('is_active', true).limit(1)
  }
  
  const { data, error } = await query.single()
  return { data, error }
}

// Settings helpers
export const saveUserSetting = async (userId: string, category: string, key: string, value: any) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      category,
      key,
      value
    })
    .select()
    .single()
  
  return { data, error }
}

export const getUserSettings = async (userId: string, category?: string) => {
  let query = supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  return { data, error }
}

// Real-time subscriptions
export const subscribeToFileSystem = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`file_system:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'file_system',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

export const subscribeToTerminalSession = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`terminal:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'terminal_sessions',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

export const subscribeToUserSettings = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`settings:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_settings',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}
