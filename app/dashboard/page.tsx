'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Bot, CheckCircle2, Circle, ExternalLink, Eye, EyeOff,
  MessageCircle, RefreshCw, Save, Wifi, WifiOff, ChevronRight,
  Sparkles, Copy, Check, AlertCircle
} from 'lucide-react'
import { AI_PROVIDERS, AIProvider } from '@/lib/ai'
import Link from 'next/link'
import clsx from 'clsx'

const DEMO_USER_ID = 'demo-user-001'

type Config = {
  businessName: string
  phoneNumberId: string
  whatsappToken: string
  contextPrompt: string
  aiProvider: AIProvider
  aiApiKey: string
  aiModel: string
  aiBaseUrl: string
  botInstructions: string
}

const defaultConfig: Config = {
  businessName: '',
  phoneNumberId: '',
  whatsappToken: '',
  contextPrompt: '',
  aiProvider: 'groq',
  aiApiKey: '',
  aiModel: 'llama-3.1-70b-versatile',
  aiBaseUrl: '',
  botInstructions: '',
}

type ConvMessage = {
  role: string
  content: string
  timestamp: string
}

type Conversation = {
  id: string
  customer_phone: string
  messages: ConvMessage[]
  updated_at: string
}

export default function Dashboard() {
  const [activeStep, setActiveStep] = useState(0)
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showAiKey, setShowAiKey] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConvs, setLoadingConvs] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false])

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.vercel.app'}/api/webhook`

  const updateCompleted = useCallback((cfg: Config) => {
    setCompletedSteps([
      !!(cfg.whatsappToken && cfg.businessName),
      !!cfg.phoneNumberId,
      cfg.contextPrompt.length > 30,
      !!(cfg.aiProvider && cfg.aiApiKey),
    ])
  }, [])

  useEffect(() => {
    fetch(`/api/users?userId=${DEMO_USER_ID}`)
      .then(r => r.json())
      .then(({ config: c }) => {
        if (c) {
          const loaded: Config = {
            businessName: c.business_name,
            phoneNumberId: c.phone_number_id,
            whatsappToken: c.whatsapp_token,
            contextPrompt: c.context_prompt,
            aiProvider: c.ai_provider,
            aiApiKey: c.ai_api_key,
            aiModel: c.ai_model,
            aiBaseUrl: c.ai_base_url || '',
            botInstructions: c.bot_instructions || '',
          }
          setConfig(loaded)
          setIsActive(c.is_active)
          updateCompleted(loaded)
          if (c.is_active) setActiveStep(4)
        }
      })
      .catch(() => {})
  }, [updateCompleted])

  const updateField = (field: keyof Config, value: string) => {
    const next = { ...config, [field]: value }
    setConfig(next)
    updateCompleted(next)
    setSaved(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          businessName: config.businessName,
          phoneNumberId: config.phoneNumberId,
          whatsappToken: config.whatsappToken,
          contextPrompt: config.contextPrompt,
          aiProvider: config.aiProvider,
          aiApiKey: config.aiApiKey,
          aiModel: config.aiModel,
          aiBaseUrl: config.aiBaseUrl || null,
          botInstructions: config.botInstructions || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setIsActive(data.config.is_active)
        if (completedSteps.every(Boolean)) setActiveStep(4)
      }
    } catch {
      alert('Error al guardar. Revisa tu conexión.')
    } finally {
      setSaving(false)
    }
  }

  const loadConversations = async () => {
    setLoadingConvs(true)
    try {
      const res = await fetch(`/api/users?userId=${DEMO_USER_ID}`, { method: 'PATCH' })
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {
      setConversations([])
    } finally {
      setLoadingConvs(false)
    }
  }

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  const steps = [
    { title: 'Meta API', short: 'API Meta' },
    { title: 'Número', short: 'Número' },
    { title: 'Contexto', short: 'Contexto' },
    { title: 'IA', short: 'IA' },
  ]

  const allComplete = completedSteps.every(Boolean)
  const selectedConvData = conversations.find(c => c.id === selectedConv)

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Bot size={16} className="text-surface" />
            </div>
            <span className="font-bold tracking-tight">316Bot</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className={clsx(
              'flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border',
              isActive
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-white/5 border-border text-white/40'
            )}>
              {isActive ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isActive ? 'Bot activo' : 'Bot inactivo'}
            </div>
            <button
              onClick={saveConfig}
              disabled={saving}
              className="btn-primary text-sm py-2 px-4"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : saved ? (
                <Check size={14} />
              ) : (
                <Save size={14} />
              )}
              {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Steps navigation */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm whitespace-nowrap',
                activeStep === i
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border hover:border-border-hover text-white/40 hover:text-white'
              )}
            >
              {completedSteps[i] ? (
                <CheckCircle2 size={16} className={activeStep === i ? 'text-accent' : 'text-accent/50'} />
              ) : (
                <div className={clsx(
                  'step-badge w-6 h-6 text-xs',
                  activeStep === i ? 'bg-accent text-surface' : 'bg-surface-3 text-white/30'
                )}>
                  {i + 1}
                </div>
              )}
              <span className="font-medium hidden sm:inline">{step.title}</span>
              <span className="font-medium sm:hidden">{step.short}</span>
            </button>
          ))}

          <ChevronRight size={14} className="text-white/20 mx-1 shrink-0" />

          <button
            onClick={() => { setActiveStep(4); loadConversations() }}
            className={clsx(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm whitespace-nowrap',
              activeStep === 4
                ? 'border-accent/40 bg-accent/10 text-accent'
                : allComplete
                  ? 'border-border hover:border-border-hover text-white/50 hover:text-white'
                  : 'border-border/40 text-white/20 cursor-not-allowed'
            )}
            disabled={!allComplete && activeStep !== 4}
          >
            <MessageCircle size={15} />
            <span className="font-medium">En vivo</span>
          </button>
        </div>

        {/* ── PASO 1 — Meta API ── */}
        {activeStep === 0 && (
          <StepCard
            step={1}
            title="Crea tu propia app en Meta"
            desc="Cada usuario necesita su propia app en Meta Developers. Tú controlas tu número y pagas directamente a Meta."
            completed={completedSteps[0]}
          >
            <div className="space-y-6">

              {/* Aviso importante */}
              <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-400 font-semibold mb-1">Tu app, tu número, tu control</p>
                  <p className="text-white/50 leading-relaxed">
                    316Bot es el motor que procesa tus mensajes con IA. La cuenta de
                    WhatsApp Business y los costos de mensajería son directamente tuyos
                    con Meta — así tu negocio es completamente independiente y seguro.
                  </p>
                </div>
              </div>

              {/* Guía paso a paso */}
              <div className="bg-surface-3 border border-border rounded-xl p-5 space-y-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  Cómo crear tu app en Meta — paso a paso
                </p>
                {[
                  {
                    n: 1,
                    text: 'Ve a',
                    link: 'https://developers.facebook.com',
                    label: 'developers.facebook.com',
                    extra: 'e inicia sesión con tu cuenta de Facebook'
                  },
                  { n: 2, text: 'Clic en "Mis apps" → "Crear app" → Tipo: "Empresa"' },
                  { n: 3, text: 'Dentro de tu app, busca el producto "WhatsApp" y haz clic en "Configurar"' },
                  { n: 4, text: 'Conecta o crea una cuenta de WhatsApp Business con tu número de teléfono' },
                  { n: 5, text: 'En "Configuración de la API", copia tu Token de acceso permanente' },
                  { n: 6, text: 'En esa misma sección configura el Webhook con la URL que aparece abajo 👇' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-accent/60 shrink-0 w-5 mt-0.5">{s.n}.</span>
                    <span className="text-white/50 leading-relaxed">
                      {s.text}{' '}
                      {s.link && (
                        <a href={s.link} target="_blank" rel="noopener noreferrer"
                          className="text-accent hover:underline inline-flex items-center gap-1">
                          {s.label} <ExternalLink size={11} />
                        </a>
                      )}
                      {s.extra && ` ${s.extra}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-white/50 text-sm mb-1.5 font-medium">
                  URL de Webhook — pégala en tu app de Meta
                </label>
                <p className="text-white/25 text-xs mb-2">
                  Meta Developers → tu app → WhatsApp → Configuración → Webhooks → Editar
                </p>
                <div className="flex gap-2">
                  <div className="input-field flex-1 cursor-default select-all text-accent/80 truncate">
                    {webhookUrl}
                  </div>
                  <button onClick={copyWebhook} className="btn-ghost px-4 py-2.5 text-sm shrink-0">
                    {copiedWebhook ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
                  </button>
                </div>
                <div className="mt-2 bg-surface-3 border border-border rounded-lg px-3 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-white/30 text-xs font-mono">Verify token:</span>
                  <span className="text-accent/80 text-xs font-mono font-bold">316bot-verify-2024</span>
                  <span className="text-white/20 text-xs">← copia este valor exacto en Meta</span>
                </div>
              </div>

              {/* Campos */}
              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">
                  Nombre de tu negocio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cursos Pro, Mi Tienda Digital..."
                  value={config.businessName}
                  onChange={e => updateField('businessName', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">
                  Token de acceso permanente de tu app de Meta
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="EAAxxxxxxxxxxxxxxxx..."
                    value={config.whatsappToken}
                    onChange={e => updateField('whatsappToken', e.target.value)}
                    className="input-field pr-12"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-white/25 text-xs mt-1.5">
                  Guardado de forma segura. Solo se usa para enviar respuestas desde tu número.
                </p>
              </div>

              {/* Info costos */}
              <div className="flex items-start gap-3 bg-surface-3 border border-border rounded-xl p-4">
                <span className="text-base shrink-0">💡</span>
                <p className="text-xs text-white/40 leading-relaxed">
                  <span className="text-white/60 font-semibold">¿Cuánto cuesta Meta? </span>
                  Las primeras 1,000 conversaciones al mes son gratis. Después el costo varía
                  entre $0.01 y $0.06 USD por conversación según el país. Lo pagas directamente
                  a Meta con tu tarjeta — 316Bot no interviene en ese cobro.
                </p>
              </div>

            </div>
            <StepNav onNext={() => setActiveStep(1)} disabled={!completedSteps[0]} />
          </StepCard>
        )}

        {/* ── PASO 2 — Phone Number ID ── */}
        {activeStep === 1 && (
          <StepCard
            step={2}
            title="Vincula tu número de WhatsApp"
            desc="El Phone Number ID es el identificador único de tu número en la API de Meta."
            completed={completedSteps[1]}
          >
            <div className="space-y-6">
              <div className="bg-surface-3 border border-border rounded-xl p-5 space-y-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  ¿Dónde encuentro el Phone Number ID?
                </p>
                {[
                  { n: 1, text: 'En Meta for Developers, entra a tu app' },
                  { n: 2, text: 'Clic en "WhatsApp" → "Configuración de la API"' },
                  { n: 3, text: 'Verás la sección "Número de teléfono"' },
                  { n: 4, text: 'Copia el valor que dice "Phone Number ID" — son solo números' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-accent/60 shrink-0 w-5">{s.n}.</span>
                    <span className="text-white/50">{s.text}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  placeholder="Ej: 123456789012345"
                  value={config.phoneNumberId}
                  onChange={e => updateField('phoneNumberId', e.target.value.replace(/\D/g, ''))}
                  className="input-field"
                />
                <p className="text-white/25 text-xs mt-1.5">
                  Solo números. No es tu número de teléfono, es el ID interno que asigna Meta.
                </p>
              </div>

              {config.phoneNumberId && (
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-accent text-sm">
                    <CheckCircle2 size={15} />
                    <span>ID configurado: <span className="font-mono">{config.phoneNumberId}</span></span>
                  </div>
                </div>
              )}
            </div>
            <StepNav onBack={() => setActiveStep(0)} onNext={() => setActiveStep(2)} disabled={!completedSteps[1]} />
          </StepCard>
        )}

        {/* ── PASO 3 — Contexto ── */}
        {activeStep === 2 && (
          <StepCard
            step={3}
            title="Define el contexto de tu negocio"
            desc="Esto es lo que la IA sabrá sobre ti. Cuanto más detallado, mejor venderá."
            completed={completedSteps[2]}
          >
            <div className="space-y-6">
              <div className="bg-surface-3 border border-border rounded-xl p-5">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                  Incluye en tu contexto
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    '¿Qué vendes exactamente?',
                    'Precios de cada producto',
                    'Cómo se hace el pago',
                    'Método de entrega o acceso',
                    'Garantías u ofertas activas',
                    'Tu forma de contacto',
                  ].map((tip) => (
                    <div key={tip} className="flex items-center gap-2 text-sm text-white/40">
                      <Sparkles size={12} className="text-accent/50 shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">
                  Contexto del negocio
                </label>
                <textarea
                  rows={12}
                  placeholder={`Ejemplo:\n\nSoy una tienda digital que vende:\n\n1. Curso de Marketing Digital — $97 USD\n   Contenido: 40 horas de video, plantillas, soporte.\n   Acceso: Inmediato por email tras el pago.\n\n2. Pack de Plantillas Canva — $27 USD\n   100 plantillas profesionales para redes sociales.\n\nFormas de pago: PayPal, Stripe, transferencia.\nGarantía: 30 días de devolución sin preguntas.`}
                  value={config.contextPrompt}
                  onChange={e => updateField('contextPrompt', e.target.value)}
                  className="input-field resize-none"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-white/25 text-xs">Mínimo 30 caracteres. Más detalle = mejores respuestas.</p>
                  <span className={clsx(
                    'text-xs font-mono',
                    config.contextPrompt.length >= 30 ? 'text-accent/60' : 'text-white/25'
                  )}>
                    {config.contextPrompt.length} chars
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">
                  Instrucciones del bot
                  <span className="ml-2 text-[10px] font-mono bg-surface-3 border border-border px-1.5 py-0.5 rounded text-white/30">
                    OPCIONAL
                  </span>
                </label>
                <textarea
                  rows={5}
                  placeholder={`Ej:
- Responde siempre en inglés
- Si el cliente pregunta por descuentos, ofrece un 10% con el código PROMO10
- Nunca menciones a la competencia
- Si preguntan por soporte técnico, diles que escriban a soporte@minegocio.com`}
                  value={config.botInstructions}
                  onChange={e => updateField('botInstructions', e.target.value)}
                  className="input-field resize-none"
                />
                <p className="text-white/25 text-xs mt-1.5">
                  Reglas adicionales para el bot. Se combinan con las instrucciones base inteligentes de 316Bot.
                </p>
              </div>
            </div>
            <StepNav onBack={() => setActiveStep(1)} onNext={() => setActiveStep(3)} disabled={!completedSteps[2]} />
          </StepCard>
        )}

        {/* ── PASO 4 — IA ── */}
        {activeStep === 3 && (
          <StepCard
            step={4}
            title="Conecta tu motor de IA"
            desc="Elige el proveedor de IA que responderá a tus clientes automáticamente."
            completed={completedSteps[3]}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-white/50 text-sm mb-3 font-medium">
                  Proveedor de IA
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.entries(AI_PROVIDERS) as [AIProvider, typeof AI_PROVIDERS[AIProvider]][]).map(([key, p]) => (
                    <button
                      key={key}
                      onClick={() => {
                        updateField('aiProvider', key)
                        updateField('aiModel', p.defaultModel)
                      }}
                      className={clsx(
                        'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                        config.aiProvider === key
                          ? 'border-accent/40 bg-accent/5'
                          : 'border-border hover:border-border-hover'
                      )}
                    >
                      <div className="mt-0.5">
                        {config.aiProvider === key
                          ? <CheckCircle2 size={16} className="text-accent" />
                          : <Circle size={16} className="text-white/20" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-white">{p.name}</span>
                          <span className={clsx(
                            'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
                            p.badge === 'GRATIS'
                              ? 'bg-accent/20 text-accent'
                              : p.badge === 'CUSTOM'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-amber-500/20 text-amber-400'
                          )}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-white/35 text-xs">{p.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">Modelo</label>
                {config.aiProvider === 'custom' ? (
                  <input
                    type="text"
                    placeholder="Ej: mistral-7b-instruct, deepseek-chat, meta-llama/..."
                    value={config.aiModel}
                    onChange={e => updateField('aiModel', e.target.value)}
                    className="input-field"
                  />
                ) : (
                  <select
                    value={config.aiModel}
                    onChange={e => updateField('aiModel', e.target.value)}
                    className="input-field"
                  >
                    {AI_PROVIDERS[config.aiProvider].models.map(m => (
                      <option key={m} value={m} className="bg-surface-3">{m}</option>
                    ))}
                  </select>
                )}
              </div>

              {config.aiProvider === 'custom' && (
                <div>
                  <label className="block text-white/50 text-sm mb-2 font-medium">
                    Base URL de tu proveedor
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.mistral.ai/v1"
                    value={config.aiBaseUrl}
                    onChange={e => updateField('aiBaseUrl', e.target.value)}
                    className="input-field"
                  />
                  <p className="text-white/25 text-xs mt-1.5">
                    URL base compatible con OpenAI. Ej: Mistral, DeepSeek, Together AI, Ollama...
                  </p>
                </div>
              )}

              <div>
                <label className="block text-white/50 text-sm mb-2 font-medium">
                  API Key de {AI_PROVIDERS[config.aiProvider].name}
                </label>
                <div className="relative">
                  <input
                    type={showAiKey ? 'text' : 'password'}
                    placeholder={
                      config.aiProvider === 'groq' ? 'gsk_...' :
                      config.aiProvider === 'gemini' ? 'AIza...' : 'sk-...'
                    }
                    value={config.aiApiKey}
                    onChange={e => updateField('aiApiKey', e.target.value)}
                    className="input-field pr-12"
                  />
                  <button
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showAiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2">
                  <a
                    href={
                      config.aiProvider === 'groq' ? 'https://console.groq.com/keys' :
                      config.aiProvider === 'gemini' ? 'https://aistudio.google.com/app/apikey' :
                      config.aiProvider === 'qwen' ? 'https://dashscope-intl.aliyuncs.com' :
                      'https://platform.openai.com/api-keys'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent/70 hover:text-accent text-xs flex items-center gap-1 transition-colors"
                  >
                    Obtener API key gratis <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
            <StepNav
              onBack={() => setActiveStep(2)}
              onNext={async () => { await saveConfig(); setActiveStep(4); loadConversations() }}
              nextLabel={allComplete ? '¡Activar mi bot!' : 'Guardar y continuar'}
              disabled={!completedSteps[3]}
            />
          </StepCard>
        )}

        {/* ── PANEL EN VIVO ── */}
        {activeStep === 4 && (
          <div className="animate-fade-up opacity-0">
            <div className={clsx(
              'flex items-center justify-between p-5 rounded-2xl border mb-8',
              isActive ? 'bg-accent/5 border-accent/20' : 'bg-white/3 border-border'
            )}>
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isActive ? 'bg-accent/20' : 'bg-white/5'
                )}>
                  <Bot size={22} className={isActive ? 'text-accent' : 'text-white/30'} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    {isActive ? '¡Bot activo y respondiendo!' : 'Bot configurado'}
                  </h2>
                  <p className="text-white/40 text-sm">
                    {isActive
                      ? `${config.businessName} · ${AI_PROVIDERS[config.aiProvider].name} · ${config.aiModel}`
                      : 'Completa todos los pasos para activar el bot'
                    }
                  </p>
                </div>
              </div>
              {!isActive && (
                <button onClick={() => setActiveStep(0)} className="btn-ghost text-sm py-2 px-4">
                  Configurar
                </button>
              )}
            </div>

            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle size={16} className="text-accent/70" />
                  Conversaciones recientes
                </h3>
                <button
                  onClick={loadConversations}
                  disabled={loadingConvs}
                  className="btn-ghost text-sm py-1.5 px-3"
                >
                  <RefreshCw size={14} className={loadingConvs ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>

              {conversations.length === 0 ? (
                <div className="py-16 text-center">
                  <MessageCircle size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">
                    {isActive
                      ? 'Aún no hay conversaciones. ¡Envía un mensaje a tu número de WhatsApp!'
                      : 'Activa el bot completando los 4 pasos para recibir mensajes.'}
                  </p>
                </div>
              ) : (
                <div className="flex divide-x divide-border" style={{ minHeight: 400 }}>
                  <div className="w-64 divide-y divide-border shrink-0 overflow-y-auto max-h-96">
                    {conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConv(conv.id)}
                        className={clsx(
                          'w-full text-left px-4 py-3 hover:bg-white/3 transition-colors',
                          selectedConv === conv.id && 'bg-accent/5'
                        )}
                      >
                        <p className="font-mono text-sm text-white/70 truncate">
                          +{conv.customer_phone}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5 truncate">
                          {conv.messages?.[conv.messages.length - 1]?.content?.slice(0, 40) || '...'}
                        </p>
                        <p className="text-[10px] text-white/20 mt-1 font-mono">
                          {new Date(conv.updated_at).toLocaleDateString('es', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-3">
                    {selectedConvData ? (
                      selectedConvData.messages.map((msg, i) => (
                        <div key={i} className={clsx(
                          'max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-surface-3 text-white/70 mr-auto'
                            : 'bg-accent/15 text-white ml-auto'
                        )}>
                          {msg.content}
                        </div>
                      ))
                    ) : (
                      <p className="text-white/20 text-sm text-center mt-20">
                        Selecciona una conversación para verla
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepCard({
  step, title, desc, completed, children
}: {
  step: number
  title: string
  desc: string
  completed: boolean
  children: React.ReactNode
}) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-up opacity-0">
      <div className="flex items-start gap-4 mb-8">
        <div className={clsx(
          'step-badge w-10 h-10 shrink-0',
          completed ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-white/50'
        )}>
          {completed ? <CheckCircle2 size={18} /> : step}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/40 text-sm mt-1">{desc}</p>
        </div>
      </div>
      <div className="glass-card p-6 space-y-6">
        {children}
      </div>
    </div>
  )
}

function StepNav({
  onBack, onNext, disabled, nextLabel = 'Siguiente paso →'
}: {
  onBack?: () => void
  onNext?: () => void
  disabled?: boolean
  nextLabel?: string
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      {onBack ? (
        <button onClick={onBack} className="btn-ghost text-sm py-2 px-4">
          ← Atrás
        </button>
      ) : <div />}
      {onNext && (
        <button onClick={onNext} disabled={disabled} className="btn-primary text-sm py-2 px-5">
          {nextLabel}
        </button>
      )}
    </div>
  )
}
