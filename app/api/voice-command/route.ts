import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 5000, // 5 segundos timeout
})

// Cache simple para comandos frecuentes
const commandCache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Mapeo directo de comandos comunes para respuesta inmediata
const DIRECT_COMMANDS = {
  'ir a inicio': { action: 'scroll', element: '#inicio', message: 'Navegando a inicio', success: true },
  'navegar a inicio': { action: 'scroll', element: '#inicio', message: 'Navegando a inicio', success: true },
  'ir a servicios': { action: 'scroll', element: '#servicios', message: 'Navegando a servicios', success: true },
  'mostrar servicios': { action: 'scroll', element: '#servicios', message: 'Mostrando servicios', success: true },
  'ir a contacto': { action: 'scroll', element: '#contacto', message: 'Navegando a contacto', success: true },
  'ir a accesibilidad': { action: 'scroll', element: '#accesibilidad', message: 'Navegando a accesibilidad', success: true },
  'ver turnos': { action: 'scroll', element: '#turnos', message: 'Mostrando turnos online', success: true },
  'turnos online': { action: 'scroll', element: '#turnos', message: 'Mostrando turnos online', success: true },
  'ver historial': { action: 'scroll', element: '#historial', message: 'Mostrando historial clínico', success: true },
  'historial clínico': { action: 'scroll', element: '#historial', message: 'Mostrando historial clínico', success: true },
  'llamar teléfono': { action: 'click', element: '#contacto-telefono a', message: 'Llamando teléfono', success: true },
  'llamar': { action: 'click', element: '#contacto-telefono a', message: 'Llamando teléfono', success: true },
  'enviar email': { action: 'click', element: '#contacto-email a', message: 'Enviando email', success: true },
  'email': { action: 'click', element: '#contacto-email a', message: 'Enviando email', success: true },
}

export async function POST(request: NextRequest) {
  try {
    const { domElements, command } = await request.json()

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    const normalizedCommand = command.toLowerCase().trim()

    // 1. Revisar comandos directos primero (respuesta inmediata)
    if (normalizedCommand in DIRECT_COMMANDS) {
      return NextResponse.json(DIRECT_COMMANDS[normalizedCommand as keyof typeof DIRECT_COMMANDS])
    }

    // 2. Revisar cache
    const cacheKey = `${normalizedCommand}-${JSON.stringify(domElements).slice(0, 100)}`
    if (commandCache.has(cacheKey)) {
      const cached = commandCache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json(cached.response)
      }
    }

    // 3. Usar OpenAI solo si no hay match directo
    const prompt = `
Eres un asistente de accesibilidad rápido para MiSaludDigital.

ELEMENTOS DOM (solo los más relevantes):
${JSON.stringify(domElements.slice(0, 20), null, 2)}

COMANDO: "${command}"

INSTRUCCIONES:
- Responde con JSON válido ÚNICAMENTE
- Prioriza elementos con ID específico
- Si no encuentras coincidencia exacta, busca la más similar
- Mantén mensajes cortos y claros

FORMATO:
{
  "action": "click|scroll|navigate|focus|none",
  "element": "selector_css",
  "message": "mensaje_corto",
  "success": true|false
}

RESPUESTA:`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 150,
      top_p: 0.9,
    })

    const response = completion.choices[0]?.message?.content?.trim()
    
    if (!response) {
      return NextResponse.json({ 
        action: 'none', 
        element: '', 
        message: 'No se pudo procesar el comando', 
        success: false 
      })
    }

    try {
      const parsedResponse = JSON.parse(response)
      
      // Guardar en cache
      commandCache.set(cacheKey, {
        response: parsedResponse,
        timestamp: Date.now()
      })
      
      return NextResponse.json(parsedResponse)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json({ 
        action: 'none',
        element: '',
        message: 'Error al interpretar comando',
        success: false
      })
    }

  } catch (error) {
    console.error('Error in voice command API:', error)
    return NextResponse.json({ 
      action: 'none',
      element: '',
      message: 'Error del servidor',
      success: false
    }, { status: 500 })
  }
}
