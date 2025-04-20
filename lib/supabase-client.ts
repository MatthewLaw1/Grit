import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

// TODO: Update NEXT_PUBLIC_SUPABASE_ANON_KEY to use a proper anon key instead of service role key
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Temporarily using the same key, should be changed

// Regular client with anonymous access
export const supabase = createClient(url, anonKey)

// Admin client with service role access
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
