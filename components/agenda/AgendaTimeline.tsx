"use client"

import { Clock, Plus, User, CheckCircle2, XCircle } from "lucide-react"

export default function AgendaTimeline({ state, actions }: { state: any, actions: any }) {
  const { timelineBlocks, t } = state
  const { handleUpdateStatus, resetForm, setSelectedTime, setIsSheetOpen, setCheckoutAppt } = actions

  return (
    <div className="relative rounded-[2rem] border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/5 dark:bg-zinc-900/40 sm:p-10">
      <div className="absolute bottom-10 left-[75px] top-10 hidden w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent dark:via-zinc-800 sm:block"></div>

      <div className="space-y-6">
        {timelineBlocks.map((block: any) => {
          if (block.type === 'appointment') {
            const { hour, appointment, duration, professional } = block
            const isLongService = duration && duration > 30

            return (
              <div key={hour} className="group relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 pt-2">
                <div className="flex sm:w-16 shrink-0 items-center sm:justify-end mt-4">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white/90 tracking-tight">{hour}</span>
                </div>
                
                <div className={`hidden h-3 w-3 rounded-full ${t.primaryBg} ring-[6px] ring-white transition-transform duration-300 group-hover:scale-125 dark:ring-zinc-950 sm:block z-10 mt-4 shadow-sm`}></div>
                
                <div className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between ${t.radius} border ${isLongService ? 'border-zinc-200/80 shadow-md' : 'border-zinc-100 shadow-sm'} bg-white/90 backdrop-blur-xl p-5 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/80 gap-4`}>
                  
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${t.primaryBg} font-bold tracking-wide text-white shrink-0 shadow-inner`}>
                      {appointment.client_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{appointment.client_name}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{appointment.service}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="flex items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          <Clock className="w-3.5 h-3.5 mr-1" /> {duration} min
                        </span>
                        
                        {professional && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-zinc-600 bg-zinc-100 dark:bg-zinc-800/80 dark:text-zinc-300 px-2 py-0.5 rounded-lg border border-zinc-200/50 dark:border-white/5">
                              {professional.avatar_url ? (
                                <img src={professional.avatar_url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                              ) : (
                                <User className="w-3 h-3" />
                              )}
                              {professional.name.split(' ')[0]}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 mt-2 sm:mt-0">
                    <span className={`text-[10px] w-max px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${
                      appointment.status === 'Finalizado' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                    }`}>
                      {appointment.status}
                    </span>

                    {appointment.status === 'Confirmado' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCheckoutAppt(appointment)}
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Receber
                        </button>
                        
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'Cancelado')}
                          className="flex items-center gap-1.5 rounded-xl bg-zinc-100/50 px-3 py-2 text-xs font-bold text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          } else {
            return (
              <div key={block.hour} className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex sm:w-16 shrink-0 items-center sm:justify-end">
                  <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">{block.hour}</span>
                </div>
                <div className="hidden h-2 w-2 rounded-full bg-zinc-200 ring-[6px] ring-white transition-transform group-hover:scale-125 group-hover:bg-zinc-300 dark:bg-zinc-800 dark:ring-zinc-950 sm:block z-10"></div>
                
                <div className="flex-1">
                  <button 
                    onClick={() => {
                      resetForm() 
                      setSelectedTime(block.hour) 
                      setIsSheetOpen(true) 
                    }}
                    className={`flex h-[56px] w-full items-center ${t.radius} border-2 border-dashed border-zinc-200/60 bg-transparent px-5 text-sm font-semibold text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 hover:${t.textHighlight} dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/30`}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar horário às {block.hour}
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