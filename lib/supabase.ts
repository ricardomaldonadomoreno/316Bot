import { createClient } from '@supabase/supabase-js'

export function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type UserConfig = {
  id: string
  user_id: string
  phone_number_id: string
  whatsapp_token: string
  business_name: string
  context_prompt: string
  ai_provider: 'groq' | 'gemini' | 'qwen' | 'openai'
  ai_api_key: string
  ai_model: string
  is_active: boolean
  created_at: string
}

export type Conversation = {
  id: string
  user_config_id: string
  customer_phone: string
  messages: Message[]
  created_at: string
  updated_at: string
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
