// Voice command configuration
export const VOICE_CONFIG = {
  // Speech recognition settings
  recognition: {
    language: 'es-ES',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    silenceTimeout: 3000,
    confidenceThreshold: 0.5,
  },
  
  // OpenAI settings
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 300,
    timeout: 10000,
  },
  
  // DOM extraction settings
  dom: {
    selectors: [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="link"]',
      '[tabindex]',
      'h1, h2, h3, h4, h5, h6',
      'section[id]',
      'nav',
      'main',
      'header',
      'footer',
    ],
    textLengthLimit: 100,
    includeHiddenElements: false,
  },
  
  // Voice commands mapping
  commands: {
    navigation: {
      'ir a inicio': '#inicio',
      'navegar a inicio': '#inicio',
      'ir a servicios': '#servicios',
      'mostrar servicios': '#servicios',
      'ir a contacto': '#contacto',
      'ir a accesibilidad': '#accesibilidad',
    },
    services: {
      'ver turnos': '#turnos',
      'turnos online': '#turnos',
      'ver historial': '#historial',
      'historial clínico': '#historial',
      'ver teleconsultas': '#teleconsultas',
      'ver farmacias': '#farmacias',
      'ver noticias': '#noticias',
      'ver soporte': '#soporte',
    },
    contacts: {
      'llamar teléfono': '#contacto-telefono a',
      'llamar': '#contacto-telefono a',
      'enviar email': '#contacto-email a',
      'email': '#contacto-email a',
    },
  },
  
  // UI settings
  ui: {
    showConfidence: true,
    showTimestamp: true,
    maxTranscriptions: 50,
    autoClose: false,
    theme: 'light',
  },
  
  // Accessibility settings
  accessibility: {
    announceActions: true,
    screenReaderDelay: 1000,
    keyboardShortcuts: {
      toggleVoice: 'Ctrl+V',
      clearHistory: 'Ctrl+L',
    },
  },
}

// Error messages
export const ERROR_MESSAGES = {
  NOT_SUPPORTED: 'Tu navegador no soporta reconocimiento de voz',
  MICROPHONE_DENIED: 'Acceso al micrófono denegado',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  OPENAI_ERROR: 'Error al procesar comando con OpenAI',
  COMMAND_NOT_FOUND: 'Comando no reconocido',
  ELEMENT_NOT_FOUND: 'Elemento no encontrado en la página',
  TIMEOUT: 'Tiempo de espera agotado',
}

// Success messages
export const SUCCESS_MESSAGES = {
  NAVIGATED: 'Navegando a',
  CLICKED: 'Haciendo clic en',
  FOCUSED: 'Enfocando',
  SCROLLED: 'Desplazando a',
  COMMAND_EXECUTED: 'Comando ejecutado exitosamente',
}

// Available actions
export const ACTIONS = {
  CLICK: 'click',
  SCROLL: 'scroll',
  NAVIGATE: 'navigate',
  FOCUS: 'focus',
  NONE: 'none',
} as const

export type ActionType = typeof ACTIONS[keyof typeof ACTIONS]
