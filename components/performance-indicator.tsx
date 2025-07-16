"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

interface PerformanceIndicatorProps {
  readonly lastResponseTime?: number
  readonly averageResponseTime?: number
  readonly cacheHitRate?: number
}

export default function PerformanceIndicator({
  lastResponseTime = 0,
  averageResponseTime = 0,
  cacheHitRate = 0
}: PerformanceIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const shouldShow = process.env.NODE_ENV === 'development'
    setIsVisible(shouldShow)
  }, [])

  if (!isVisible) return null

  const getStatusColor = (time: number) => {
    if (time < 500) return 'text-green-600'
    if (time < 1500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusText = (time: number) => {
    if (time < 500) return 'Excelente'
    if (time < 1500) return 'Bueno'
    return 'Lento'
  }

  const getBadgeVariant = (time: number): "default" | "secondary" | "destructive" => {
    if (time < 500) return "default"
    if (time < 1500) return "secondary"
    return "destructive"
  }

  return (
    <Card className="fixed bottom-4 left-4 w-64 shadow-lg z-40 bg-white border border-gray-200">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm">Rendimiento</span>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Última respuesta:</span>
            <span className={getStatusColor(lastResponseTime)}>
              {lastResponseTime}ms
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Promedio:</span>
            <span className={getStatusColor(averageResponseTime)}>
              {averageResponseTime}ms
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Cache hits:</span>
            <span className="text-blue-600">
              {Math.round(cacheHitRate)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Estado:</span>
            <Badge 
              variant={getBadgeVariant(lastResponseTime)}
              className="text-xs"
            >
              {getStatusText(lastResponseTime)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
