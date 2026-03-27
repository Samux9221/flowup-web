"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { 
  X, ChevronRight, ChevronLeft, CalendarClock, Scissors, 
  User, CheckCircle2, Camera, UploadCloud, Loader2,
  Clock, Calendar, ArrowRight
} from "lucide-react"

export default function BookingWizardSheet() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const slug = params.slug as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Estados extraídos da URL (Deep Linking)
  const isBooking = searchParams.get("booking") === "true"
  const currentStep = parseInt(searchParams.get("step") || "1")
  const selectedServiceId = searchParams.get("service")
  const selectedProfId = searchParams.get("prof")
  const selectedTime = searchParams.get("time")

  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [services, setServices] = useState<any[]>([])
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Mocks para Horários (Apple Style Slots)
  const mockTimes = ["09:00", "09:45", "10:30", "14:00", "15:30", "17:00", "18:00", "19:30"]
  
  // Lógica para pular etapas: Se temos serviço e profissional via URL, o "Back" volta para o passo 3
  const canGoBack = currentStep > 1 && currentStep < 5

  useEffect(() => {
    if (isBooking) {
      requestAnimationFrame(() => setIsVisible(true))
      document.body.style.overflow = "hidden"
      fetchData()
    } else {
      setIsVisible(false)
      document.body.style.overflow = "auto"
    }
  }, [isBooking, slug])

  const fetchData = async () => {
    if (services.length > 0) return
    setIsLoading(true)
    
    const { data: tenant } = await supabase
      .from('business_settings')
      .select('user_id')
      .eq('slug', slug)
      .single()

    if (tenant) {
      const { data: servs } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', tenant.user_id)
        .order('title')
      
      if (servs) setServices(servs)
    }

    // Injeção de Mock se vazio para manter a UI ativa no desenvolvimento
    if (!services.length) {
      setServices([
        { id: "mock-1", title: "Degradê Navalhado", duration_minutes: 45, price: 55.00 },
        { id: "mock-2", title: "Barboterapia", duration_minutes: 30, price: 40.00 },
        { id: "mock-3", title: "Corte + Barba", duration_minutes: 90, price: 90.00 },
      ])
    }
    setIsLoading(false)
  }

  const updateParams = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    router.push(`${pathname}?${p.toString()}`, { scroll: false })
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => router.push(pathname, { scroll: false }), 400)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    // Simulação de delay de rede premium
    await new Promise(r => setTimeout(r, 1500))
    setIsSubmitting(false)
    updateParams({ step: "5" })
  }

  const renderContent = () => {
    if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>

    switch (currentStep) {
      case 1: // Escolha de Serviço
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h3 className="text-2xl font-semibold text-white tracking-tight">O que vamos fazer?</h3>
              <p className="text-zinc-500 text-sm mt-1">Selecione o serviço para hoje.</p>
            </header>
            <div className="grid gap-3">
              {services.map(svc => (
                <button 
                  key={svc.id}
                  onClick={() => updateParams({ service: svc.id, step: "2" })}
                  className="group w-full flex items-center justify-between p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-600 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-zinc-100 text-base">{svc.title}</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {svc.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold tracking-tighter">R$ {Number(svc.price).toFixed(2)}</span>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-white transition-colors">
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-black" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 2: // Escolha de Profissional
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <header>
              <h3 className="text-2xl font-semibold text-white tracking-tight">Com quem?</h3>
              <p className="text-zinc-500 text-sm mt-1">Escolha o seu especialista preferido.</p>
            </header>
            <div className="grid gap-4">
              {[{id: "1", name: "Marcos", role: "Sênior"}, {id: "any", name: "Qualquer um", role: "Mais rápido"}].map(prof => (
                <button 
                  key={prof.id}
                  onClick={() => updateParams({ prof: prof.id, step: "3" })}
                  className="flex items-center gap-4 p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800 active:scale-[0.98] transition-transform"
                >
                  <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <User className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-white">{prof.name}</span>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-0.5">{prof.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 3: // Escolha de Horário (Apple Slots)
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h3 className="text-2xl font-semibold text-white tracking-tight">Qual o melhor horário?</h3>
            </header>
            
            {/* Dias Horizontais */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x -mx-6 px-6">
              {["Hoje", "Amanhã", "Qui", "Sex", "Sáb"].map((day, i) => (
                <button key={i} className={`snap-start shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-3xl border transition-all ${i === 0 ? 'bg-white text-black border-white shadow-xl shadow-white/10' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{day}</span>
                  <span className="text-2xl font-bold tracking-tighter">{12 + i}</span>
                </button>
              ))}
            </div>

            {/* Grid de Horários */}
            <div className="grid grid-cols-3 gap-3">
              {mockTimes.map(time => (
                <button 
                  key={time}
                  onClick={() => updateParams({ time, step: "4" })}
                  className="py-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-zinc-400 font-semibold hover:border-cyan-500 hover:text-white transition-all active:scale-95"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )

      case 4: // Revisão Final
        const svc = services.find(s => s.id === selectedServiceId)
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white tracking-tight">Quase pronto</h3>
              <p className="text-zinc-500 text-sm mt-1">Confirme os detalhes da reserva.</p>
            </div>

            <div className="bg-zinc-900/50 rounded-[2rem] border border-zinc-800 p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-zinc-500 text-sm">Serviço</span>
                <span className="text-white font-medium">{svc?.title}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-zinc-500 text-sm">Horário</span>
                <span className="text-white font-medium">Hoje, {selectedTime}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-zinc-500 text-sm font-semibold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-bold text-cyan-400 tracking-tighter">R$ {Number(svc?.price).toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-black py-5 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-cyan-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirmar Agendamento <ArrowRight className="w-5 h-5"/></>}
            </button>
          </div>
        )

      case 5: // Sucesso
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/10">
              <CheckCircle2 className="w-12 h-12 text-cyan-500" />
            </div>
            <h3 className="text-3xl font-semibold text-white tracking-tighter">Reservado!</h3>
            <p className="text-zinc-500 mt-3 max-w-[240px] leading-relaxed">
              Tudo pronto para o seu novo visual. Receberá um lembrete em breve.
            </p>
            <button 
              onClick={handleClose}
              className="mt-12 w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold border border-zinc-800 active:scale-95"
            >
              Voltar ao Início
            </button>
          </div>
        )
    }
  }

  return (
    <>
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-black/90 backdrop-blur-md transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
      />

      <div className={`fixed bottom-0 left-0 right-0 z-[999] mx-auto max-w-md w-full bg-black border-t border-zinc-900 rounded-t-[3rem] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-[88dvh] ${isVisible ? "translate-y-0" : "translate-y-full"}`}>
        <div className="w-full flex justify-center py-4" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full"></div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          {canGoBack ? (
            <button onClick={() => updateParams({ step: (currentStep - 1).toString() })} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-400 active:scale-90 transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : <div className="w-10"></div>}
          
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
               <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s === currentStep ? "w-8 bg-cyan-500 shadow-lg shadow-cyan-500/50" : s < currentStep ? "w-3 bg-zinc-700" : "w-3 bg-zinc-900"}`} />
            ))}
          </div>

          <button onClick={handleClose} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-400 active:scale-90 transition-transform">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4">
          {renderContent()}
        </div>
      </div>
    </>
  )
}