"use client"

import { Loader2 } from "lucide-react"

// Importando o nosso novo Cérebro e os Músculos (Componentes Visuais)
import { useAgenda } from "@/hooks/useAgenda"
import AgendaHeader from "@/components/agenda/AgendaHeader"
import AgendaTimeline from "@/components/agenda/AgendaTimeline"
import NewAppointmentSheet from "@/components/agenda/NewAppointmentSheet"

export default function AgendaPage() {
  // Puxando tudo do nosso Hook Customizado
  const { state, actions } = useAgenda()
  const { isLoading, appointments, t } = state

  // Estado de Carregamento Inicial
  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${t.textHighlight}`} />
        <p>A carregar a agenda...</p>
      </div>
    )
  }

  // A Mágica Acontece Aqui 👇
  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Cabeçalho */}
      <AgendaHeader state={state} actions={actions} />

      {/* 2. Linha do Tempo de Agendamentos */}
      <AgendaTimeline state={state} actions={actions} />

      {/* 3. Gaveta Lateral (Sheet) para Nova Reserva */}
      <NewAppointmentSheet state={state} actions={actions} />

    </div>
  )
}