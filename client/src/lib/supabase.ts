import { createClient } from '@supabase/supabase-js'

// Admin auth uses the same Supabase project as video-title-finder for unified login
const ADMIN_SUPABASE_URL = "https://gbnfaysfuevpuwdovrbg.supabase.co";
const ADMIN_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibmZheXNmdWV2cHV3ZG92cmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODM0OTIsImV4cCI6MjA3OTY1OTQ5Mn0.vqdGrQ83t0EwiccLjhBDvBjoe2iE3IgjCXSXXpP9Ids";

// Memorial features can use environment variables if needed
const memorialSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const memorialSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Primary supabase client for admin auth
export const supabase = createClient(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_ANON_KEY)

// Optional: separate client for memorial features if configured
export const memorialSupabase = memorialSupabaseUrl && memorialSupabaseAnonKey 
    ? createClient(memorialSupabaseUrl, memorialSupabaseAnonKey)
    : null
