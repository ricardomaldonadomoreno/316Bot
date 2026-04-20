import Groq from 'groq-sdk'
import OpenAI from 'openai'

export type AIProvider = 'groq' | 'gemini' | 'qwen' | 'openai' | 'custom'

export const AI_PROVIDERS = {
  groq: {
    name: 'Groq',
    description: 'Ultra rápido, gratis',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    defaultModel: 'llama-3.1-70b-versatile',
    badge: 'GRATIS',
    color: '#f97316',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Potente, tier gratis generoso',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-1.5-flash',
    badge: 'GRATIS',
    color: '#4285f4',
  },
  qwen: {
    name: 'Qwen (Alibaba)',
    description: 'Bueno en español',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    defaultModel: 'qwen-turbo',
    badge: 'GRATIS',
    color: '#6b21a8',
  },
  openai: {
    name: 'OpenAI GPT',
    description: 'GPT-4o mini, económico',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    badge: 'PAGO',
    color: '#10a37f',
  },
  custom: {
    name: 'Personalizado',
    description: 'Mistral, DeepSeek, Together, cualquier API compatible con OpenAI',
    models: ['escribe-tu-modelo'],
    defaultModel: 'escribe-tu-modelo',
    badge: 'CUSTOM',
    color: '#8b5cf6',
  },
}

export async function generateAIResponse({
  provider,
  apiKey,
  model,
  systemPrompt,
  messages,
  baseURL,
}: {
  provider: AIProvider
  apiKey: string
  model: string
  systemPrompt: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  baseURL?: string
}): Promise<string> {
  const allMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ]

  switch (provider) {
    case 'groq': {
      const groq = new Groq({ apiKey })
      const res = await groq.chat.completions.create({
        model,
        messages: allMessages,
        max_tokens: 500,
        temperature: 0.7,
      })
      return res.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'
    }

    case 'openai': {
      const openai = new OpenAI({ apiKey })
      const res = await openai.chat.completions.create({
        model,
        messages: allMessages,
        max_tokens: 500,
        temperature: 0.7,
      })
      return res.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'
    }

    case 'gemini': {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({ model })
      const chat = geminiModel.startChat({
        systemInstruction: systemPrompt,
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      })
      const lastMsg = messages[messages.length - 1]
      const result = await chat.sendMessage(lastMsg?.content || '')
      return result.response.text()
    }

    case 'qwen': {
      // Qwen via OpenAI-compatible API
      const openai = new OpenAI({
        apiKey,
        baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      })
      const res = await openai.chat.completions.create({
        model,
        messages: allMessages,
        max_tokens: 500,
        temperature: 0.7,
      })
      return res.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'
    }

    case 'custom': {
      // Cualquier API compatible con OpenAI (Mistral, DeepSeek, Together, Anthropic, etc.)
      if (!baseURL) throw new Error('El proveedor personalizado requiere una Base URL')
      const openai = new OpenAI({ apiKey, baseURL })
      const res = await openai.chat.completions.create({
        model,
        messages: allMessages,
        max_tokens: 500,
        temperature: 0.7,
      })
      return res.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'
    }

    default:
      throw new Error(`Proveedor de IA no soportado: ${provider}`)
  }
}
