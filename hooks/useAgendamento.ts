import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

// 🔹 FUNÇÕES DE TEMPO E MATEMÁTICA 🔹
const getLocalToday = () => {
  const tzOffset = (new Date()).getTimezoneOffset() * 60000
  return (new Date(Date.now() - tzOffset)).toISOString().split("T")[0]
}

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
export const themeStyles = {
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

export function useAgendamento(slug: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const today = getLocalToday()

  // 🔹 ESTADOS DO FLUXO E DADOS 🔹
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  
  const [settings, setSettings] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  // 🔹 ESTADOS: PORTFÓLIO E CATÁLOGO 🔹
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

  // Relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Buscar Dados Iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!slug) return

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

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", configData.user_id)
        .order("title")
        
      if (servicesData) setServices(servicesData)

      const { data: photosData } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", configData.user_id)
        .order("created_at", { ascending: false })
      
      if (photosData) {
        setPhotos(photosData)
        const cats = Array.from(new Set(photosData.map((p: any) => p.category)))
        setPhotoCategories(['Todos', ...cats])
      }

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

  // Buscar Agendamentos do dia selecionado
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

  // Lógica de Horários Disponíveis
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

  // Ações
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

  // Helpers de UI
  const brandColor = settings?.primary_color || "#09090b"
  const currentThemeId = (settings?.theme as keyof typeof themeStyles) || "liso"
  const theme = themeStyles[currentThemeId] || themeStyles.liso 

  return {
    state: {
      step, isLoading, isSubmitting, notFound, settings, services, 
      photos, products, activeTab, activePhotoCategory, photoCategories, 
      selectedService, selectedDate, selectedTime, clientName, clientPhone, 
      today, timeSlots, brandColor, theme
    },
    actions: {
      setStep, setActiveTab, setActivePhotoCategory, setSelectedService, 
      setSelectedDate, setSelectedTime, setClientName, setClientPhone, 
      isSlotAvailable, handleBooking, openWhatsApp
    }
  }
}