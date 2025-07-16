"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'

interface VoiceSettings {
  language: string
  confidenceThreshold: number
  silenceTimeout: number
  showConfidence: boolean
  showTimestamp: boolean
  announceActions: boolean
  maxTranscriptions: number
}

const defaultSettings: VoiceSettings = {
  language: 'es-ES',
  confidenceThreshold: 0.5,
  silenceTimeout: 3000,
  showConfidence: true,
  showTimestamp: true,
  announceActions: true,
  maxTranscriptions: 50,
}

interface VoiceSettingsProps {
  readonly onSettingsChange: (settings: VoiceSettings) => void
}

export default function VoiceSettings({ onSettingsChange }: VoiceSettingsProps) {
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('voice-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      onSettingsChange(parsed)
    }
  }, [onSettingsChange])

  const updateSetting = <K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('voice-settings', JSON.stringify(newSettings))
    onSettingsChange(newSettings)
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.setItem('voice-settings', JSON.stringify(defaultSettings))
    onSettingsChange(defaultSettings)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50"
        aria-label="Abrir configuración de voz"
      >
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="fixed top-4 right-4 w-80 shadow-lg z-50 bg-white border border-gray-200 max-h-[80vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-semibold">Configuración de Voz</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar configuración"
        >
          ×
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting('language', value)}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es-ES">Español (España)</SelectItem>
              <SelectItem value="es-AR">Español (Argentina)</SelectItem>
              <SelectItem value="es-MX">Español (México)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <Label htmlFor="confidence">
            Umbral de confianza: {Math.round(settings.confidenceThreshold * 100)}%
          </Label>
          <Slider
            id="confidence"
            min={0.1}
            max={1}
            step={0.1}
            value={[settings.confidenceThreshold]}
            onValueChange={(value) => updateSetting('confidenceThreshold', value[0])}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Mayor valor = más preciso pero menos sensible
          </p>
        </div>

        {/* Silence Timeout */}
        <div className="space-y-2">
          <Label htmlFor="timeout">
            Tiempo de silencio: {settings.silenceTimeout / 1000}s
          </Label>
          <Slider
            id="timeout"
            min={1000}
            max={10000}
            step={500}
            value={[settings.silenceTimeout]}
            onValueChange={(value) => updateSetting('silenceTimeout', value[0])}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Tiempo antes de detener la escucha automáticamente
          </p>
        </div>

        {/* Max Transcriptions */}
        <div className="space-y-2">
          <Label htmlFor="maxTranscriptions">
            Máximo de transcripciones: {settings.maxTranscriptions}
          </Label>
          <Slider
            id="maxTranscriptions"
            min={10}
            max={100}
            step={10}
            value={[settings.maxTranscriptions]}
            onValueChange={(value) => updateSetting('maxTranscriptions', value[0])}
            className="w-full"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showConfidence">Mostrar confianza</Label>
            <Switch
              id="showConfidence"
              checked={settings.showConfidence}
              onCheckedChange={(checked) => updateSetting('showConfidence', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showTimestamp">Mostrar timestamp</Label>
            <Switch
              id="showTimestamp"
              checked={settings.showTimestamp}
              onCheckedChange={(checked) => updateSetting('showTimestamp', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="announceActions">Anunciar acciones</Label>
            <Switch
              id="announceActions"
              checked={settings.announceActions}
              onCheckedChange={(checked) => updateSetting('announceActions', checked)}
            />
          </div>
        </div>

        {/* Reset Button */}
        <Button
          onClick={resetSettings}
          variant="outline"
          className="w-full"
        >
          Restaurar configuración por defecto
        </Button>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Atajos de teclado:</strong></p>
          <p>• Ctrl+V: Activar/desactivar micrófono</p>
          <p>• Ctrl+L: Limpiar historial</p>
        </div>
      </CardContent>
    </Card>
  )
}
