export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET: obtener config del usuario
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('user_configs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ config: data || null })
}

// POST: crear o actualizar config del usuario
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      businessName,
      phoneNumberId,
      whatsappToken,
      contextPrompt,
      aiProvider,
      aiApiKey,
      aiModel,
      aiBaseUrl,
    } = body

    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const db = supabaseAdmin()

    const configData = {
      user_id: userId,
      business_name: businessName || '',
      phone_number_id: phoneNumberId || '',
      whatsapp_token: whatsappToken || '',
      context_prompt: contextPrompt || '',
      ai_provider: aiProvider || 'groq',
      ai_api_key: aiApiKey || '',
      ai_model: aiModel || 'llama-3.1-70b-versatile',
      ai_base_url: aiBaseUrl || null,
      is_active: !!(phoneNumberId && whatsappToken && aiApiKey),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await db
      .from('user_configs')
      .upsert(configData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ config: data, success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH: obtener conversaciones del usuario
export async function PATCH(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

  const db = supabaseAdmin()

  const { data: config } = await db
    .from('user_configs')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!config) return NextResponse.json({ conversations: [] })

  const { data: conversations } = await db
    .from('conversations')
    .select('*')
    .eq('user_config_id', config.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ conversations: conversations || [] })
}
