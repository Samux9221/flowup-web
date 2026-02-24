import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// IMPORTANDO O NOSSO CÉREBRO
import { useNiche } from "../app/contexts/NicheContext"

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

// 🔹 CORREÇÃO DE FUSO HORÁRIO PARA O BRASIL 🔹
const getLocalToday = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split("T")[0]
}

export function useAgenda() {
  const router = useRouter()
  
  // PUXANDO A INTELIGÊNCIA E O DESIGN SYSTEM
  const { config } = useNiche()
  const ServiceIcon = config.icons.service
  const t = config.theme 

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const today = getLocalToday()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer) 
  }, [])

  const [userId, setUserId] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>(null)
  
  const [selectedDate, setSelectedDate] = useState(today)
  const [appointments, setAppointments] = useState<any[]>([])
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // ESTADOS DO FORMULÁRIO E UX
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [service, setService] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 1️⃣ Descobrir quem está logado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase, router])

  // 2️⃣ Buscar Configurações, Serviços (Filtrados) e Agendamentos
  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setIsLoading(true)

      const { data: configData } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", userId)
        .single()
        
      if (configData) setSettings(configData)

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId)
        .order("title")
        
      if (servicesData) {
        const onlyServices = servicesData.filter((s: any) => s.type !== 'product')
        setAvailableServices(onlyServices)
      }

      const { data: apptData } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", selectedDate)
        .eq("user_id", userId)
      
      if (apptData) setAppointments(apptData)
      setIsLoading(false)
    }

    fetchData()
  }, [selectedDate, userId, supabase])


  // 🎓 GERADOR DE HORÁRIOS ELÁSTICO E DINÂMICO
  const generateTimeSlots = () => {
    if (!settings) return []

    let startMins = timeToMinutes(settings.open_time || "08:00")
    let endMins = timeToMinutes(settings.close_time || "18:00")
    const interval = settings.slot_interval || 30 

    appointments.forEach(appt => {
      if (appt.status !== 'Cancelado') {
        const apptStart = timeToMinutes(appt.time)
        const svc = availableServices.find(s => s.title === appt.service)
        const duration = svc ? svc.duration_minutes : 30
        const apptEnd = apptStart + duration

        if (apptStart < startMins) startMins = apptStart 
        if (apptEnd > endMins) endMins = apptEnd      
      }
    })

    const slots = []
    for (let m = startMins; m <= endMins; m += interval) {
      slots.push(minutesToTime(m))
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const resetForm = () => {
    setClientName("")
    setService("")
    setSelectedTime("")
  }

  const handleSaveAppointment = async () => {
    if (!clientName || !service || !selectedTime) {
      toast.error("Preencha todos os campos!")
      return
    }

    if (!userId) return
    setIsSaving(true)

    const { error } = await supabase.from("appointments").insert([
      {
        user_id: userId,
        client_name: clientName,
        service: service,
        date: selectedDate,
        time: selectedTime,
        status: "Confirmado"
      }
    ])

    setIsSaving(false)

    if (error) {
      toast.error("Erro ao guardar: " + error.message)
    } else {
      toast.success("Reserva confirmada com sucesso! 🎉")
      resetForm()
      setIsSheetOpen(false) 
      
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", selectedDate)
        .eq("user_id", userId)
      if (data) setAppointments(data)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      toast.error("Erro ao atualizar: " + error.message)
    } else {
      toast.success(newStatus === 'Cancelado' ? "Marcação cancelada. Horário livre!" : "Atendimento finalizado com sucesso!")
      
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", selectedDate)
        .eq("user_id", userId)
      if (data) setAppointments(data)
    }
  }

  // 🔹 LÓGICA DE SOBREPOSIÇÃO E MÁQUINA DO TEMPO (BLOCKING) 🔹
  const selectedSvcObj = availableServices.find(s => s.title === service)
  const selectedDuration = selectedSvcObj ? selectedSvcObj.duration_minutes : 30

  const isSlotAvailable = (slotTime: string) => {
    const newApptStart = timeToMinutes(slotTime)
    const newApptEnd = newApptStart + selectedDuration

    if (selectedDate === today) {
      const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
      if (newApptStart <= currentMins) {
        return false 
      }
    }

    return !appointments.some(appt => {
      if (appt.status === 'Cancelado') return false
      
      const apptSvc = availableServices.find(s => s.title === appt.service)
      const apptDuration = apptSvc ? apptSvc.duration_minutes : 30
      
      const existingStart = timeToMinutes(appt.time)
      const existingEnd = existingStart + apptDuration

      return newApptStart < existingEnd && newApptEnd > existingStart
    })
  }

  const renderTimelineBlocks = () => {
    const blocks: { type: string; hour: string; appointment?: any; duration?: number }[] = []
    let skipUntil = 0

    timeSlots.forEach(hour => {
      const currentMins = timeToMinutes(hour)
      
      if (currentMins < skipUntil) return

      const appointment = appointments.find(a => a.time === hour && a.status !== 'Cancelado')

      if (appointment) {
        const svc = availableServices.find(s => s.title === appointment.service)
        const duration = svc ? svc.duration_minutes : 30
        
        skipUntil = currentMins + duration
        blocks.push({ type: 'appointment', hour, appointment, duration })
      } else {
        blocks.push({ type: 'free', hour })
      }
    })

    return blocks
  }

  const timelineBlocks = renderTimelineBlocks()

  return {
    state: {
      userId, isLoading, appointments, selectedDate, timeSlots, timelineBlocks,
      availableServices, isSheetOpen, clientName, service, selectedTime,
      isSaving, config, ServiceIcon, t
    },
    actions: {
      setSelectedDate, setIsSheetOpen, setClientName, setService,
      setSelectedTime, handleSaveAppointment, handleUpdateStatus,
      resetForm, isSlotAvailable
    }
  }
}