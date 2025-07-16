import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiSaludDigital - Accesibilidad',
  description: 'Plataforma de salud digital con navegación por voz accesible',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
