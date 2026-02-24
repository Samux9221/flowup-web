"use client"

import { useParams } from "next/navigation"
import { Loader2, Scissors } from "lucide-react"

// Importando o Cérebro e os Componentes
import { useAgendamento } from "@/hooks/useAgendamento"
import BookingWizard from "@/components/agendamento/BookingWizard"
import PortfolioSheet from "@/components/agendamento/PortfolioSheet"
import CatalogSheet from "@/components/agendamento/CatalogSheet"
import FloatingMenu from "@/components/agendamento/FloatingMenu"

export default function AgendarPage() {
  const params = useParams()
  const slug = params.slug as string

  // Puxando tudo de dentro do nosso novo Hook Customizado
  const { state, actions } = useAgendamento(slug)

  // Tratando carregamento e erro logo no início
  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (state.notFound) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 text-center">
        <Scissors className="h-12 w-12 text-zinc-300 mb-4" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Negócio não encontrado</h1>
        <p className="text-zinc-500 mt-2">Verifique se o link está correto.</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-500 relative ${state.theme.background}`}>
      
      {/* 🟢 TELA PRINCIPAL: AGENDAMENTO (WIZARD) */}
      <div className={`pt-8 px-4 sm:pt-12 transition-opacity duration-300 ${state.activeTab !== 'agendar' ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
        <BookingWizard state={state} actions={actions} />
      </div>

      {/* 📸 TELA: PORTFÓLIO */}
      {state.activeTab === 'portfolio' && (
        <PortfolioSheet state={state} actions={actions} />
      )}

      {/* 🛍️ TELA: CATÁLOGO */}
      {state.activeTab === 'catalogo' && (
        <CatalogSheet state={state} actions={actions} />
      )}

      {/* 📱 MENU NAVEGAÇÃO INFERIOR */}
      <FloatingMenu state={state} actions={actions} />
      
    </div>
  )
}