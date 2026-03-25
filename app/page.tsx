'use client'
import Link from 'next/link'
import { MessageCircle, Zap, Bot, ArrowRight, CheckCircle2, Layers } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

      {/* Glow top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                      bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-surface" />
          </div>
          <span className="font-bold text-lg tracking-tight">316Bot</span>
        </div>
        <Link href="/dashboard" className="btn-primary text-sm py-2 px-5">
          Entrar al dashboard
          <ArrowRight size={15} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20
                        text-accent text-xs font-mono px-4 py-1.5 rounded-full mb-8
                        animate-fade-up opacity-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Conecta tu WhatsApp en menos de 5 minutos
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]
                       text-white mb-6 animate-fade-up opacity-0 delay-100">
          Tu bot de ventas
          <br />
          <span className="text-accent">24/7 en WhatsApp</span>
        </h1>

        <p className="text-white/50 text-xl max-w-2xl mx-auto mb-12
                      animate-fade-up opacity-0 delay-200">
          Conecta la API de Meta, elige tu IA favorita y configura el contexto
          de tu negocio. El bot responde solo — tú vendes mientras duermes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center
                        animate-fade-up opacity-0 delay-300">
          <Link href="/dashboard" className="btn-primary text-base px-8 py-4">
            Crear mi bot gratis
            <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" className="btn-ghost text-base px-8 py-4">
            Ver demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap size={20} className="text-accent" />,
              title: 'Setup guiado en 4 pasos',
              desc: 'Sin programar. Sigue los pasos visuales y tu bot estará activo en minutos.',
            },
            {
              icon: <Layers size={20} className="text-accent" />,
              title: 'Elige tu IA favorita',
              desc: 'Groq, Gemini, Qwen u OpenAI. Todas con tier gratuito disponible.',
            },
            {
              icon: <MessageCircle size={20} className="text-accent" />,
              title: 'Multi-tenant listo',
              desc: 'Cada usuario tiene su propia configuración, número y contexto de negocio.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-card p-6 hover:border-border-hover transition-all duration-300
                         animate-fade-up opacity-0"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center
                              justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps preview */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-center mb-12">
          ¿Cómo funciona?
        </h2>
        <div className="space-y-4">
          {[
            { n: '01', title: 'Conecta Meta API', desc: 'Ingresa tu token de acceso y número de WhatsApp Business.' },
            { n: '02', title: 'Vincula tu número', desc: 'Asocia tu Phone Number ID de la API de Meta.' },
            { n: '03', title: 'Define el contexto', desc: 'Describe tu negocio y productos. La IA aprenderá de esto.' },
            { n: '04', title: 'Elige tu IA', desc: 'Conecta Groq, Gemini, Qwen u OpenAI con tu API key.' },
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-5 glass-card px-6 py-5
                         hover:border-border-hover transition-all group"
            >
              <span className="font-mono text-accent/60 text-sm font-bold mt-0.5 w-8">
                {step.n}
              </span>
              <div>
                <h4 className="font-semibold text-white group-hover:text-accent transition-colors">
                  {step.title}
                </h4>
                <p className="text-white/40 text-sm mt-0.5">{step.desc}</p>
              </div>
              <CheckCircle2 size={18} className="ml-auto text-accent/30
                            group-hover:text-accent transition-colors mt-0.5 shrink-0" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/dashboard" className="btn-primary inline-flex text-base px-10 py-4">
            Comenzar ahora — es gratis
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center">
        <p className="text-white/20 text-sm font-mono">
          316Bot © {new Date().getFullYear()} — Construido con Next.js + Vercel
        </p>
      </footer>
    </main>
  )
}
