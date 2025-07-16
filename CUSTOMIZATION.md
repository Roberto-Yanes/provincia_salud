# Guía de Personalización y Extensión

## Agregar nuevos comandos de voz

### 1. Actualizar el prompt de OpenAI

En `app/api/voice-command/route.ts`, modifica el prompt para incluir nuevos comandos:

```typescript
const prompt = `
// ... prompt existente ...

Ejemplos de comandos:
- "ir a servicios" -> scroll a la sección servicios
- "hacer clic en contacto" -> click en el enlace de contacto
- "navegar a inicio" -> scroll al inicio
- "abrir menú" -> click en el botón de menú
- "NUEVO: buscar doctor" -> focus en el campo de búsqueda
- "NUEVO: agendar cita" -> click en botón de agendar

// ... resto del prompt ...
`
```

### 2. Agregar elementos al DOM

Asegúrate de que los nuevos elementos tengan IDs únicos y atributos de accesibilidad:

```jsx
<button 
  id="buscar-doctor"
  className="..."
  aria-label="Buscar doctor"
>
  Buscar Doctor
</button>
```

### 3. Probar el nuevo comando

El sistema automáticamente detectará el nuevo elemento y OpenAI podrá mapear el comando.

## Personalizar el reconocimiento de voz

### Cambiar idioma

En `hooks/use-voice-recognition.ts`:

```typescript
// Cambiar de español a inglés
recognition.lang = 'en-US'

// O hacerlo dinámico
recognition.lang = navigator.language || 'es-ES'
```

### Ajustar configuración

```typescript
// Configuración más sensible
recognition.continuous = true
recognition.interimResults = true
recognition.maxAlternatives = 3

// Timeout personalizado
const SILENCE_TIMEOUT = 2000 // 2 segundos
```

## Mejorar la precisión de OpenAI

### Prompt engineering

```typescript
const prompt = `
Eres un asistente de accesibilidad especializado en navegación web por voz para un sitio de salud.

CONTEXTO: El usuario está navegando en MiSaludDigital, una plataforma de salud digital.

REGLAS ESTRICTAS:
1. Solo responde con JSON válido
2. Prioriza elementos con IDs específicos
3. Para comandos ambiguos, elige la acción más probable
4. Si no encuentras el elemento, devuelve action: "none"

ELEMENTOS ESPECÍFICOS DEL SITIO:
- #inicio: Sección principal
- #servicios: Lista de servicios médicos
- #contacto: Información de contacto
- #turnos: Tarjeta de turnos online
- #historial: Tarjeta de historial clínico

// ... resto del prompt ...
`
```

### Mejorar el contexto DOM

En `hooks/use-voice-commands.ts`:

```typescript
const extractDOMElements = useCallback((): DOMElement[] => {
  // Agregar más metadatos
  const elementData: DOMElement = {
    tag: element.tagName.toLowerCase(),
    id: element.id || undefined,
    className: element.className || undefined,
    text: text.substring(0, 200), // Más texto
    href: (element as HTMLAnchorElement).href || undefined,
    role: element.getAttribute('role') || undefined,
    ariaLabel: element.getAttribute('aria-label') || undefined,
    selector: generateSelector(element),
    type: (element as HTMLInputElement).type || undefined,
    // NUEVO: Agregar más contexto
    parentText: element.parentElement?.textContent?.trim().substring(0, 100),
    siblings: Array.from(element.parentElement?.children || []).length,
    position: getBoundingClientRect(element)
  }
  
  return elements
}, [])
```

## Agregar nuevas acciones

### 1. Definir nueva acción

En `hooks/use-voice-commands.ts`:

```typescript
interface VoiceCommandResponse {
  action: 'click' | 'scroll' | 'navigate' | 'focus' | 'type' | 'submit' | 'none'
  element: string
  message: string
  success: boolean
  // NUEVO: Parámetros adicionales
  value?: string
  options?: Record<string, any>
}
```

### 2. Implementar la acción

