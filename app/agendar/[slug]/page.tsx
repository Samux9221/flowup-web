"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { 
  Scissors, Calendar as CalendarIcon, Clock, User, CheckCircle2, 
  ArrowLeft, Loader2, MessageCircle, Phone, 
  Image as ImageIcon, Package, X, Filter
} from "lucide-react"
import { toast } from "sonner"
// import PremiumBackground from "@/components/PremiumBackground" // Descomente se for usar

// 🔹 CORREÇÃO DE FUSO HORÁRIO PARA O BRASIL 🔹
const getLocalToday = () => {
  const tzOffset = (new Date()).getTimezoneOffset() * 60000
  return (new Date(Date.now() - tzOffset)).toISOString().split("T")[0]
}

// 🔹 FUNÇÕES DE MATEMÁTICA DE TEMPO 🔹
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// 🎨 DICIONÁRIO DE ESTAMPAS (TEXTURAS) 🎨
const themeStyles = {
  liso: {
    background: "bg-zinc-50 dark:bg-zinc-950",
    card: "bg-white border-zinc-200/60 dark:bg-zinc-900 dark:border-white/10 shadow-xl",
    inputBg: "bg-zinc-50 dark:bg-zinc-800",
  },
  ninho: {
    background: "bg-zinc-50 dark:bg-zinc-950 bg-[radial-gradient(#d4d4d8_2px,transparent_2px)] dark:bg-[radial-gradient(#27272a_2px,transparent_2px)] [background-size:24px_24px]",
    card: "bg-white/95 backdrop-blur-xl border-zinc-200/60 dark:bg-zinc-900/95 dark:border-white/10 shadow-2xl",
    inputBg: "bg-white/50 dark:bg-zinc-800/50",
  },
  linhas: {
    background: "bg-zinc-50 dark:bg-zinc-950 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#e4e4e7_8px,#e4e4e7_9px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#27272a_8px,#27272a_9px)]",
    card: "bg-white/95 backdrop-blur-xl border-zinc-200/60 dark:bg-zinc-900/95 dark:border-white/10 shadow-2xl",
    inputBg: "bg-white/50 dark:bg-zinc-800/50",
  },
  grade: {
    background: "bg-zinc-50 dark:bg-zinc-950 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] [background-size:32px_32px]",
    card: "bg-white/95 backdrop-blur-xl border-zinc-200/60 dark:bg-zinc-900/95 dark:border-white/10 shadow-2xl",
    inputBg: "bg-white/50 dark:bg-zinc-800/50",
  }
}

