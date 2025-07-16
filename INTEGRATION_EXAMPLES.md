# Ejemplo de integración completa

## Integración con el componente principal

```tsx
// app/page.tsx
import VoiceInputDisplay from "@/components/voice-input-display"
import VoiceSettings from "@/components/voice-settings"
import { useState } from "react"

export default function Home() {
  const [voiceSettings, setVoiceSettings] = useState(null)

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* ... resto del contenido ... */}
      
      <VoiceSettings onSettingsChange={setVoiceSettings} />
      <VoiceInputDisplay settings={voiceSettings} />
    </div>
  )
}
```

## Ejemplo de uso con datos dinámicos

```tsx
// hooks/use-dynamic-commands.ts
import { useState, useEffect } from 'react'

export const useDynamicCommands = () => {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    // Cargar datos dinámicos
    fetchAppointments().then(setAppointments)
    fetchDoctors().then(setDoctors)
  }, [])

  const generateDynamicCommands = (command: string) => {
    const commands = []
    
    // Comandos para citas
    appointments.forEach(apt => {
      commands.push({
        trigger: `ver cita con ${apt.doctor}`,
        action: 'navigate',
        element: `#appointment-${apt.id}`,
        context: apt
      })
    })
    
    // Comandos para doctores
    doctors.forEach(doc => {
      commands.push({
        trigger: `buscar doctor ${doc.name}`,
        action: 'search',
        element: '#doctor-search',
        value: doc.name
      })
    })
    
    return commands
  }

  return { generateDynamicCommands }
}
```

## Ejemplo con autenticación

```tsx
// hooks/use-authenticated-commands.ts
import { useUser } from '@/hooks/use-user'

export const useAuthenticatedCommands = () => {
  const { user, isAuthenticated } = useUser()

  const getAvailableCommands = () => {
    const baseCommands = [
      'ir a inicio',
      'ir a servicios',
      'ir a contacto'
    ]

    if (isAuthenticated) {
      return [
        ...baseCommands,
        'ver mi historial',
        'mis citas',
        'agendar cita',
        'ver recetas',
        'descargar resultados'
      ]
    }

    return [
      ...baseCommands,
      'iniciar sesión',
      'registrarse',
      'recuperar contraseña'
    ]
  }

  return { getAvailableCommands }
}
```

## Integración con formularios

```tsx
// components/smart-form.tsx
import { useVoiceCommands } from '@/hooks/use-voice-commands'
import { useEffect, useRef } from 'react'

export const SmartForm = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const { executeVoiceCommand } = useVoiceCommands()

  useEffect(() => {
    const handleVoiceInput = (command: string) => {
      const form = formRef.current
      if (!form) return

      // Mapear comandos a campos del formulario
      const fieldMappings = {
        'llenar nombre': 'input[name="name"]',
        'llenar email': 'input[name="email"]',
        'llenar teléfono': 'input[name="phone"]',
        'seleccionar fecha': 'input[name="date"]',
        'enviar formulario': 'button[type="submit"]'
      }

      const field = fieldMappings[command.toLowerCase()]
      if (field) {
        const element = form.querySelector(field)
        if (element) {
          element.focus()
          // Activar reconocimiento de voz específico para el campo
          if (element.tagName === 'INPUT') {
            startFieldVoiceInput(element)
          }
        }
      }
    }

    // Suscribirse a comandos de voz
    window.addEventListener('voice-command', handleVoiceInput)
    return () => window.removeEventListener('voice-command', handleVoiceInput)
  }, [])

  return (
    <form ref={formRef} className="space-y-4">
      <input
        name="name"
        placeholder="Nombre completo"
        className="w-full p-2 border rounded"
        aria-label="Nombre completo"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        aria-label="Correo electrónico"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Teléfono"
        className="w-full p-2 border rounded"
        aria-label="Número de teléfono"
      />
      <input
        name="date"
        type="date"
        className="w-full p-2 border rounded"
        aria-label="Fecha de la cita"
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Enviar
      </button>
    </form>
  )
}
```

## Ejemplo con notificaciones

```tsx
// hooks/use-voice-notifications.ts
import { useEffect, useState } from 'react'

