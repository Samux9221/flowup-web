"use client"

import { Clock, Plus } from "lucide-react"

export default function AgendaTimeline({ state, actions }: { state: any, actions: any }) {
  const { timelineBlocks, t } = state
  // 🔹 1. ADICIONAMOS O setCheckoutAppt AQUI 🔹
  const { handleUpdateStatus, resetForm, setSelectedTime, setIsSheetOpen, setCheckoutAppt } = actions

  return (
    <div className="relative rounded-3xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10">
      <div className="absolute bottom-10 left-[75px] top-10 hidden w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent dark:via-zinc-800 sm:block"></div>

      <div className="space-y-6">
        {timelineBlocks.map((block: any) => {
          if (block.type === 'appointment') {
            const { hour, appointment, duration } = block
            const isLongService = duration && duration > 30

            return (
              <div key={hour} className="group relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 pt-2">
                <div className="flex sm:w-16 shrink-0 items-center sm:justify-end mt-4">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">{hour}</span>
                </div>
                
                {/* PONTO NA TIMELINE COM A COR DA MARCA */}
                <div className={`hidden h-3 w-3 rounded-full ${t.primaryBg} ring-4 ring-white transition-all group-hover:scale-110 dark:ring-zinc-950 sm:block z-10 mt-4`}></div>
                
                <div className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between ${t.radius} border ${isLongService ? 'border-zinc-200 shadow-md' : 'border-zinc-100 shadow-sm'} bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/80 gap-4`}>
                  
                  <div className="flex items-center gap-4">
                    {/* AVATAR DO CLIENTE */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${t.primaryBg} font-medium tracking-wide text-white shrink-0 shadow-inner`}>
                      {appointment.client_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{appointment.client_name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{appointment.service}</p>
                        <span className="flex items-center text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md dark:bg-zinc-800">
                          <Clock className="w-3 h-3 mr-1.5 opacity-70" /> {duration} min
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          appointment.status === 'Finalizado' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {appointment.status === 'Confirmado' && (
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      {/* 🔹 2. NOVO BOTÃO DE CHECKOUT (ESTILO APPLE: DESTAQUE PRIMÁRIO) 🔹 */}
                      <button
                        onClick={() => setCheckoutAppt(appointment)}
                        className={`flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
                      >
                        Receber e Finalizar
                      </button>
                      
                      {/* 🔹 3. NOVO BOTÃO DE CANCELAR (ESTILO APPLE: SUTIL/GHOST) 🔹 */}
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'Cancelado')}
                        className="flex-1 sm:flex-none rounded-xl bg-transparent px-4 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          } else {
            return (
              <div key={block.hour} className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex sm:w-16 shrink-0 items-center sm:justify-end">
                  <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">{block.hour}</span>
                </div>
                <div className="hidden h-2 w-2 rounded-full bg-zinc-200 ring-4 ring-white transition-all group-hover:bg-zinc-300 dark:bg-zinc-800 dark:ring-zinc-950 sm:block z-10"></div>
                
                <div className="flex-1">
                  <button 
                    onClick={() => {
                      resetForm() 
                      setSelectedTime(block.hour) 
                      setIsSheetOpen(true) 
                    }}
                    className={`flex h-[52px] w-full items-center ${t.radius} border-2 border-dashed border-zinc-200/60 bg-transparent px-4 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 hover:${t.textHighlight} dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/30`}
                  >
                    <div className="flex items-center opacity-60 transition-opacity group-hover:opacity-100">
                      <Plus className="mr-2 h-4 w-4" /> Agendar horário às {block.hour}
                    </div>
                  </button>
                </div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}