export default function AgendarPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const today = getLocalToday()
  const params = useParams()
  const slug = params.slug as string

  // 🔹 ESTADOS DO FLUXO E DADOS 🔹
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  
  const [settings, setSettings] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  // 🔹 NOVOS ESTADOS: PORTFÓLIO E CATÁLOGO 🔹
  const [photos, setPhotos] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'agendar' | 'portfolio' | 'catalogo'>('agendar')
  const [activePhotoCategory, setActivePhotoCategory] = useState('Todos')
  const [photoCategories, setPhotoCategories] = useState<string[]>(['Todos'])

  // 🔹 ESCOLHAS DO CLIENTE 🔹
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTime, setSelectedTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!slug) return

      // Busca Configurações
      const { data: configData, error: configError } = await supabase
        .from("business_settings")
        .select("*")
        .eq("slug", slug)
        .single()

      if (configError || !configData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setSettings(configData)

      // Busca Serviços
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", configData.user_id)
        .order("title")
        
      if (servicesData) setServices(servicesData)

      // Busca Fotos do Portfólio
      const { data: photosData } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", configData.user_id)
        .order("created_at", { ascending: false })
      
      if (photosData) {
        setPhotos(photosData)
        // Extrai categorias únicas
        const cats = Array.from(new Set(photosData.map((p: any) => p.category)))
        setPhotoCategories(['Todos', ...cats])
      }

      // Busca Produtos
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", configData.user_id)
        .order("created_at", { ascending: false })
      
      if (productsData) setProducts(productsData)

      setIsLoading(false)
    }
    fetchInitialData()
  }, [supabase, slug])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!settings?.user_id) return
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", selectedDate)
        .eq("user_id", settings.user_id)
      if (data) setAppointments(data)
    }
    fetchAppointments()
  }, [selectedDate, supabase, settings])

  const generateTimeSlots = () => {
    if (!settings) return []
    const slots = []
    const start = timeToMinutes(settings.open_time || "08:00")
    const end = timeToMinutes(settings.close_time || "18:00")
    for (let m = start; m <= end; m += 30) slots.push(minutesToTime(m))
    return slots
  }

  const timeSlots = generateTimeSlots()

  const isSlotAvailable = (slotTime: string) => {
    if (!selectedService) return false
    const newApptStart = timeToMinutes(slotTime)
    const newApptEnd = newApptStart + selectedService.duration_minutes

    if (selectedDate === today) {
      const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
      if (newApptStart <= currentMins) return false 
    }

    return !appointments.some(appt => {
      if (appt.status === 'Cancelado') return false
      const apptSvc = services.find(s => s.title === appt.service)
      const apptDuration = apptSvc ? apptSvc.duration_minutes : 30
      const existingStart = timeToMinutes(appt.time)
      const existingEnd = existingStart + apptDuration
      return newApptStart < existingEnd && newApptEnd > existingStart
    })
  }

  const handleBooking = async () => {
    if (!clientName || !clientPhone) {
      toast.error("Por favor, preencha seu nome e WhatsApp.")
      return
    }
    setIsSubmitting(true)
    const { error } = await supabase.from("appointments").insert([{
      user_id: settings.user_id,
      client_name: clientName,
      client_phone: clientPhone,
      service: selectedService.title,
      date: selectedDate,
      time: selectedTime,
      status: "Confirmado"
    }])
    setIsSubmitting(false)
    if (error) {
      toast.error("Erro ao agendar. Tente novamente.")
    } else {
      setStep(4) 
    }
  }

  const openWhatsApp = () => {
    const dataFormatada = selectedDate.split('-').reverse().join('/')
    let template = settings?.whatsapp_message || "Olá, agendei meu horário para {servico} no dia {data} às {hora}. Meu nome é {cliente}."
    const textoFinal = template
      .replace(/{cliente}/g, clientName)
      .replace(/{servico}/g, selectedService?.title)
      .replace(/{data}/g, dataFormatada)
      .replace(/{hora}/g, selectedTime)
      .replace(/{barbearia}/g, settings?.business_name)
    const phone = settings?.whatsapp_number || "5511999999999"
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(textoFinal)}`, '_blank')
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
  if (notFound) return <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 text-center"><Scissors className="h-12 w-12 text-zinc-300 mb-4" /><h1 className="text-xl font-bold text-zinc-900 dark:text-white">Negócio não encontrado</h1></div>

  const brandColor = settings?.primary_color || "#09090b"
  const currentThemeId = (settings?.theme as keyof typeof themeStyles) || "liso"
  const theme = themeStyles[currentThemeId] || themeStyles.liso 

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-500 relative ${theme.background}`}>
      
      {/* 🟢 TELA PRINCIPAL: AGENDAMENTO (WIZARD) */}
      <div className={`pt-8 px-4 sm:pt-12 transition-opacity duration-300 ${activeTab !== 'agendar' ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
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
                  {services.length === 0 ? <p className="text-sm text-center py-4 text-zinc-500">Nenhum serviço cadastrado.</p> : services.map(svc => (
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
                    {timeSlots.map((hour) => {
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
      </div>

      {/* 📸 TELA: PORTFÓLIO (GAVETA / BOTTOM SHEET MENTAL) */}
      {activeTab === 'portfolio' && (
        <div className="absolute inset-0 z-20 pt-8 px-4 pb-24 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Nossos Trabalhos</h2>
              <button onClick={() => setActiveTab('agendar')} className="bg-zinc-200/50 dark:bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            {/* Filtros */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
              {photoCategories.map(cat => (
                <button key={cat} onClick={() => setActivePhotoCategory(cat)} style={activePhotoCategory === cat ? { backgroundColor: brandColor, color: '#fff' } : {}} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${activePhotoCategory !== cat ? 'bg-white text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800' : ''}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {photos.filter(p => activePhotoCategory === 'Todos' || p.category === activePhotoCategory).map(photo => (
                <div key={photo.id} className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm relative group">
                  <img src={photo.url} alt="Trabalho" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute bottom-2 left-2"><span className="text-[10px] font-medium text-white bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">{photo.category}</span></div>
                </div>
              ))}
              {photos.length === 0 && <p className="col-span-2 text-center py-10 text-zinc-400 text-sm">Nenhuma foto adicionada ainda.</p>}
            </div>
          </div>
        </div>
      )}

      {/* 🛍️ TELA: CATÁLOGO */}
      {activeTab === 'catalogo' && (
        <div className="absolute inset-0 z-20 pt-8 px-4 pb-24 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Nossos Produtos</h2>
              <button onClick={() => setActiveTab('agendar')} className="bg-zinc-200/50 dark:bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {products.map(product => (
                <div key={product.id} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                  <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800" />
                  <div className="flex flex-col justify-center flex-1">
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-2">{product.name}</h4>
                    <span className="mt-1 font-bold" style={{ color: brandColor }}>R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="col-span-2 text-center py-10 text-zinc-400 text-sm">Nenhum produto cadastrado.</p>}
            </div>
          </div>
        </div>
      )}

      {/* 📱 MENU NAVEGAÇÃO INFERIOR (PÍLULA FLUTUANTE) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl border border-zinc-200/50 dark:bg-zinc-900/90 dark:border-white/10">
          
          <button 
            onClick={() => setActiveTab('agendar')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === 'agendar' ? 'text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
            style={activeTab === 'agendar' ? { backgroundColor: brandColor } : {}}
          >
            <CalendarIcon className="h-4 w-4" /> <span className="hidden sm:inline">Agendar</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === 'portfolio' ? 'text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
            style={activeTab === 'portfolio' ? { backgroundColor: brandColor } : {}}
          >
            <ImageIcon className="h-4 w-4" /> <span className="hidden sm:inline">Fotos</span>
          </button>

          <button 
            onClick={() => setActiveTab('catalogo')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === 'catalogo' ? 'text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
            style={activeTab === 'catalogo' ? { backgroundColor: brandColor } : {}}
          >
            <Package className="h-4 w-4" /> <span className="hidden sm:inline">Produtos</span>
          </button>

        </div>
      </div>
      
    </div>
  )
}