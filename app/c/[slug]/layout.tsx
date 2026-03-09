"use client"

import { use } from "react" // 🔹 Importamos o hook use
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Compass, Award, User, CalendarPlus } from "lucide-react"
import BookingWizardSheet from "@/components/b2c/BookingWizardSheet"

export default function CustomerAppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }> // 🔹 Tipamos como Promise
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // 🔹 Desempacotamos a Promise
  const { slug } = use(params)

  const NAV_ITEMS = [
    { label: "Início", icon: Home, href: `/c/${slug}` },
    { label: "Explorar", icon: Compass, href: `/c/${slug}/explorar` },
    { label: "Clube", icon: Award, href: `/c/${slug}/clube` },
    { label: "Perfil", icon: User, href: `/c/${slug}/perfil` },
  ]

  const openBookingWizard = () => {
    router.push(`${pathname}?booking=true&step=1`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-md bg-[#09090b] min-h-[100dvh] relative shadow-2xl overflow-hidden font-sans text-white">
      <main className="h-full pb-28 overflow-y-auto no-scrollbar">
        {children}
      </main>

      <nav className="absolute bottom-0 w-full px-6 pb-8 pt-4 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 z-50">
        <div className="flex items-center justify-between relative">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href
            const isLeftOfCenter = index === 1
            const marginClass = isLeftOfCenter ? "mr-12" : ""

            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={`flex flex-col items-center gap-1.5 transition-all ${marginClass} ${
                  isActive ? "text-white scale-105" : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}

          <div className="absolute left-1/2 -translate-x-1/2 -top-12">
            <button 
              onClick={openBookingWizard} 
              className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white text-zinc-950 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              <CalendarPlus className="w-7 h-7 transition-transform group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </nav>

      <BookingWizardSheet />
    </div>
  )
}