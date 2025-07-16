# Accesibilidad POC - Navegación por Voz con OpenAI

Este proyecto es una prueba de concepto que implementa navegación por voz usando la API de OpenAI para interpretar comandos de voz y ejecutar acciones en el DOM.

## Características

- **Reconocimiento de voz**: Utiliza Web Speech API para capturar comandos de voz
- **Interpretación inteligente**: OpenAI procesa los comandos y mapea elementos del DOM
- **Acciones automáticas**: Ejecuta clics, desplazamientos y navegación basada en comandos
- **Interfaz accesible**: Diseño con mejores prácticas de accesibilidad
- **Feedback visual**: Muestra el estado del reconocimiento y respuestas del sistema

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar OpenAI API Key

Crea un archivo `.env.local` en la raíz del proyecto:

```env
OPENAI_API_KEY=tu_clave_de_openai_aqui
```

### 3. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso

### Comandos de voz disponibles:

- **"Ir a inicio"** - Navega a la sección de inicio
- **"Ir a servicios"** - Navega a la sección de servicios  
- **"Ir a contacto"** - Navega a la sección de contacto
- **"Llamar teléfono"** - Activa el enlace de teléfono
- **"Enviar email"** - Activa el enlace de email
- **"Ver turnos"** - Enfoca la tarjeta de turnos online
- **"Ver historial"** - Enfoca la tarjeta de historial clínico
- **"Ver teleconsultas"** - Enfoca la tarjeta de teleconsultas
- **"Ver farmacias"** - Enfoca la tarjeta de farmacias adheridas
- **"Ver noticias"** - Enfoca la tarjeta de noticias de salud
- **"Ver soporte"** - Enfoca la tarjeta de soporte 24/7

### Cómo usar:

1. Haz clic en el botón del micrófono en la esquina inferior derecha
2. Habla claramente uno de los comandos disponibles
3. El sistema procesará tu comando y ejecutará la acción correspondiente
4. Verás el feedback en el panel de transcripción

## Arquitectura

### Componentes principales:

- **VoiceInputDisplay**: Interfaz principal para el control de voz
- **useVoiceRecognition**: Hook para manejar Web Speech API
- **useVoiceCommands**: Hook para procesar comandos y ejecutar acciones
- **API Route**: `/api/voice-command` - Endpoint que conecta con OpenAI

### Flujo de trabajo:

1. **Captura de voz**: Web Speech API convierte audio a texto
2. **Análisis DOM**: Se extraen elementos interactivos de la página
3. **Procesamiento OpenAI**: Se envía contexto DOM + comando a OpenAI
4. **Interpretación**: OpenAI devuelve acción específica y elemento target
5. **Ejecución**: Se ejecuta la acción en el DOM (click, scroll, focus)

## Tecnologías utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **OpenAI API** - Procesamiento de lenguaje natural
- **Web Speech API** - Reconocimiento de voz
- **Radix UI** - Componentes de interfaz

## Consideraciones de accesibilidad

- Soporte para lectores de pantalla
- Navegación por teclado
- Atributos ARIA apropiados
- Roles semánticos
- Contraste de colores accesible
- Anuncios para lectores de pantalla

## Limitaciones conocidas

- Requiere navegador compatible con Web Speech API
- Necesita conexión a internet para OpenAI API
- El reconocimiento de voz puede variar según el micrófono y ruido ambiente
- Actualmente optimizado para español (es-ES)

## Estructura del proyecto

```
/
├── app/
│   ├── api/voice-command/route.ts    # API endpoint para OpenAI
│   ├── page.tsx                      # Página principal
│   └── layout.tsx                    # Layout principal
├── components/
│   ├── voice-input-display.tsx       # Componente principal de voz
│   ├── header.tsx                    # Header del sitio
│   └── ui/                          # Componentes de interfaz
├── hooks/
│   ├── use-voice-recognition.ts      # Hook para Web Speech API
│   └── use-voice-commands.ts         # Hook para procesar comandos
└── lib/
    └── utils.ts                      # Utilidades
```

## Desarrollo futuro

- Soporte para más idiomas
- Comandos de voz más complejos
- Integración con bases de datos
- Mejores algoritmos de matching
- Soporte offline básico
- Personalización de comandos

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto es una prueba de concepto para fines educativos y de demostración.
