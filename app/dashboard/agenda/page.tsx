"use client"

import { Loader2 } from "lucide-react"

import { useAgenda } from "@/hooks/useAgenda"
import AgendaHeader from "@/components/agenda/AgendaHeader"
import AgendaTimeline from "@/components/agenda/AgendaTimeline"
import NewAppointmentSheet from "@/components/agenda/NewAppointmentSheet"
// 🔹 IMPORTANDO O NOVO MODAL 🔹
import CheckoutDialog from "@/components/agenda/CheckoutDialog" 

export default function AgendaPage() {
  const { state, actions } = useAgenda()
  const { isLoading, appointments, t } = state

  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${t.textHighlight}`} />
        <p>A carregar a agenda...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AgendaHeader state={state} actions={actions} />
      <AgendaTimeline state={state} actions={actions} />
      <NewAppointmentSheet state={state} actions={actions} />
      <CheckoutDialog state={state} actions={actions} />
    </div>
  )
}