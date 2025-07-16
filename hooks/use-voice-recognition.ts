import { useEffect, useState, useRef, useCallback } from 'react'

interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

interface UseVoiceRecognitionReturn {
  isListening: boolean
  transcript: string
  confidence: number
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
}

export const useVoiceRecognition = (): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Inicializar reconocimiento solo una vez
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitializedRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        
        const recognition = recognitionRef.current
        if (recognition) {
          recognition.continuous = false // Cambiar a false para mejor rendimiento
          recognition.interimResults = true
          recognition.lang = 'es-ES'
          recognition.maxAlternatives = 1

          recognition.onstart = () => {
            setIsListening(true)
            setError(null)
            setTranscript('')
            setConfidence(0)
          }

          recognition.onend = () => {
            setIsListening(false)
          }

          recognition.onerror = (event) => {
            setError(`Error en reconocimiento: ${event.error}`)
            setIsListening(false)
          }

          recognition.onresult = (event) => {
            let finalTranscript = ''
            let interimTranscript = ''
            let maxConfidence = 0

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i]
              const transcript = result[0].transcript
              const confidence = result[0].confidence || 0.8 // Fallback confidence

              if (result.isFinal) {
                finalTranscript += transcript
                maxConfidence = Math.max(maxConfidence, confidence)
              } else {
                interimTranscript += transcript
              }
            }

            const currentTranscript = finalTranscript || interimTranscript
            setTranscript(currentTranscript)
            setConfidence(maxConfidence || 0.8)

            // Auto-stop después de resultado final o timeout más corto
            if (finalTranscript || interimTranscript.length > 50) {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
              }
              
              timeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && isListening) {
                  recognitionRef.current.stop()
                }
              }, finalTranscript ? 500 : 2000) // Más rápido para resultados finales
            }
          }
        }
        isInitializedRef.current = true
      } else {
        setIsSupported(false)
        setError('Web Speech API no es compatible con este navegador')
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isSupported) {
      try {
        setTranscript('')
        setConfidence(0)
        setError(null)
        recognitionRef.current.start()
      } catch (err) {
        console.error('Error starting voice recognition:', err)
        setError('Error al iniciar reconocimiento de voz')
      }
    }
  }, [isListening, isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setConfidence(0)
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  }
}

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}
