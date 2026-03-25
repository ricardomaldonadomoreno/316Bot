export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { parseIncomingMessage, sendWhatsAppMessage } from '@/lib/whatsapp'
import { generateAIResponse, AIProvider } from '@/lib/ai'
import type { WhatsAppWebhookBody } from '@/lib/whatsapp'

// GET: verificación del webhook por Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado por Meta')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST: recibe mensajes entrantes de WhatsApp
export async function POST(req: NextRequest) {
  try {
    const body: WhatsAppWebhookBody = await req.json()

    // Parsear el mensaje entrante
    const incoming = parseIncomingMessage(body)
    if (!incoming) {
      return NextResponse.json({ status: 'ignored' })
    }

    const { from, text, phoneNumberId } = incoming
    const db = supabaseAdmin()

    // Buscar la configuración del bot asociada a este número de WhatsApp
    const { data: config } = await db
      .from('user_configs')
      .select('*')
      .eq('phone_number_id', phoneNumberId)
      .eq('is_active', true)
      .single()

    if (!config) {
      console.warn(`No hay config activa para phone_number_id: ${phoneNumberId}`)
      return NextResponse.json({ status: 'no_config' })
    }

    // Buscar o crear la conversación con este cliente
    const { data: conversation } = await db
      .from('conversations')
      .select('*')
      .eq('user_config_id', config.id)
      .eq('customer_phone', from)
      .single()

    const messages = conversation?.messages || []

    // Agregar el nuevo mensaje del cliente
    const newUserMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    messages.push(newUserMessage)

    // Mantener solo los últimos 20 mensajes para el contexto
    const contextMessages = messages.slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Generar respuesta con IA
    const systemPrompt = buildSystemPrompt(config.context_prompt, config.business_name)
    const aiResponse = await generateAIResponse({
      provider: config.ai_provider as AIProvider,
      apiKey: config.ai_api_key,
      model: config.ai_model,
      systemPrompt,
      messages: contextMessages,
    })

    // Agregar respuesta del bot al historial
    messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    })

    // Guardar conversación actualizada
    if (conversation) {
      await db
        .from('conversations')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
    } else {
      await db.from('conversations').insert({
        user_config_id: config.id,
        customer_phone: from,
        messages,
      })
    }

    // Enviar respuesta por WhatsApp
    await sendWhatsAppMessage({
      phoneNumberId: config.phone_number_id,
      token: config.whatsapp_token,
      to: from,
      text: aiResponse,
    })

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error en webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

function buildSystemPrompt(contextPrompt: string, businessName: string): string {
  return `Eres un asistente virtual de ventas para ${businessName || 'este negocio'}.

CONTEXTO DE TU NEGOCIO Y PRODUCTOS:
${contextPrompt}

INSTRUCCIONES:
- Responde SIEMPRE en español de forma amigable y natural
- Sé conciso (máximo 3-4 oraciones por respuesta para WhatsApp)
- Si el cliente pregunta por un producto, explica sus beneficios y cómo comprarlo
- Si no sabes algo, di que lo consultarás y responderás pronto
- No inventes precios ni información que no esté en el contexto
- Cierra siempre con una invitación a comprar o consultar más
- Usa emojis ocasionalmente para hacer la conversación más amena`
}
