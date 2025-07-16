import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-primary text-white py-4 px-6 flex items-center justify-between shadow-md">
      {/* ---------- LOGO / TEXTO ---------- */}
      <Link href="#" prefetch={false} className="flex items-center gap-2">
        <span className="text-xs font-bold leading-tight">
          GOBIERNO DE LA PROVINCIA DE
          <br />
          BUENOS AIRES
        </span>
      </Link>

      {/* ---------- NAV ---------- */}
      <nav aria-label="Menú principal" className="hidden md:flex gap-6">
        {[
          ["Inicio", "#inicio"],
          ["Servicios", "#servicios"],
          ["Contacto", "#contacto"],
          ["Accesibilidad", "#accesibilidad"],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="hover:underline">
            {label}
          </Link>
        ))}
      </nav>

      
    </header>
  )
}
