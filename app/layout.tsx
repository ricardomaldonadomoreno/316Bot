import type { Metadata } from 'next'
import { Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: '316Bot — WhatsApp AI para tu negocio',
  description: 'Crea tu chatbot de WhatsApp con IA en minutos. Sin programar.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface text-white antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
