import { useState, useRef } from 'react';

interface PerformanceMetrics {
  responseTime: number;
  averageResponseTime: number;
  cacheHitRate: number;
  directCommandRate: number;
  totalRequests: number;
  lastCommand: string;
  status: 'excellent' | 'good' | 'poor' | 'critical';
}

interface PerformanceData {
  timestamp: number;
  responseTime: number;
  command: string;
  type: 'direct' | 'cached' | 'processed';
  success: boolean;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    directCommandRate: 0,
    totalRequests: 0,
    lastCommand: '',
    status: 'excellent'
  });

  const performanceDataRef = useRef<PerformanceData[]>([]);
  const maxDataPoints = 100; // Mantener solo los últimos 100 puntos

  // Función para determinar el estado basado en las métricas
  const getStatus = (avgResponseTime: number, cacheRate: number): PerformanceMetrics['status'] => {
    if (avgResponseTime < 200 && cacheRate > 0.6) return 'excellent';
    if (avgResponseTime < 500 && cacheRate > 0.4) return 'good';
    if (avgResponseTime < 1000 && cacheRate > 0.2) return 'poor';
    return 'critical';
  };

  // Función para registrar una nueva métrica
  const recordMetric = (
    command: string,
    responseTime: number,
    type: 'direct' | 'cached' | 'processed',
    success: boolean = true
  ) => {
    const newDataPoint: PerformanceData = {
      timestamp: Date.now(),
      responseTime,
      command,
      type,
      success
    };

    // Añadir nuevo punto y mantener solo los últimos N puntos
    performanceDataRef.current.push(newDataPoint);
    if (performanceDataRef.current.length > maxDataPoints) {
      performanceDataRef.current.shift();
    }

    // Calcular métricas
    const data = performanceDataRef.current.filter(d => d.success);
    const totalRequests = data.length;
    
    if (totalRequests === 0) return;

    const averageResponseTime = data.reduce((sum, d) => sum + d.responseTime, 0) / totalRequests;
    const cacheHits = data.filter(d => d.type === 'cached' || d.type === 'direct').length;
    const cacheHitRate = cacheHits / totalRequests;
    const directCommands = data.filter(d => d.type === 'direct').length;
    const directCommandRate = directCommands / totalRequests;

    const newMetrics: PerformanceMetrics = {
      responseTime,
      averageResponseTime,
      cacheHitRate,
      directCommandRate,
      totalRequests,
      lastCommand: command,
      status: getStatus(averageResponseTime, cacheHitRate)
    };

    setMetrics(newMetrics);
  };

  // Función para limpiar métricas
  const clearMetrics = () => {
    performanceDataRef.current = [];
    setMetrics({
      responseTime: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      directCommandRate: 0,
      totalRequests: 0,
      lastCommand: '',
      status: 'excellent'
    });
  };

  // Función para obtener datos históricos
  const getHistoricalData = (minutes: number = 10) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return performanceDataRef.current.filter(d => d.timestamp > cutoff);
  };

  // Función para obtener estadísticas detalladas
  const getDetailedStats = () => {
    const data = performanceDataRef.current.filter(d => d.success);
    
    if (data.length === 0) {
      return {
        totalRequests: 0,
        directCommands: 0,
        cachedRequests: 0,
        processedRequests: 0,
        averageResponseTime: 0,
        medianResponseTime: 0,
        p95ResponseTime: 0,
        fastestCommand: null,
        slowestCommand: null
      };
    }

    const sortedByTime = [...data].sort((a, b) => a.responseTime - b.responseTime);
    const medianIndex = Math.floor(sortedByTime.length / 2);
    const p95Index = Math.floor(sortedByTime.length * 0.95);

    return {
      totalRequests: data.length,
      directCommands: data.filter(d => d.type === 'direct').length,
      cachedRequests: data.filter(d => d.type === 'cached').length,
      processedRequests: data.filter(d => d.type === 'processed').length,
      averageResponseTime: data.reduce((sum, d) => sum + d.responseTime, 0) / data.length,
      medianResponseTime: sortedByTime[medianIndex]?.responseTime || 0,
      p95ResponseTime: sortedByTime[p95Index]?.responseTime || 0,
      fastestCommand: sortedByTime[0],
      slowestCommand: sortedByTime[sortedByTime.length - 1]
    };
  };

  return {
    metrics,
    recordMetric,
    clearMetrics,
    getHistoricalData,
    getDetailedStats
  };
}
