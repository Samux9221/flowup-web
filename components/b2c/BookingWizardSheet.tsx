"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { X, ChevronLeft, CalendarClock, Scissors, User, CheckCircle2 } from "lucide-react"

// MOCKS PARA DESENVOLVIMENTO (Substituiremos por chamadas ao Supabase no futuro)
const MOCK_SERVICES = [
  { id: "1", title: "Corte Degradê", price: 45, duration: "45 min" },
  { id: "2", title: "Corte + Barba", price: 75, duration: "1h 15m" },
]
const MOCK_PROFS = [
  { id: "1", name: "João Silva", role: "Barbeiro Sênior", img: "https://i.pravatar.cc/150?u=joao" },
  { id: "2", name: "Marcos", role: "Especialista", img: "https://i.pravatar.cc/150?u=marcos" },
]
const MOCK_TIMES = ["09:00", "09:45", "10:30", "14:00", "14:45", "15:30", "17:00"]

export default function BookingWizardSheet() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Leitura de Estado da URL
  const isBooking = searchParams.get("booking") === "true"
  const currentStep = parseInt(searchParams.get("step") || "1")
  const selectedService = searchParams.get("service")
  const selectedProf = searchParams.get("prof")
  const selectedTime = searchParams.get("time")

  // Estado para controlar a animação de entrada/saída do BottomSheet
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isBooking) {
      // Pequeno delay para permitir a montagem do DOM antes de animar a transição
      requestAnimationFrame(() => setIsVisible(true))
      document.body.style.overflow = "hidden" // Previne o scroll do fundo no Mobile
    } else {
      setIsVisible(false)
      document.body.style.overflow = "auto"
    }
  }, [isBooking])

  // Função centralizadora para atualizar a URL sem recarregar a página
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key)
      else params.set(key, value)
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("booking")
      params.delete("step")
      params.delete("service")
      params.delete("prof")
      params.delete("time")
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, 300) // Aguarda a animação de descida terminar
  }

  const goBack = () => {
    if (currentStep > 1) updateUrlParams({ step: (currentStep - 1).toString() })
    else handleClose()
  }

  if (!isBooking && !isVisible) return null

  // ENGENHARIA DOS PASSOS (Steps)
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-zinc-500" /> Escolha o Serviço
            </h3>
            {MOCK_SERVICES.map(svc => (
              <button 
                key={svc.id}
                onClick={() => updateUrlParams({ service: svc.id, step: "2" })}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left"
              >
                <div>
                  <p className="font-bold text-white text-base">{svc.title}</p>
                  <p className="text-xs text-zinc-400 font-medium mt-1">{svc.duration}</p>
                </div>
                <span className="text-white font-black">R$ {svc.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-zinc-500" /> Profissional
            </h3>
            <button 
                onClick={() => updateUrlParams({ prof: "any", step: "3" })}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left mb-2"
              >
                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Qualquer Profissional</p>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Maior disponibilidade</p>
                </div>
            </button>
            {MOCK_PROFS.map(prof => (
              <button 
                key={prof.id}
                onClick={() => updateUrlParams({ prof: prof.id, step: "3" })}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left"
              >
                <img src={prof.img} alt={prof.name} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                <div>
                  <p className="font-bold text-white text-base">{prof.name}</p>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">{prof.role}</p>
                </div>
              </button>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <CalendarClock className="w-5 h-5 text-zinc-500" /> Horário
            </h3>
            
            {/* Componente Horizontal de Dias (Smart Slots) */}
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
              {[1, 2, 3, 4, 5].map((day, i) => (
                <button key={i} className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${i === 0 ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-900 text-zinc-400 border-white/5 hover:border-white/20'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{i === 0 ? 'Hoje' : 'Qui'}</span>
                  <span className="text-xl font-black">{10 + i}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {MOCK_TIMES.map(time => (
                <button 
                  key={time}
                  onClick={() => updateUrlParams({ time, step: "4" })}
                  className="py-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold hover:bg-white hover:text-zinc-950 transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Revisar Reserva</h3>
              <p className="text-zinc-400 text-sm mt-2">Confirme os dados do seu agendamento.</p>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-white/5 p-5 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-zinc-400 text-sm font-medium">Serviço</span>
                <span className="text-white font-bold">{MOCK_SERVICES.find(s => s.id === selectedService)?.title}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-zinc-400 text-sm font-medium">Profissional</span>
                <span className="text-white font-bold">{selectedProf === 'any' ? 'Qualquer um' : MOCK_PROFS.find(p => p.id === selectedProf)?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm font-medium">Data e Hora</span>
                <span className="text-white font-bold">Hoje, {selectedTime}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                alert("Motor de Inserção Supabase será acionado aqui!")
                handleClose()
              }}
              className="w-full bg-white text-zinc-950 py-4 rounded-xl text-base font-black shadow-xl hover:bg-zinc-200 transition-all active:scale-95 mt-4"
            >
              Confirmar Agendamento
            </button>
          </div>
        )
    }
  }

  return (
    <>
      {/* OVERLAY (Backdrop escuro) */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
      />

      {/* BOTTOM SHEET (O Modal Deslizante) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[101] mx-auto max-w-md w-full bg-[#0a0a0c] border-t border-white/10 rounded-t-[2.5rem] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col max-h-[90vh] ${isVisible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* DRAG HANDLE (Indicador visual de arraste) */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full"></div>
        </div>

        {/* HEADER DO WIZARD */}
        <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-white/5">
          {currentStep > 1 ? (
            <button onClick={goBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : <div className="w-10"></div>}
          
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${step === currentStep ? "w-6 bg-white" : step < currentStep ? "w-2 bg-zinc-600" : "w-2 bg-zinc-800"}`} />
            ))}
          </div>

          <button onClick={handleClose} className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO COM SCROLL INTERNO */}
        <div className="p-6 overflow-y-auto no-scrollbar pb-12">
          {renderStepContent()}
        </div>
      </div>
    </>
  )
}