```typescript
const performAction = async (action: string, selector: string, value?: string): Promise<void> => {
  const element = document.querySelector(selector)
  
  if (!element) {
    console.warn(`Element not found: ${selector}`)
    return
  }
  
  switch (action) {
    case 'type':
      if (element instanceof HTMLInputElement && value) {
        element.value = value
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
      break
      
    case 'submit':
      const form = element.closest('form')
      if (form) {
        form.submit()
      }
      break
      
    // ... otras acciones existentes ...
  }
}
```

## Integrar con bases de datos

### Ejemplo con appointments

```typescript
// app/api/appointments/route.ts
export async function GET() {
  const appointments = await getAppointments()
  return NextResponse.json(appointments)
}

// En el hook de comandos
const executeVoiceCommand = async (command: string) => {
  // Obtener datos dinámicos
  const appointments = await fetch('/api/appointments').then(r => r.json())
  
  const response = await fetch('/api/voice-command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domElements,
      command,
      context: {
        appointments,
        userProfile: getCurrentUser(),
        currentPage: window.location.pathname
      }
    })
  })
  
  // ... resto del código ...
}
```

## Mejorar la experiencia del usuario

### 1. Feedback visual mejorado

```typescript
// En VoiceInputDisplay
const [isProcessing, setIsProcessing] = useState(false)
const [confidence, setConfidence] = useState(0)

// Mostrar confianza visual
<div className="confidence-meter">
  <div 
    className="confidence-bar"
    style={{ width: `${confidence * 100}%` }}
  />
</div>
```

### 2. Shortcuts por teclado

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault()
      handleVoiceToggle()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

### 3. Persistencia de configuración

```typescript
// Guardar preferencias
const savePreferences = (prefs: UserPreferences) => {
  localStorage.setItem('voice-preferences', JSON.stringify(prefs))
}

// Cargar preferencias
const loadPreferences = (): UserPreferences => {
  const stored = localStorage.getItem('voice-preferences')
  return stored ? JSON.parse(stored) : defaultPreferences
}
```

## Optimización de rendimiento

### 1. Debounce del reconocimiento

```typescript
const debouncedProcessCommand = useCallback(
  debounce(async (command: string) => {
    if (command.trim().length > 2) {
      await processVoiceCommand(command)
    }
  }, 500),
  []
)
```

### 2. Cache de elementos DOM

```typescript
const domCache = useRef<Map<string, DOMElement[]>>(new Map())

const extractDOMElements = useCallback((): DOMElement[] => {
  const cacheKey = window.location.pathname
  
  if (domCache.current.has(cacheKey)) {
    return domCache.current.get(cacheKey)!
  }
  
  const elements = // ... extracción normal ...
  domCache.current.set(cacheKey, elements)
  
  return elements
}, [])
```

### 3. Lazy loading de OpenAI

```typescript
const openaiPromise = lazy(() => import('openai'))

// Usar solo cuando sea necesario
const processWithOpenAI = async (command: string) => {
  const OpenAI = await openaiPromise
  // ... procesamiento ...
}
```

## Testing

### 1. Test de componentes

```typescript
// __tests__/voice-input-display.test.tsx
import { render, screen } from '@testing-library/react'
import VoiceInputDisplay from '../components/voice-input-display'

test('renders voice input button', () => {
  render(<VoiceInputDisplay />)
  const button = screen.getByLabelText(/abrir panel/i)
  expect(button).toBeInTheDocument()
})
```

### 2. Test de hooks

```typescript
// __tests__/use-voice-commands.test.ts
import { renderHook } from '@testing-library/react'
import { useVoiceCommands } from '../hooks/use-voice-commands'

test('extracts DOM elements correctly', () => {
  const { result } = renderHook(() => useVoiceCommands())
  const elements = result.current.extractDOMElements()
  expect(elements).toHaveLength(greaterThan(0))
})
```

## Deployment

### Variables de entorno

```bash
# Production
OPENAI_API_KEY=prod_key_here
NEXT_PUBLIC_VOICE_ENABLED=true
NEXT_PUBLIC_VOICE_LANG=es-ES

# Development
OPENAI_API_KEY=dev_key_here
NEXT_PUBLIC_VOICE_ENABLED=true
NEXT_PUBLIC_VOICE_LANG=es-ES
```

### Optimización para producción

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
}
```
