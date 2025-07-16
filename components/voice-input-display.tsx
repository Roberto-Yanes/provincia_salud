"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, X, Volume2 } from "lucide-react"
import { useVoiceRecognition } from "@/hooks/use-voice-recognition"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { speak } from "@/lib/speech"
import ClientOnly from "@/components/client-only"

interface TranscriptionEntry {
  text: string
  timestamp: Date
  action?: string
  success?: boolean
}

export default function VoiceInputDisplay() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([])
  const [open, setOpen] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoHidden, setAutoHidden] = useState(false)
  
  const {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  } = useVoiceRecognition()
  
  const { executeVoiceCommand, announceToScreenReader } = useVoiceCommands()



  // Activar escucha automáticamente al montar el componente si es soportado
  useEffect(() => {
    if (isSupported && !isListening) {
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // Ocultar el panel cuando la escucha está activa y mostrarlo si se detiene por causas externas
  useEffect(() => {
    if (isListening && !isProcessing && open) {
      setAutoHidden(true);
      setOpen(false);
    }
    // Si la escucha se detiene y no es por procesamiento, mostrar el panel
    if (!isListening && autoHidden && !isProcessing) {
      setOpen(true);
      setAutoHidden(false);
    }
  }, [isListening, isProcessing, open, autoHidden]);

  // Process transcript when it's complete
  useEffect(() => {
    if (transcript && !isListening && confidence > 0.3) { // Umbral más bajo para mejor respuesta
      const timer = setTimeout(() => {
        processVoiceCommand(transcript)
      }, 100) // Procesamiento casi inmediato
      
      return () => clearTimeout(timer)
    }
  }, [transcript, isListening, confidence])

  const processVoiceCommand = async (command: string) => {
    if (isProcessing) return

    setIsProcessing(true)

    // Pausar escucha mientras se procesa
    if (isListening) stopListening()

    // Add user command to transcriptions
    const userEntry: TranscriptionEntry = {
      text: `Usuario: "${command}"`,
      timestamp: new Date()
    }
    setTranscriptions(prev => [...prev.slice(-20), userEntry]) // Limitar historial

    // --- Click directo si el comando es "click en turnos online" o similar ---
    if (typeof window !== 'undefined') {
      const cmd = command.trim().toLowerCase()
      if (cmd === 'click en turnos online' || cmd === 'clic en turnos online' || cmd === 'haz click en turnos online' || cmd === 'haz clic en turnos online') {
        if (typeof (window as any).clickTurnosOnline === 'function') {
          (window as any).clickTurnosOnline()
        }
      }
    }

    try {
      const result = await executeVoiceCommand(command)

      // Add system response to transcriptions
      const systemEntry: TranscriptionEntry = {
        text: `Sistema: ${result.message}`,
        timestamp: new Date(),
        action: result.action,
        success: result.success
      }
      setTranscriptions(prev => [...prev.slice(-20), systemEntry])

      // Announce to screen reader
      announceToScreenReader(result.message)

      // Leer en voz alta la respuesta del sistema y reanudar escucha al finalizar
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new window.SpeechSynthesisUtterance(result.message)
        utterance.lang = 'es-ES'
        utterance.onend = () => {
          // Reanudar escucha después de hablar
          if (isSupported) startListening()
        }
        window.speechSynthesis.speak(utterance)
      } else {
        // Si no hay síntesis, reanudar igual
        if (isSupported) startListening()
      }

    } catch (error) {
      console.error('Error processing voice command:', error)
      const errorEntry: TranscriptionEntry = {
        text: `Sistema: Error al procesar comando`,
        timestamp: new Date(),
        success: false
      }
      setTranscriptions(prev => [...prev.slice(-20), errorEntry])
      // Reanudar escucha en caso de error
      if (isSupported) startListening()
    } finally {
      setIsProcessing(false)
      resetTranscript()
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
      setAutoHidden(false)
    } else {
      startListening()
    }
  }

  const clearAll = () => {
    setTranscriptions([])
    resetTranscript()
  }
  
  const toggleOpen = () => setOpen(!open)

  return (
    <ClientOnly fallback={
      <div className="fixed bottom-4 right-4 w-80 h-16 bg-gray-100 animate-pulse rounded-lg shadow-lg" />
    }>
      {!isSupported ? (
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 bg-white border border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 font-semibold mb-2">
              Tu navegador no soporta reconocimiento de voz o el acceso al micrófono fue denegado.
            </p>
            <ul className="text-xs text-gray-700 list-disc pl-4">
              <li>Verifica que tu navegador sea compatible (Chrome recomendado).</li>
              <li>Permite el acceso al micrófono cuando el navegador lo solicite.</li>
              <li>Si el problema persiste, prueba recargando la página o revisa la configuración de privacidad.</li>
            </ul>
          </CardContent>
        </Card>
      ) : !open ? null : (
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 bg-white border border-gray-200">
          <CardHeader className="flex items-center justify-between p-4 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Control por Voz
            </CardTitle>
            <Button aria-label="Cerrar panel" variant="ghost" size="icon" onClick={toggleOpen}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {/* Voice Control Button */}
            <div className="mb-4 flex justify-center">
              <Button
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={`p-4 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                aria-label={isListening ? "Detener escucha" : "Iniciar escucha"}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>

            {/* Status */}
            <div className="mb-2 text-center">
              {isListening && (
                <p className="text-sm text-blue-600 font-medium">
                  Escuchando... ({Math.round(confidence * 100)}%)
                </p>
              )}
              {isProcessing && (
                <p className="text-sm text-orange-600 font-medium">
                  Procesando comando...
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            {/* Current Transcript */}
            {transcript && (
              <div className="mb-2 p-2 bg-blue-50 rounded border">
                <p className="text-sm text-blue-800">
                  <strong>Transcripción:</strong> {transcript}
                </p>
              </div>
            )}

            {/* Transcriptions History */}
            <div className="h-40 overflow-y-auto border rounded-md p-2 text-sm bg-gray-50 mb-2">
              {transcriptions.length === 0 ? (
                <p className="text-gray-500 italic">
                  Presiona el botón del micrófono y di un comando como:
                  <br />• "Ir a servicios"
                  <br />• "Navegar a contacto"
                  <br />• "Ir al inicio"
                </p>
              ) : (
                transcriptions.map((entry, i) => {
                  let timestampClass = 'text-gray-600'
                  if (entry.success === false) {
                    timestampClass = 'text-red-600'
                  } else if (entry.success === true) {
                    timestampClass = 'text-green-600'
                  }
                  
                  let textClass = 'text-gray-700'
                  if (entry.text.startsWith('Usuario:')) {
                    textClass = 'text-blue-700 font-medium'
                  } else if (entry.success === false) {
                    textClass = 'text-red-700'
                  } else if (entry.success === true) {
                    textClass = 'text-green-700'
                  }
                  
                  return (
                    <div key={`${entry.timestamp.getTime()}-${i}`} className="mb-2 last:mb-0">
                      <p className={`text-xs ${timestampClass}`}>
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                      <p className={textClass}>
                        {entry.text}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={clearAll}>
                Limpiar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                variant={isListening ? "destructive" : "default"}
              >
                {isListening ? 'Detener' : 'Escuchar'}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Comandos disponibles: "ir a [sección]", "hacer clic en [elemento]", "navegar a [página]"
            </p>
          </CardContent>
        </Card>
      )}
    </ClientOnly>
  )
}
