'use client'
import { useState } from 'react'
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase().auth.signInWithPassword({ email, password })
      if (error) {
        setError('Correo o contraseña incorrectos.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Error al conectar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                      bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-4">
            <Bot size={24} className="text-surface" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">316Bot</h1>
          <p className="text-white/40 text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">

          <div>
            <label className="block text-white/50 text-sm mb-2 font-medium">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-2 font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full py-3 mt-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>

        </form>

        <p className="text-center text-white/20 text-xs mt-6 font-mono">
          316Bot © {new Date().getFullYear()}
        </p>

      </div>
    </main>
  )
}