export const useVoiceNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const announceNotification = (message: string) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message,
      timestamp: new Date()
    }])
    
    // Anunciar por voz
    speak(message)
  }

  const clearNotifications = () => {
    setNotifications([])
    speak('Notificaciones limpiadas')
  }

  return {
    notifications,
    announceNotification,
    clearNotifications,
    speak
  }
}
```

## Integración con APIs externas

```tsx
// utils/external-integrations.ts
export const integrateWithHealthAPI = async (command: string) => {
  // Ejemplo con API de salud
  if (command.includes('buscar medicamento')) {
    const medication = command.replace('buscar medicamento', '').trim()
    
    try {
      const response = await fetch(`/api/medications/search?q=${medication}`)
      const data = await response.json()
      
      return {
        action: 'display',
        element: '#medication-results',
        data: data.results,
        message: `Encontrados ${data.results.length} medicamentos`
      }
    } catch (error) {
      return {
        action: 'none',
        element: '',
        message: 'Error al buscar medicamentos'
      }
    }
  }
  
  // Ejemplo con API de doctores
  if (command.includes('buscar doctor')) {
    const specialty = command.replace('buscar doctor', '').trim()
    
    try {
      const response = await fetch(`/api/doctors/search?specialty=${specialty}`)
      const data = await response.json()
      
      return {
        action: 'display',
        element: '#doctor-results',
        data: data.doctors,
        message: `Encontrados ${data.doctors.length} doctores`
      }
    } catch (error) {
      return {
        action: 'none',
        element: '',
        message: 'Error al buscar doctores'
      }
    }
  }
}
```

## Ejemplo con analytics

```tsx
// utils/voice-analytics.ts
export const trackVoiceCommand = (command: string, result: any) => {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'voice_command', {
      command: command,
      success: result.success,
      action: result.action,
      element: result.element
    })
  }
  
  // Analytics personalizado
  fetch('/api/analytics/voice-command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command,
      result,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  })
}
```

## Configuración avanzada de OpenAI

```tsx
// api/voice-command/route.ts - Versión avanzada
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { domElements, command, context, userProfile } = await request.json()

    // Prompt más sofisticado
    const prompt = `
Eres un asistente de accesibilidad avanzado para MiSaludDigital.

CONTEXTO DEL USUARIO:
- Perfil: ${JSON.stringify(userProfile)}
- Página actual: ${context?.currentPage || 'unknown'}
- Historial de comandos: ${context?.commandHistory || 'ninguno'}

ELEMENTOS DOM DISPONIBLES:
${JSON.stringify(domElements, null, 2)}

COMANDO DEL USUARIO: "${command}"

REGLAS AVANZADAS:
1. Considera el contexto del usuario y su historial
2. Prioriza elementos relevantes para su perfil
3. Sugiere comandos alternativos si no encuentra coincidencias exactas
4. Incluye validaciones de seguridad
5. Optimiza para usuarios con discapacidades

FORMATO DE RESPUESTA:
{
  "action": "click|scroll|navigate|focus|speak|none",
  "element": "selector_css_del_elemento",
  "message": "mensaje_explicativo_para_el_usuario",
  "success": true|false,
  "alternatives": ["comando_alternativo_1", "comando_alternativo_2"],
  "confidence": 0.95,
  "security_check": "passed|failed",
  "accessibility_notes": "notas_adicionales_de_accesibilidad"
}

Responde SOLO con el JSON.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })

    const response = completion.choices[0]?.message?.content?.trim()
    
    if (!response) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 })
    }

    const parsedResponse = JSON.parse(response)
    
    // Validaciones de seguridad
    if (parsedResponse.security_check === 'failed') {
      return NextResponse.json({
        ...parsedResponse,
        action: 'none',
        message: 'Comando rechazado por seguridad'
      })
    }

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('Error in voice command API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Uso en producción

```bash
# Variables de entorno para producción
OPENAI_API_KEY=sk-your-production-key
NEXT_PUBLIC_VOICE_ANALYTICS=true
NEXT_PUBLIC_VOICE_SECURITY=strict
NEXT_PUBLIC_VOICE_RATE_LIMIT=10

# Variables para desarrollo
OPENAI_API_KEY=sk-your-development-key  
NEXT_PUBLIC_VOICE_ANALYTICS=false
NEXT_PUBLIC_VOICE_SECURITY=relaxed
NEXT_PUBLIC_VOICE_RATE_LIMIT=100
```
