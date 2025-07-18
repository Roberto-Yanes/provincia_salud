"use client"
import Header from "@/components/header"
import VoiceInputDisplay from "@/components/voice-input-display"
import Link from "next/link"

import { useState, useEffect } from "react"

// Permite que otros módulos (como el hook de voz) disparen el click en el botón de turnos
if (typeof window !== 'undefined') {
  (window as any).clickTurnosOnline = () => {
    const btn = document.getElementById("turnos-btn") as HTMLButtonElement | null;
    if (btn) btn.click();
  }
}

export default function Home() {
  const [focusedService, setFocusedService] = useState<string | null>(null)
  // Flag para saber si el foco fue activado por comando de voz
  const [shouldClickTurnos, setShouldClickTurnos] = useState(false)

  // Cuando el comando de voz activa el foco, también pide el click
  const handleServiceFocus = (id: string, byVoice = false, doClick = false) => {
    setFocusedService(id)
    if (id === 'turnos' && (byVoice || doClick)) {
      setShouldClickTurnos(true)
    }
  }

  const handleServiceBlur = () => {
    setFocusedService(null)
    setShouldClickTurnos(false)
  }

  // Permite que el comando "ver turnos" haga click en el botón SOLO si fue por comando de voz
  useEffect(() => {
    if (focusedService === "turnos" && shouldClickTurnos) {
      const btn = document.getElementById("turnos-btn") as HTMLButtonElement | null;
      if (btn) {
        btn.focus();
        btn.click();
        setShouldClickTurnos(false)
      }
    }
  }, [focusedService, shouldClickTurnos]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header />

      <main className="flex-1">
        {/* ---------- INICIO ---------- */}
        <section id="inicio" className="py-16 px-6 md:px-12 bg-secondary text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Bienvenido a MiSaludDigital</h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Tu plataforma integral para gestionar tu salud de forma fácil y accesible.
            </p>
            <img
              src="/imagencelumipba.jpeg"
              alt="Mano sosteniendo un celular con la aplicación MiSalud Digital en un entorno hospitalario"
              className="mx-auto rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* ---------- SERVICIOS ---------- */}
        <section id="servicios" className="py-16 px-6 md:px-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">Nuestros Servicios</h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none">
              {/* Primer item como botón dentro de <li> */}
              <li
                id="turnos"
                className={`bg-gray-50 p-0 rounded-lg shadow-md border transition-all duration-200
                  ${focusedService === 'turnos'
                    ? 'border-4 border-primary bg-blue-50 ring-4 ring-primary/30'
                    : 'border-gray-200 hover:shadow-lg'}
                `}
                aria-label="Servicio: Turnos Online"
                style={{display: 'flex', alignItems: 'stretch'}}
              >
                <button
                  type="button"
                  tabIndex={0}
                  className="w-full h-full text-left bg-transparent border-0 p-6 focus:outline-none"
                  onFocus={() => handleServiceFocus('turnos')}
                  onBlur={handleServiceBlur}
                  onMouseDown={() => handleServiceFocus('turnos')}
                  onMouseUp={handleServiceBlur}
                  onClick={e => {
                    // Evitar loop: solo mostrar alert si no fue auto-click por comando de voz
                    if (!shouldClickTurnos) {
                      alert('¡Hiciste click en Turnos Online!')
                    }
                  }}
                  id="turnos-btn"
                >
                  <h3 className="text-xl font-semibold text-primary mb-3">Turnos Online</h3>
                  <p className="text-gray-700">Solicita y gestiona tus turnos médicos de manera rápida y sencilla desde cualquier lugar.</p>
                </button>
              </li>
              {/* Resto de los items como antes */}
              {[ 
                [
                  "Historial Clínico",
                  "Accede a tu historial médico completo, resultados de estudios y recetas en un solo lugar.",
                  "historial"
                ],
                [
                  "Teleconsultas", 
                  "Realiza consultas médicas a distancia con profesionales de la salud.",
                  "teleconsultas"
                ],
                [
                  "Farmacias Adheridas",
                  "Encuentra las farmacias más cercanas y verifica la disponibilidad de tus medicamentos.",
                  "farmacias"
                ],
                [
                  "Noticias de Salud", 
                  "Mantente informado con las últimas novedades y consejos de salud.",
                  "noticias"
                ],
                [
                  "Soporte 24/7", 
                  "Nuestro equipo de soporte está disponible para ayudarte en todo momento.",
                  "soporte"
                ],
              ].map(([title, desc, id]) => (
                <li
                  key={title}
                  id={id}
                  tabIndex={0}
                  className={`bg-gray-50 p-6 rounded-lg shadow-md border transition-all duration-200
                    ${focusedService === id
                      ? 'border-4 border-primary bg-blue-50 ring-4 ring-primary/30'
                      : 'border-gray-200 hover:shadow-lg'}
                  `}
                  aria-label={`Servicio: ${title}`}
                  onFocus={() => handleServiceFocus(id as string)}
                  onBlur={handleServiceBlur}
                  onMouseDown={() => handleServiceFocus(id as string)}
                  onMouseUp={handleServiceBlur}
                >
                  <h3 className="text-xl font-semibold text-primary mb-3">{title}</h3>
                  <p className="text-gray-700">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- CONTACTO ---------- */}
        <section id="contacto" className="py-16 px-6 md:px-12 bg-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8">Contáctanos</h2>
            <p className="text-lg text-gray-700 mb-6">¿Tienes alguna pregunta o necesitas ayuda? ¡Escríbenos!</p>

            <div className="flex flex-col md:flex-row justify-center gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-1" id="contacto-telefono">
                <h3 className="text-xl font-semibold text-primary mb-3">Teléfono</h3>
                <p className="text-gray-700">
                  <a 
                    href="tel:+541112345678" 
                    className="text-primary hover:underline"
                    aria-label="Llamar al teléfono +54 11 1234-5678"
                  >
                    +54 11 1234-5678
                  </a>
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-1" id="contacto-email">
                <h3 className="text-xl font-semibold text-primary mb-3">Email</h3>
                <p className="text-gray-700">
                  <a 
                    href="mailto:info@misaluddigital.com" 
                    className="text-primary hover:underline"
                    aria-label="Enviar email a info@misaluddigital.com"
                  >
                    info@misaluddigital.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- ACCESIBILIDAD ---------- */}
        <section id="accesibilidad" className="py-16 px-6 md:px-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Compromiso con la Accesibilidad
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Esta página es una prueba de concepto para explorar la navegación por voz y la interacción con IA. Nuestro
              objetivo es que puedas acceder a toda la información utilizando comandos de voz.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Trabajamos continuamente para mejorar la accesibilidad de nuestro sitio, incorporando mejores prácticas y
              tecnologías emergentes.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-primary mb-4">Comandos de Voz Disponibles</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>"Ir a inicio"</strong> - Navega a la sección de inicio</li>
                <li>• <strong>"Ir a servicios"</strong> - Navega a la sección de servicios</li>
                <li>• <strong>"Ir a contacto"</strong> - Navega a la sección de contacto</li>
                <li>• <strong>"Llamar teléfono"</strong> - Activa el enlace de teléfono</li>
                <li>• <strong>"Enviar email"</strong> - Activa el enlace de email</li>
                <li>• <strong>"Ver turnos"</strong> - Enfoca la tarjeta de turnos online</li>
                <li>• <strong>"Ver historial"</strong> - Enfoca la tarjeta de historial clínico</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-primary text-white py-6 px-6 md:px-12 text-center" role="contentinfo">
        <p>&copy; {new Date().getFullYear()} MiSaludDigital. Todos los derechos reservados.</p>
        <p className="text-sm mt-2">
          <Link 
            href="#" 
            prefetch={false} 
            className="hover:underline"
            aria-label="Ver política de privacidad"
          >
            Política de Privacidad
          </Link>{" "}
          |{" "}
          <Link 
            href="#" 
            prefetch={false} 
            className="hover:underline"
            aria-label="Ver términos de servicio"
          >
            Términos de Servicio
          </Link>
        </p>
      </footer>

      <VoiceInputDisplay />
    </div>
  )
}
