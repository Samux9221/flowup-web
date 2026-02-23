"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Plus, User, Calendar as CalendarIcon, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// 🔹 IMPORTANDO O NOSSO CÉREBRO
import { useNiche } from "../../contexts/NicheContext"

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

export default function AgendaPage() {
  const router = useRouter()
  
  // 🔹 PUXANDO A INTELIGÊNCIA E O DESIGN SYSTEM
  const { config } = useNiche()
  const ServiceIcon = config.icons.service
  const t = config.theme // 🎨 A mágica visual mora aqui

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const today = getLocalToday()
  const [currentTime, setCurrentTime] = useState(new Date())

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
  
  // 🔹 ESTADOS DO FORMULÁRIO E UX
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
        
      if (configData) {
        setSettings(configData)
      }

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId)
        .order("title")
        
      if (servicesData) {
        const onlyServices = servicesData.filter(s => s.type !== 'product')
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

  const resetForm = () => {
    setClientName("")
    setService("")
    setSelectedTime("")
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

  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${t.textHighlight}`} />
        <p>A carregar a agenda...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Agenda</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Gerencie os horários do(a) seu(ua) <span className={`font-bold ${t.textHighlight}`}>{config.title.toLowerCase()}</span> com precisão.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <CalendarIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full sm:w-auto cursor-pointer ${t.radius} border border-zinc-200/60 bg-white py-2.5 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
            />
          </div>

          {/* 🔹 BOTÃO NOVA RESERVA: Premium e Dinâmico */}
          <button 
            onClick={() => { resetForm(); setIsSheetOpen(true); }}
            className={`w-full sm:w-auto group flex items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-${t.primaryBg}/20 transition-all active:scale-95`}
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Nova Reserva
          </button>
        </div>
      </header>

      <div className="relative rounded-3xl border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10">
        <div className="absolute bottom-10 left-[75px] top-10 hidden w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent dark:via-zinc-800 sm:block"></div>

        <div className="space-y-6">
          {timelineBlocks.map((block) => {
            if (block.type === 'appointment') {
              const { hour, appointment, duration } = block
              const isLongService = duration && duration > 30

              return (
                <div key={hour} className="group relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 pt-2">
                  <div className="flex sm:w-16 shrink-0 items-center sm:justify-end mt-4">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{hour}</span>
                  </div>
                  
                  {/* 🔹 PONTO NA TIMELINE COM A COR DA MARCA */}
                  <div className={`hidden h-3 w-3 rounded-full ${t.primaryBg} ring-4 ring-white transition-all group-hover:scale-125 dark:ring-zinc-950 sm:block z-10 mt-4`}></div>
                  
                  <div className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between ${t.radius} border ${isLongService ? 'border-zinc-300 shadow-md' : 'border-zinc-200/60 shadow-sm'} bg-white p-5 transition-all hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900/80 gap-4`}>
                    
                    <div className="flex items-center gap-4">
                      {/* 🔹 AVATAR DO CLIENTE COM A COR DA MARCA */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${t.primaryBg} font-bold text-white shrink-0 shadow-inner`}>
                        {appointment.client_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{appointment.client_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{appointment.service}</p>
                          <span className="flex items-center text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md dark:bg-zinc-800">
                            <Clock className="w-3 h-3 mr-1" /> {duration} min
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                            appointment.status === 'Finalizado' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {appointment.status === 'Confirmado' && (
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'Finalizado')}
                          className="flex-1 sm:flex-none rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        >
                          Finalizar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(appointment.id, 'Cancelado')}
                          className="flex-1 sm:flex-none rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            } else {
              return (
                <div key={block.hour} className="group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex sm:w-16 shrink-0 items-center sm:justify-end">
                    <span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">{block.hour}</span>
                  </div>
                  <div className="hidden h-2 w-2 rounded-full bg-zinc-200 ring-4 ring-white transition-all group-hover:bg-zinc-400 dark:bg-zinc-800 dark:ring-zinc-950 sm:block z-10"></div>
                  
                  <div className="flex-1">
                    <button 
                      onClick={() => {
                        resetForm() 
                        setSelectedTime(block.hour) 
                        setIsSheetOpen(true) 
                      }}
                      className={`flex h-[48px] w-full items-center ${t.radius} border-2 border-dashed border-transparent bg-transparent px-4 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 hover:${t.textHighlight} dark:hover:border-zinc-700 dark:hover:bg-zinc-900/30`}
                    >
                      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus className="mr-2 h-4 w-4" /> Agendar às {block.hour}
                      </div>
                    </button>
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>

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
                  <User className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400`} />
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
                    {availableServices.map((svc) => (
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
                    {timeSlots.map((hour) => {
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

    </div>
  )
}