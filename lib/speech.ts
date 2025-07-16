// Utilidad para síntesis de voz en el navegador
export function speak(text: string, lang: string = 'es-ES') {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = lang
    window.speechSynthesis.speak(utterance)
  } else {
    // Puedes mostrar un toast o alert si no está soportado
    // alert('La síntesis de voz no está soportada en este navegador.')
    console.warn('La síntesis de voz no está soportada en este navegador.')
  }
}
