"use client"

import { User, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export default function NewAppointmentSheet({ state, actions }: { state: any, actions: any }) {
  const { isSheetOpen, selectedDate, clientName, service, availableServices, selectedTime, timeSlots, isSaving, config, ServiceIcon, t } = state
  const { setIsSheetOpen, setClientName, setService, setSelectedTime, handleSaveAppointment, isSlotAvailable } = actions

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-full sm:max-w-md border-zinc-200/60 bg-white/90 backdrop-blur-2xl p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-950/90 sm:rounded-l-3xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="text-left space-y-2 pb-6 border-b border-zinc-200/60 dark:border-white/10">
            <SheetTitle className="text-2xl font-bold">Nova Reserva</SheetTitle>
            <p className="text-sm text-zinc-500">Agendando para: <strong className={t.textHighlight}>{selectedDate.split('-').reverse().join('/')}</strong></p>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-8 space-y-8 pr-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nome do(a) {config.clientName}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo" 
                  className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Serviço</label>
              <div className="relative">
                <ServiceIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <select 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white appearance-none`}
                >
                  <option value="">Selecione um serviço...</option>
                  {availableServices.map((svc: any) => (
                    <option key={svc.id} value={svc.title}>
                      {svc.title} ({svc.duration_minutes} min) - R$ {Number(svc.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Horário Disponível</label>
              {service === "" ? (
                <p className={`text-sm text-zinc-500 italic ${t.radius} bg-zinc-50 p-3 border border-zinc-200/50 dark:bg-zinc-900 dark:border-white/5`}>
                  Selecione primeiro um serviço para ver e confirmar o horário da sua agenda.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((hour: string) => {
                    const isAvailable = isSlotAvailable(hour)

                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={!isAvailable && selectedTime !== hour}
                        onClick={() => setSelectedTime(hour)}
                        className={`flex items-center justify-center ${t.radius} py-2.5 text-sm font-medium transition-all ${
                          !isAvailable && selectedTime !== hour
                            ? "bg-zinc-100 text-zinc-400 border border-zinc-200/50 cursor-not-allowed dark:bg-zinc-800/50 dark:text-zinc-600 dark:border-zinc-800 opacity-50" 
                            : selectedTime === hour 
                              ? `${t.primaryBg} text-white shadow-md scale-105` 
                              : "bg-white text-zinc-600 border border-zinc-200/80 hover:border-zinc-900 hover:text-zinc-900 dark:bg-zinc-900/50 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/30"
                        }`}
                      >
                        {hour}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-zinc-200/60 pt-6 pb-2 dark:border-white/10">
            <button 
              onClick={handleSaveAppointment}
              disabled={isSaving}
              className={`w-full flex items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-4 py-4 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-70`}
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Reserva"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}