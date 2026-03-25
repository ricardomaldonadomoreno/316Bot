# 🤖 316Bot — WhatsApp AI SaaS

Bot de WhatsApp con IA para vender productos digitales.

### Configura el Webhook en Meta

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Tu app → WhatsApp → Configuración
3. En **Webhooks**, agrega:
   - **URL del callback**: `https://316bot.vercel.app/api/webhook`
   - **Verify token**: el mismo que pusiste en `META_WEBHOOK_VERIFY_TOKEN`
4. Suscríbete al campo: `messages`

---

## 🏗️ Estructura del proyecto

```
316bot/
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.ts      ← Recibe mensajes de WhatsApp
│   │   └── users/
│   │       └── route.ts      ← CRUD de configuraciones
│   ├── dashboard/
│   │   └── page.tsx          ← Panel con los 4 pasos
│   ├── layout.tsx            ← Layout global
│   ├── page.tsx              ← Landing page
│   └── globals.css           ← Estilos globales
├── lib/
│   ├── ai.ts                 ← Groq, Gemini, Qwen, OpenAI
│   ├── supabase.ts           ← Cliente de base de datos
│   └── whatsapp.ts           ← Meta API helpers
├── supabase-schema.sql       ← Ejecutar en Supabase
├── .env.example              ← Variables de entorno necesarias
└── README.md
```

---

## 🧠 Proveedores de IA soportados

| Proveedor | Tier gratis | Modelo recomendado | Velocidad |
|---|---|---|---|
| **Groq** | ✅ Sí | llama-3.1-70b-versatile | ⚡ Ultra rápido |
| **Google Gemini** | ✅ Sí | gemini-1.5-flash | 🚀 Rápido |
| **Qwen (Alibaba)** | ✅ Sí | qwen-turbo | 🚀 Rápido |
| **OpenAI** | ❌ Pago | gpt-4o-mini | 🚀 Rápido |

---

## 🔑 Dónde obtener las API keys

| Proveedor | Link |
|---|---|
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Qwen | [dashscope-intl.aliyuncs.com](https://dashscope-intl.aliyuncs.com) |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |

---

## 📦 Tech stack

| Tecnología | Uso |
|---|---|
| **Next.js 14** | Frontend + Backend (App Router) |
| **Tailwind CSS** | Estilos |
| **Supabase** | Base de datos PostgreSQL |
| **Vercel** | Deploy (gratis) |
| **Meta WhatsApp Business API** | Mensajería |
| **Groq / Gemini / Qwen / OpenAI** | Motores de IA |

---

## 💡 Cómo funciona el flujo

```
Cliente escribe en WhatsApp
        ↓
Meta API llama al webhook en Vercel
        ↓
El servidor busca la config del bot
        ↓
Llama a la IA con el contexto del negocio
        ↓
Envía la respuesta por WhatsApp
        ↓
Guarda la conversación en Supabase
```

---

Construido con ❤️ · [316Bot](https://316bot.vercel.app)
