"use client"

import { use } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Image as ImageIcon, Star, User, CalendarPlus } from "lucide-react"
import BookingWizardSheet from "@/components/b2c/BookingWizardSheet"

export default function CustomerAppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { slug } = use(params)

  // Nomenclaturas mais sofisticadas para o cliente final
  const NAV_ITEMS = [
    { label: "Início", icon: Home, href: `/c/${slug}` },
    { label: "Estilo", icon: ImageIcon, href: `/c/${slug}/explorar` },
    { label: "VIP", icon: Star, href: `/c/${slug}/clube` },
    { label: "Perfil", icon: User, href: `/c/${slug}/perfil` },
  ]

  const openBookingWizard = () => {
    router.push(`${pathname}?booking=true&step=1`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-md bg-black min-h-[100dvh] relative overflow-x-hidden font-sans text-zinc-50 selection:bg-zinc-800">
      
      {/* O container principal agora vai até o fundo, e o padding bottom garante que o conteúdo não fique sob a navbar */}
      <main className="h-full pb-28 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* BOTTOM NAVIGATION PWA: Fundo preto absoluto com blur sutil apenas na borda superior */}
      <nav className="fixed bottom-0 w-full max-w-md bg-black/90 backdrop-blur-2xl border-t border-white/5 pb-safe pt-3 px-6 pb-6 z-50">
        <div className="flex items-center justify-between relative">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href
            const isLeftOfCenter = index === 1
            const marginClass = isLeftOfCenter ? "mr-12" : ""

            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${marginClass}`}
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isActive ? 'bg-zinc-900/80' : 'bg-transparent'}`}>
                   <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-zinc-500"}`} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* BOTÃO MESTRE (Agendar) - Flutuante e Premium */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-10">
            <button 
              onClick={openBookingWizard} 
              className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 text-black shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95 border border-zinc-200"
            >
              <CalendarPlus className="w-6 h-6 transition-transform group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sheet Global de Agendamento */}
      <BookingWizardSheet />
    </div>
  )
}