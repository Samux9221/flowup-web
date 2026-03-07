"use client"

import { Scissors, Clock, User, CheckCircle2, ArrowLeft, Loader2, MessageCircle, Calendar as CalendarIcon, ChevronRight } from "lucide-react"

export default function BookingWizard({ state, actions }: { state: any, actions: any }) {
  const { 
    step, services, professionals, selectedService, selectedProfessional, 
    selectedDate, selectedTime, clientName, clientPhone, isSubmitting, 
    today, timeSlots, brandColor, theme, settings 
  } = state
  
  const { 
    setStep, setSelectedService, setSelectedProfessional, setSelectedDate, 
    setSelectedTime, setClientName, setClientPhone, isSlotAvailable, 
    handleBooking, openWhatsApp 
  } = actions

  // 🔹 FUNÇÃO PARA GERAR OS PRÓXIMOS 7 DIAS (CALENDÁRIO HORIZONTAL) 🔹
  const generateNextDays = () => {
    const days = []
    const date = new Date(today + "T12:00:00") // Garante o fuso correto
    for (let i = 0; i < 7; i++) {
      const d = new Date(date)
      d.setDate(date.getDate() + i)
      const isoDate = d.toISOString().split('T')[0]
      const weekDay = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
      const dayNum = d.getDate()
      days.push({ isoDate, weekDay, dayNum })
    }
    return days
  }
  const nextDays = generateNextDays()

  return (
    <div className={`mx-auto max-w-md rounded-[2rem] overflow-hidden border transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in ${theme.card} shadow-2xl`}>
      
      {/* CABEÇALHO PREMIUM */}
      {step < 5 && (
        <div className="px-6 py-8 text-center text-white transition-colors duration-500 relative overflow-hidden" style={{ backgroundColor: brandColor }}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg rotate-3 relative z-10 border border-white/20">
            <Scissors className="h-8 w-8 -rotate-3" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight relative z-10">{settings?.business_name || "Seu Negócio"}</h1>
          <p className="text-white/80 text-sm mt-1 relative z-10 font-medium">Agendamento rápido e fácil</p>
        </div>
      )}

      <div className={`${step < 5 ? 'p-6 sm:p-8' : ''}`}>
        
        {/* PASSO 1: ESCOLHER SERVIÇO */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>1</span>
              Qual serviço deseja?
            </h2>
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-sm text-center py-4 text-zinc-500">Nenhum serviço disponível.</p>
              ) : services.map((svc: any) => (
                <button 
                  key={svc.id} 
                  onClick={() => { setSelectedService(svc); setStep(2); }} 
                  className={`w-full text-left group flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/10 p-4 transition-all hover:shadow-md hover:border-zinc-400 dark:hover:border-white/30 ${theme.inputBg}`}
                >
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-base">{svc.title}</p>
                    <p className="text-sm mt-1 flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                      <Clock className="h-3.5 w-3.5" /> {svc.duration_minutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold px-3 py-1.5 rounded-xl text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
                      R$ {Number(svc.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 2: ESCOLHER PROFISSIONAL */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep(1)} className="text-sm font-medium flex items-center gap-1 transition-colors mb-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>2</span>
              Escolha o Profissional
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setSelectedProfessional(null); setStep(3); }} 
                className={`flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 p-5 transition-all hover:shadow-md hover:border-zinc-400 dark:hover:border-white/30 ${theme.inputBg}`}
              >
                <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">Qualquer um</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Sem preferência</p>
                </div>
              </button>

              {professionals.map((prof: any) => (
                <button 
                  key={prof.id} 
                  onClick={() => { setSelectedProfessional(prof); setStep(3); }} 
                  className={`flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 p-5 transition-all hover:shadow-md hover:border-zinc-400 dark:hover:border-white/30 ${theme.inputBg}`}
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden">
                    {prof.avatar_url ? (
                      <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{prof.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Profissional</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 3: DATA E HORA (APPLE STYLE) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep(2)} className="text-sm font-medium flex items-center gap-1 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>3</span>
              Quando será o atendimento?
            </h2>
            
            <div className="space-y-5">
              {/* Calendário Horizontal Scrollável */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                {nextDays.map((day) => {
                  const isSelected = selectedDate === day.isoDate
                  return (
                    <button 
                      key={day.isoDate}
                      onClick={() => { setSelectedDate(day.isoDate); setSelectedTime(""); }}
                      style={isSelected ? { backgroundColor: brandColor, borderColor: brandColor, color: '#fff' } : {}}
                      className={`flex shrink-0 flex-col items-center justify-center w-[72px] h-[88px] rounded-2xl border transition-all ${
                        isSelected 
                          ? 'shadow-md scale-105' 
                          : `border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 ${theme.inputBg}`
                      }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">{day.weekDay}</span>
                      <span className="text-2xl font-black">{day.dayNum}</span>
                    </button>
                  )
                })}
              </div>

              {/* Grid de Horários */}
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" /> Horários Disponíveis
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {timeSlots.map((hour: string) => {
                    const isAvailable = isSlotAvailable(hour)
                    const isSelected = selectedTime === hour
                    return (
                      <button 
                        key={hour} 
                        disabled={!isAvailable} 
                        onClick={() => setSelectedTime(hour)} 
                        style={isSelected ? { backgroundColor: brandColor, borderColor: brandColor, color: '#fff' } : {}} 
                        className={`py-3 rounded-xl text-sm font-bold transition-all ${
                          !isAvailable 
                            ? `opacity-30 cursor-not-allowed text-zinc-500 ${theme.inputBg}` 
                            : isSelected 
                              ? "shadow-md scale-105 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950" 
                              : `border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:border-zinc-400 dark:hover:border-white/30 ${theme.inputBg}`
                        }`}
                      >
                        {hour}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button 
              disabled={!selectedTime} 
              onClick={() => setStep(4)} 
              style={{ backgroundColor: selectedTime ? brandColor : undefined }} 
              className={`w-full mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 ${!selectedTime ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800' : 'shadow-lg'}`}
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PASSO 4: IDENTIFICAÇÃO DO CLIENTE */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setStep(3)} className="text-sm font-medium flex items-center gap-1 transition-colors mb-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-zinc-900 dark:text-white">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 ${theme.inputBg}`}>4</span> 
              Como devemos chamar-lhe?
            </h2>
            
            {/* Resumo Rápido */}
            <div className={`rounded-2xl p-4 border border-zinc-200 dark:border-white/10 mb-6 text-sm flex justify-between items-center ${theme.inputBg}`}>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">{selectedService?.title}</p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedDate.split('-').reverse().join('/')} às {selectedTime}</p>
              </div>
              <button onClick={() => setStep(1)} style={{ color: brandColor }} className="text-xs font-bold underline">Alterar</button>
            </div>

            {/* Inputs Minimalistas */}
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="O seu Nome" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  className={`w-full rounded-2xl border border-zinc-200 dark:border-white/10 py-4 pl-12 pr-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white ${theme.inputBg}`} 
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="tel" 
                  placeholder="O seu WhatsApp" 
                  value={clientPhone} 
                  onChange={(e) => setClientPhone(e.target.value)} 
                  className={`w-full rounded-2xl border border-zinc-200 dark:border-white/10 py-4 pl-12 pr-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white ${theme.inputBg}`} 
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting || !clientName || !clientPhone} 
              onClick={handleBooking} 
              style={{ backgroundColor: (!isSubmitting && clientName && clientPhone) ? brandColor : undefined }} 
              className={`w-full mt-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-bold text-white transition-all active:scale-95 ${(!clientName || !clientPhone) ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800' : 'shadow-xl'}`}
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Agendamento"}
            </button>
          </div>
        )}

        {/* PASSO 5: O BILHETE (APPLE WALLET STYLE) */}
        {step === 5 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] p-6 pb-8">
            <div className="text-center mb-6 pt-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-5">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Horário Confirmado!</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-medium">Te esperamos na cadeira.</p>
            </div>

            {/* O Cartão Virtual */}
            <div className="bg-white dark:bg-black rounded-3xl p-6 shadow-sm border border-zinc-200/50 dark:border-white/5 relative overflow-hidden">
              {/* Recortes do Ticket */}
              <div className="absolute left-[-12px] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
              <div className="absolute right-[-12px] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
              
              <div className="border-b-2 border-dashed border-zinc-100 dark:border-zinc-800 pb-5 mb-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Serviço</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedService?.title}</p>
                </div>
                {selectedProfessional && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Profissional</p>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-400" /> {selectedProfessional.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Data</p>
                  <p className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-zinc-400" /> {selectedDate.split('-').reverse().join('/')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Hora</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-white" style={{ color: brandColor }}>{selectedTime}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={openWhatsApp} 
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/20 active:scale-95 transition-transform"
              >
                <MessageCircle className="h-5 w-5" /> Partilhar no WhatsApp
              </button>
              <button 
                onClick={() => { setStep(1); setClientName(""); setClientPhone(""); setSelectedTime(""); setSelectedProfessional(null); }} 
                className="w-full py-3 text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Fazer outro agendamento
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}