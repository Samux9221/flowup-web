"use client"

import { Calendar as CalendarIcon, Plus } from "lucide-react"

export default function AgendaHeader({ state, actions }: { state: any, actions: any }) {
  const { selectedDate, config, t } = state
  const { setSelectedDate, resetForm, setIsSheetOpen } = actions

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Agenda</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Gerencie os horários do(a) seu(ua) <span className={`font-bold ${t.textHighlight}`}>{config.title.toLowerCase()}</span> com precisão.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <CalendarIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`w-full sm:w-auto cursor-pointer ${t.radius} border border-zinc-200/60 bg-white py-2.5 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
          />
        </div>

        {/* 🔹 BOTÃO NOVA RESERVA: Premium e Dinâmico */}
        <button 
          onClick={() => { resetForm(); setIsSheetOpen(true); }}
          className={`w-full sm:w-auto group flex items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-${t.primaryBg}/20 transition-all active:scale-95`}
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Nova Reserva
        </button>
      </div>
    </header>
  )
}