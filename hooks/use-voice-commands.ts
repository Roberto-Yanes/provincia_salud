import { useCallback, useMemo } from 'react'

interface DOMElement {
  tag: string
  id?: string
  className?: string
  text?: string
  href?: string
  role?: string
  ariaLabel?: string
  selector: string
  type?: string
}

interface VoiceCommandResponse {
  action: 'click' | 'scroll' | 'navigate' | 'focus' | 'none'
  element: string
  message: string
  success: boolean
}

export const useVoiceCommands = () => {
  // Memoizar elementos DOM importantes para evitar recálculos constantes
  const importantElements = useMemo(() => [
    { id: 'inicio', selector: '#inicio', text: 'Bienvenido a MiSaludDigital' },
    { id: 'servicios', selector: '#servicios', text: 'Nuestros Servicios' },
    { id: 'contacto', selector: '#contacto', text: 'Contáctanos' },
    { id: 'accesibilidad', selector: '#accesibilidad', text: 'Compromiso con la Accesibilidad' },
    { id: 'turnos', selector: '#turnos', text: 'Turnos Online' },
    { id: 'historial', selector: '#historial', text: 'Historial Clínico' },
    { id: 'teleconsultas', selector: '#teleconsultas', text: 'Teleconsultas' },
    { id: 'farmacias', selector: '#farmacias', text: 'Farmacias Adheridas' },
    { id: 'noticias', selector: '#noticias', text: 'Noticias de Salud' },
    { id: 'soporte', selector: '#soporte', text: 'Soporte 24/7' },
    { id: 'contacto-telefono', selector: '#contacto-telefono a', text: 'Teléfono' },
    { id: 'contacto-email', selector: '#contacto-email a', text: 'Email' },
  ], [])

  const extractDOMElements = useCallback((): DOMElement[] => {
    const elements: DOMElement[] = []
    
    // Primero agregar elementos importantes (optimización)
    importantElements.forEach(elem => {
      const domElement = document.querySelector(elem.selector)
      if (domElement) {
        elements.push({
          tag: domElement.tagName.toLowerCase(),
          id: elem.id,
          selector: elem.selector,
          text: elem.text,
          href: (domElement as HTMLAnchorElement).href || undefined,
          role: domElement.getAttribute('role') || undefined,
          ariaLabel: domElement.getAttribute('aria-label') || undefined,
        })
      }
    })
    
    // Solo si necesitamos más elementos, hacemos la búsqueda completa
    if (elements.length < 10) {
      const interactiveSelectors = [
        'button:not([aria-hidden="true"])',
        'a[href]:not([aria-hidden="true"])',
        'input:not([type="hidden"])',
        '[role="button"]:not([aria-hidden="true"])',
        '[tabindex="0"]',
      ]
      
      interactiveSelectors.forEach(selector => {
        const domElements = document.querySelectorAll(selector)
        Array.from(domElements).slice(0, 5).forEach((element) => {
          const rect = element.getBoundingClientRect()
          
          if (rect.width > 0 && rect.height > 0) {
            const text = element.textContent?.trim().substring(0, 50) || ''
            elements.push({
              tag: element.tagName.toLowerCase(),
              id: element.id || undefined,
              className: element.className || undefined,
              text,
              href: (element as HTMLAnchorElement).href || undefined,
              role: element.getAttribute('role') || undefined,
              ariaLabel: element.getAttribute('aria-label') || undefined,
              selector: generateSelector(element),
              type: (element as HTMLInputElement).type || undefined
            })
          }
        })
      })
    }
    
    return elements
  }, [importantElements])

  const generateSelector = (element: Element): string => {
    if (element.id) {
      return `#${element.id}`
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(Boolean)
      if (classes.length > 0) {
        return `.${classes[0]}`
      }
    }
    
    const tagName = element.tagName.toLowerCase()
    const parent = element.parentElement
    
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName)
      if (siblings.length > 1) {
        const index = siblings.indexOf(element)
        return `${tagName}:nth-child(${index + 1})`
      }
    }
    
    return tagName
  }

  const executeVoiceCommand = useCallback(async (command: string): Promise<VoiceCommandResponse> => {
    try {
      const domElements = extractDOMElements()
      
      // Timeout para la petición
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort('timeout'), 5000)
      
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domElements,
          command
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: VoiceCommandResponse = await response.json()
      
      if (result.success) {
        await performAction(result.action, result.element)
      }
      
      return result
    } catch (error: any) {
      console.error('Error executing voice command:', error)
      if (error?.name === 'AbortError') {
        return {
          action: 'none',
          element: '',
          message: error?.message === 'The user aborted a request.' ? 'Comando abortado por timeout' : `Comando abortado: ${error?.message || 'sin motivo'}`,
          success: false
        }
      }
      return {
        action: 'none',
        element: '',
        message: 'Error al procesar el comando de voz',
        success: false
      }
    }
  }, [extractDOMElements])

  const performAction = async (action: string, selector: string): Promise<void> => {
    const element = document.querySelector(selector)
    
    if (!element) {
      console.warn(`Element not found: ${selector}`)
      return
    }
    
    switch (action) {
      case 'click':
        if (element instanceof HTMLElement) {
          element.click()
        }
        break
        
      case 'scroll':
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
        break
        
      case 'focus':
        if (element instanceof HTMLElement) {
          element.focus()
        }
        break
        
      case 'navigate':
        if (element instanceof HTMLAnchorElement && element.href) {
          window.location.href = element.href
        } else {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          })
        }
        break
        
      default:
        console.warn(`Unknown action: ${action}`)
    }
  }

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    
    document.body.appendChild(announcement)
    announcement.textContent = message
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }, [])

  return {
    executeVoiceCommand,
    extractDOMElements,
    announceToScreenReader
  }
}
