"use client"

import { useState, useEffect } from 'react'

interface ClientOnlyProps {
  readonly children: React.ReactNode
  readonly fallback?: React.ReactNode
}

/**
 * Componente que solo renderiza en el cliente para evitar problemas de hidratación
 * Útil para componentes que dependen de APIs del navegador o estado del cliente
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
