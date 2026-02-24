"use client"

import { Scissors, Calendar as CalendarIcon, Clock, User, CheckCircle2, ArrowLeft, Loader2, MessageCircle, Phone } from "lucide-react"

export default function BookingWizard({ state, actions }: { state: any, actions: any }) {
  const { step, services, selectedService, selectedDate, selectedTime, clientName, clientPhone, isSubmitting, today, timeSlots, brandColor, theme, settings } = state
  const { setStep, setSelectedService, setSelectedDate, setSelectedTime, setClientName, setClientPhone, isSlotAvailable, handleBooking, openWhatsApp } = actions

  return (
    <div className={`mx-auto max-w-md rounded-3xl overflow-hidden border transition-colors duration-500 animate-in slide-in-from-bottom-4 fade-in ${theme.card}`}>
      {/* CABEÇALHO */}
      <div className="px-6 py-8 text-center text-white transition-colors duration-500 relative overflow-hidden" style={{ backgroundColor: brandColor }}>
        <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg rotate-3 relative z-10">
          <Scissors className="h-8 w-8 -rotate-3" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight relative z-10">{settings?.business_name || "Seu Negócio"}</h1>
        <p className="text-white/80 text-sm mt-1 relative z-10">Agendamento rápido e fácil</p>
      </div>

      <div className="p-6 sm:p-8">
        {/* PASSO 1: ESCOLHER SERVIÇO */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>1</span>
              Qual serviço você deseja?
            </h2>
            <div className="space-y-3">
              {services.length === 0 ? <p className="text-sm text-center py-4 text-zinc-500">Nenhum serviço cadastrado.</p> : services.map((svc: any) => (
                <button key={svc.id} onClick={() => { setSelectedService(svc); setStep(2); }} className={`w-full text-left group flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/10 p-4 transition-all hover:shadow-md hover:border-zinc-900 dark:hover:border-white/30 ${theme.inputBg}`}>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{svc.title}</p>
                    <p className="text-sm mt-0.5 flex items-center gap-1 text-zinc-500 dark:text-zinc-400"><Clock className="h-3 w-3" /> {svc.duration_minutes} min</p>
                  </div>
                  <span className="font-bold px-3 py-1 rounded-xl text-sm text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800">
                    R$ {Number(svc.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 2: DATA E HORA */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep(1)} className="text-sm flex items-center gap-1 transition-colors mb-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>2</span>
              Escolha a data e horário
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <input type="date" min={today} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }} className={`w-full rounded-2xl border border-zinc-200 dark:border-white/10 py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors text-zinc-900 dark:text-white ${theme.inputBg}`} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {timeSlots.map((hour: string) => {
                  const isAvailable = isSlotAvailable(hour)
                  const isSelected = selectedTime === hour
                  return (
                    <button key={hour} disabled={!isAvailable} onClick={() => setSelectedTime(hour)} style={isSelected ? { backgroundColor: brandColor, borderColor: brandColor, color: '#fff' } : {}} className={`py-3 rounded-xl text-sm font-medium transition-all ${!isAvailable ? `opacity-40 cursor-not-allowed text-zinc-500 ${theme.inputBg}` : isSelected ? "shadow-md scale-105" : `border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:border-zinc-900 dark:hover:border-white/30 ${theme.inputBg}`}`}>
                      {hour}
                    </button>
                  )
                })}
              </div>
            </div>
            <button disabled={!selectedTime} onClick={() => setStep(3)} style={{ backgroundColor: selectedTime ? brandColor : undefined }} className={`w-full mt-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 ${!selectedTime ? 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800' : ''}`}>Continuar</button>
          </div>
        )}

        {/* PASSO 3: DADOS DO CLIENTE */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep(2)} className="text-sm flex items-center gap-1 transition-colors mb-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Voltar</button>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-zinc-900 dark:text-white"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>3</span> Só falta isso!</h2>
            <div className={`rounded-2xl p-4 border border-zinc-200 dark:border-white/10 mb-6 text-sm flex justify-between items-center ${theme.inputBg}`}>
              <div><p className="font-semibold text-zinc-900 dark:text-white">{selectedService?.title}</p><p className="text-zinc-500 dark:text-zinc-400">{selectedDate.split('-').reverse().join('/')} às {selectedTime}</p></div>
              <button onClick={() => setStep(1)} style={{ color: brandColor }} className="text-xs font-bold underline">Alterar</button>
            </div>
            <div className="space-y-4">
              <div className="relative"><User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" /><input type="text" placeholder="Seu nome" value={clientName} onChange={(e) => setClientName(e.target.value)} className={`w-full rounded-2xl border border-zinc-200 dark:border-white/10 py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-zinc-900 transition-colors text-zinc-900 dark:text-white ${theme.inputBg}`} /></div>
              <div className="relative"><Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" /><input type="tel" placeholder="Seu WhatsApp" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={`w-full rounded-2xl border border-zinc-200 dark:border-white/10 py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-zinc-900 transition-colors text-zinc-900 dark:text-white ${theme.inputBg}`} /></div>
            </div>
            <button disabled={isSubmitting || !clientName || !clientPhone} onClick={handleBooking} style={{ backgroundColor: (!isSubmitting && clientName && clientPhone) ? brandColor : undefined }} className={`w-full mt-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-semibold text-white transition-all shadow-lg active:scale-95 ${(!clientName || !clientPhone) ? 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800' : ''}`}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Agendamento"}
            </button>
          </div>
        )}

        {/* PASSO 4: SUCESSO */}
        {step === 4 && (
          <div className="space-y-6 text-center py-6 animate-in zoom-in-95 duration-500">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 mb-6"><CheckCircle2 className="h-10 w-10" /></div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Agendado com Sucesso!</h2>
            <div className="pt-6 border-t mt-8 space-y-3 border-zinc-100 dark:border-white/10">
              <button onClick={openWhatsApp} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 active:scale-95"><MessageCircle className="h-5 w-5" /> Avisar no WhatsApp</button>
              <button onClick={() => { setStep(1); setClientName(""); setClientPhone(""); setSelectedTime(""); }} className="w-full py-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Fazer outro agendamento</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}