"use client"

import SupabaseUbuntuOS from "@/components/SupabaseUbuntuOS"
import UbuntuSystem from "../desktop.tsx"

export default function Page() {
  // Check if Supabase is configured
  const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (hasSupabaseConfig) {
    // Use Supabase-integrated Ubuntu OS with persistence and collaboration
    return <SupabaseUbuntuOS />
  } else {
    // Fallback to original Ubuntu OS without persistence
    return <UbuntuSystem />
  }
}
