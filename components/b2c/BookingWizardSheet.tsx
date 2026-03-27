"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { 
  X, ChevronLeft, CalendarClock, Scissors, 
  User, CheckCircle2, Camera, UploadCloud, Loader2
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

  // Leitura de Estado da URL
  const isBooking = searchParams.get("booking") === "true"
  const currentStep = parseInt(searchParams.get("step") || "1")
  const selectedServiceId = searchParams.get("service")
  const selectedProfId = searchParams.get("prof")
  const selectedTime = searchParams.get("time")

  // Estados de Interface e Dados
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [services, setServices] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([]) // Supondo que você crie essa tabela depois
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Mocks Temporários para Horários e Profissionais (Até você criar as tabelas reais)
  const mockTimes = ["09:00", "09:45", "10:30", "14:00", "15:30", "17:00"]
  const mockProfs = [
    { id: "any", name: "Qualquer Profissional", role: "Maior disponibilidade" },
    { id: "1", name: "Marcos", role: "Especialista em Fade" }
  ]

  // Animação do Sheet
  useEffect(() => {
    if (isBooking) {
      requestAnimationFrame(() => setIsVisible(true))
      document.body.style.overflow = "hidden"
      fetchRealData()
    } else {
      setIsVisible(false)
      document.body.style.overflow = "auto"
    }
  }, [isBooking, slug])

  const fetchRealData = async () => {
    if (services.length > 0) return // Evita refetch desnecessário
    setIsLoading(true)
    
    // 1. Acha o dono pelo slug
    const { data: tenant } = await supabase
      .from('business_settings')
      .select('user_id')
      .eq('slug', slug)
      .single()

    let foundRealServices = false;

    if (tenant) {
      // 2. Busca os serviços reais
      const { data: servs } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', tenant.user_id)
        .order('title')
      
      if (servs && servs.length > 0) {
        setServices(servs)
        foundRealServices = true;
      }
    }

    // 🌟 INJEÇÃO DE MOCK DATA (Para testes de UI) 🌟
    // Se não achou serviços no banco, joga dados falsos bonitos para podermos ver o layout
    if (!foundRealServices) {
      setServices([
        { id: "mock-1", title: "Degradê Navalhado", duration_minutes: 45, price: 55.00 },
        { id: "mock-2", title: "Barboterapia c/ Toalha Quente", duration_minutes: 30, price: 40.00 },
        { id: "mock-3", title: "Combo VIP (Corte + Barba)", duration_minutes: 90, price: 90.00 },
        { id: "mock-4", title: "Acabamento / Pezinho", duration_minutes: 15, price: 20.00 },
      ])
    }

    setIsLoading(false)
  }

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
      router.push(pathname, { scroll: false })
      setReferenceFile(null)
      setPreviewUrl(null)
    }, 400)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Lógica de compressão client-side (ex: browser-image-compression) entraria aqui
      setReferenceFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    const selectedService = services.find(s => s.id === selectedServiceId)
    
    let uploadedImageUrl = null

    // 1. Upload da Foto (Se existir)
    if (referenceFile) {
      const fileExt = referenceFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `references/${fileName}`

      /* // Código pronto para quando habilitar o Storage no Supabase:
      const { data, error } = await supabase.storage
        .from('agendamentos')
        .upload(filePath, referenceFile)
      
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('agendamentos').getPublicUrl(filePath)
        uploadedImageUrl = publicUrl
      }
      */
    }

    // 2. Insert na tabela de Appointments
    const { error } = await supabase.from('appointments').insert({
      client_name: "Cliente Final", // Aqui no futuro virá do Auth do cliente
      service: selectedService?.title,
      time: selectedTime,
      status: 'Confirmado',
      // reference_image: uploadedImageUrl // Quando adicionar a coluna
    })

    setIsSubmitting(false)
    if (!error) {
      updateUrlParams({ step: "5" }) // Vai para a tela de Sucesso
    } else {
      alert("Erro ao agendar. Tente novamente.")
    }
  }

  if (!isBooking && !isVisible) return null

  const renderStepContent = () => {
    if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-semibold text-white tracking-tight mb-6">Qual serviço deseja?</h3>
            <div className="flex flex-col gap-3">
              {services.map(svc => (
                <button 
                  key={svc.id}
                  onClick={() => updateUrlParams({ service: svc.id, step: "2" })}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-left active:scale-[0.98] shadow-[inset_0_0_15px_rgba(255,255,255,0.01)]"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-zinc-50 text-[15px]">{svc.title}</span>
                    <span className="text-xs text-zinc-500">{svc.duration_minutes || 30} min</span>
                  </div>
                  <span className="text-white font-semibold tabular-nums tracking-tighter">
                    R$ {Number(svc.price).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-semibold text-white tracking-tight mb-6">Escolha o especialista</h3>
            <div className="flex flex-col gap-3">
              {mockProfs.map(prof => (
                <button 
                  key={prof.id}
                  onClick={() => updateUrlParams({ prof: prof.id, step: "3" })}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-left active:scale-[0.98]"
                >
                  <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-50 text-[15px]">{prof.name}</span>
                    <span className="text-xs text-zinc-500">{prof.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-xl font-semibold text-white tracking-tight mb-4">Escolha o horário</h3>
            
            {/* Dias - Smart Slots Apple Style */}
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
              {[1, 2, 3, 4].map((day, i) => (
                <button key={i} className={`snap-start shrink-0 flex flex-col items-center justify-center w-[72px] h-[88px] rounded-2xl border transition-all active:scale-[0.96] ${i === 0 ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-black border-cyan-500 shadow-[0_4px_20px_rgba(6,182,212,0.2)]' : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${i === 0 ? 'text-cyan-950' : ''}`}>{i === 0 ? 'Hoje' : 'Qua'}</span>
                  <span className="text-2xl font-bold tracking-tighter">{12 + i}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {mockTimes.map(time => (
                <button 
                  key={time}
                  onClick={() => updateUrlParams({ time, step: "4" })}
                  className="py-3.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-300 font-semibold hover:border-cyan-600 hover:text-white transition-colors active:scale-[0.96]"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )
      case 4:
        const selectedSvc = services.find(s => s.id === selectedServiceId)
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300 pb-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white tracking-tight">Revisar Reserva</h3>
              <p className="text-zinc-500 text-sm mt-1">Quase lá! Confirme os dados.</p>
            </div>

            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5 space-y-4 shadow-[inset_0_0_15px_rgba(255,255,255,0.01)]">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900/50">
                <span className="text-zinc-500 text-sm">Serviço</span>
                <span className="text-white font-medium">{selectedSvc?.title}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900/50">
                <span className="text-zinc-500 text-sm">Data e Hora</span>
                <span className="text-white font-medium">Hoje, {selectedTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Total</span>
                <span className="text-cyan-400 font-semibold">R$ {Number(selectedSvc?.price).toFixed(2)}</span>
              </div>
            </div>

            {/* FOTO DE REFERÊNCIA - UX Premium */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 border-dashed p-1 relative overflow-hidden transition-colors hover:border-zinc-700">
              <input 
                type="file" 
                id="ref-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <label htmlFor="ref-upload" className="flex flex-col items-center justify-center p-6 cursor-pointer">
                {previewUrl ? (
                  <div className="w-full relative">
                    <img src={previewUrl} alt="Referência" className="w-full h-32 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                      <span className="text-white text-sm font-medium flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Trocar Foto</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                      <Camera className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Adicionar foto de referência</span>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Opcional</span>
                  </>
                )}
              </label>
            </div>

            <button 
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="w-full bg-gradient-to-br from-cyan-600 to-cyan-700 text-black py-4 rounded-xl text-[15px] font-semibold shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:scale-[1.01] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Agendamento"}
            </button>
          </div>
        )
      case 5:
        return (
          <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-cyan-900/30 border border-cyan-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white tracking-tight">Tudo Certo!</h3>
            <p className="text-zinc-400 text-sm mt-2 text-center max-w-[250px]">
              Seu horário está garantido. Te esperamos na cadeira.
            </p>
            <button 
              onClick={handleClose}
              className="mt-10 bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-medium border border-zinc-800 active:scale-95 transition-transform"
            >
              Voltar ao Início
            </button>
          </div>
        )
    }
  }

  return (
    <>
      {/* OVERLAY ESCURO */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
      />

      {/* BOTTOM SHEET DE LUXO */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[999] mx-auto max-w-md w-full bg-black border-t border-zinc-900 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col h-[85dvh] ${isVisible ? "translate-y-0" : "translate-y-[100%]"}`}
      >
        {/* DRAG HANDLE */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={handleClose}>
          <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
        </div>

        {/* HEADER DO WIZARD */}
        <div className="px-6 pb-4 pt-2 flex items-center justify-between">
          {currentStep > 1 && currentStep < 5 ? (
            <button onClick={() => updateUrlParams({ step: (currentStep - 1).toString() })} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors active:scale-90">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : <div className="w-10"></div>}
          
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(step => (
               <div key={step} className={`h-1 rounded-full transition-all duration-300 ${step === currentStep ? "w-6 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : step < currentStep ? "w-2 bg-zinc-600" : "w-2 bg-zinc-900"}`} />
            ))}
          </div>

          <button onClick={handleClose} className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors bg-zinc-950 border border-zinc-900 rounded-full active:scale-90">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="p-6 overflow-y-auto no-scrollbar pb-12">
          {renderStepContent()}
        </div>
      </div>
    </>
  )
}