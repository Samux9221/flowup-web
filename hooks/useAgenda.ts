"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useNiche } from "../app/contexts/NicheContext"

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

const getLocalToday = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split("T")[0]
}

export function useAgenda() {
  const router = useRouter()
  
  const { config } = useNiche()
  const ServiceIcon = config.icons.service
  const t = config.theme 

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
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  
  const [professionals, setProfessionals] = useState<any[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>("")
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [service, setService] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [checkoutAppt, setCheckoutAppt] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUserId(user.id)
    }
    getUser()
  }, [supabase, router])

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setIsLoading(true)

      const { data: configData } = await supabase.from("business_settings").select("*").eq("user_id", userId).single()
      if (configData) setSettings(configData)

      const { data: servicesData } = await supabase.from("services").select("*").eq("user_id", userId).order("title")
      if (servicesData) {
        setAvailableServices(servicesData.filter((s: any) => s.type !== 'product'))
        setAvailableProducts(servicesData.filter((s: any) => s.type === 'product'))
      }

      const { data: apptData } = await supabase.from("appointments").select("*").eq("date", selectedDate).eq("user_id", userId)
      if (apptData) setAppointments(apptData)

      const { data: profsData } = await supabase.from("professionals").select('*, commission_rules(*)').eq("user_id", userId).eq("is_active", true)
      if (profsData) setProfessionals(profsData)

      setIsLoading(false)
    }

    fetchData()
  }, [selectedDate, userId, supabase])

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
    setClientName(""); setService(""); setSelectedTime(""); setSelectedProfessional(""); 
  }

  const handleSaveAppointment = async () => {
    if (!clientName || !service || !selectedTime) return toast.error("Preencha todos os campos!")
    if (!userId) return
    setIsSaving(true)

    const { error } = await supabase.from("appointments").insert([{
      user_id: userId, client_name: clientName, service: service,
      date: selectedDate, time: selectedTime, status: "Confirmado",
      professional_id: selectedProfessional || null
    }])
    
    setIsSaving(false)

    if (error) toast.error("Erro ao guardar: " + error.message)
    else {
      toast.success("Reserva confirmada com sucesso! 🎉")
      resetForm()
      setIsSheetOpen(false) 
      const { data } = await supabase.from("appointments").select("*").eq("date", selectedDate).eq("user_id", userId)
      if (data) setAppointments(data)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id).eq("user_id", userId)
    if (error) toast.error("Erro ao atualizar: " + error.message)
    else {
      toast.success(newStatus === 'Cancelado' ? "Marcação cancelada." : "Atendimento atualizado!")
      const { data } = await supabase.from("appointments").select("*").eq("date", selectedDate).eq("user_id", userId)
      if (data) setAppointments(data)
    }
  }

  const handleCheckout = async (id: number, servicePrice: number, productsPrice: number, paymentMethod: string, professionalId: string | null) => {
    setIsSaving(true)

    const finalPrice = servicePrice + productsPrice
    const TAXA_CARTAO_PERCENT = 0.05 
    const feeAmount = paymentMethod === 'CARTAO' ? (finalPrice * TAXA_CARTAO_PERCENT) : 0
    const liquidTotal = finalPrice - feeAmount

    let commissionAmount = 0
    let profName = ""

    if (professionalId) {
      const prof = professionals.find(p => p.id === professionalId)
      profName = prof?.name || ""
      
      const serviceRule = prof?.commission_rules?.find((r: any) => r.item_type === 'SERVICE')
      const productRule = prof?.commission_rules?.find((r: any) => r.item_type === 'PRODUCT')

      if (serviceRule && servicePrice > 0) {
        const baseService = (serviceRule.discount_fees_first && paymentMethod === 'CARTAO') ? servicePrice * (1 - TAXA_CARTAO_PERCENT) : servicePrice
        commissionAmount += serviceRule.commission_type === 'PERCENTAGE' ? baseService * (serviceRule.commission_value / 100) : serviceRule.commission_value
      }

      if (productRule && productsPrice > 0) {
        const baseProduct = (productRule.discount_fees_first && paymentMethod === 'CARTAO') ? productsPrice * (1 - TAXA_CARTAO_PERCENT) : productsPrice
        commissionAmount += baseProduct * (productRule.commission_value / 100)
      }
    }

    const { error: apptError } = await supabase.from("appointments").update({ 
      status: 'Finalizado', total_price: finalPrice, payment_status: 'PAGO', payment_method: paymentMethod, professional_id: professionalId || null
    }).eq("id", id).eq("user_id", userId)

    if (apptError) {
      toast.error("Erro ao finalizar na agenda.")
      setIsSaving(false)
      return
    }

    const descriptionText = checkoutAppt ? `Atendimento: ${checkoutAppt.client_name}` : "Atendimento"
    
    // 🔹 A MÁGICA DA ARQUITETURA ESTÁ AQUI: Integração direta e classificada no Caixa B2B
    await supabase.from("transactions").insert([{
      user_id: userId, 
      appointment_id: id, 
      type: 'INCOME', 
      category: 'Serviços e Vendas', 
      amount: liquidTotal,
      description: profName ? `${descriptionText} - ${profName}` : descriptionText,
      payment_method: paymentMethod, 
      status: 'PAGO', 
      date: selectedDate,
      due_date: selectedDate 
    }])

    if (professionalId && commissionAmount > 0) {
      await supabase.from("commission_ledger").insert([{
        professional_id: professionalId, appointment_id: id, type: 'CREDIT', amount: commissionAmount,
        description: `Comissão: ${checkoutAppt?.service || 'Serviço'} + Vendas`
      }])
    }

    setIsSaving(false)
    toast.success("Cálculos efetuados e caixa atualizado! 💎")
    setCheckoutAppt(null)
    
    const { data } = await supabase.from("appointments").select("*").eq("date", selectedDate).eq("user_id", userId)
    if (data) setAppointments(data)
  }

  const selectedSvcObj = availableServices.find(s => s.title === service)
  const selectedDuration = selectedSvcObj ? selectedSvcObj.duration_minutes : 30

  const isSlotAvailable = (slotTime: string) => {
    const newApptStart = timeToMinutes(slotTime)
    const newApptEnd = newApptStart + selectedDuration
    if (selectedDate === today) {
      const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
      if (newApptStart <= currentMins) return false 
    }
    return !appointments.some(appt => {
      if (appt.status === 'Cancelado') return false
      if (selectedProfessional && appt.professional_id && appt.professional_id !== selectedProfessional) return false
      
      const apptSvc = availableServices.find(s => s.title === appt.service)
      const apptDuration = apptSvc ? apptSvc.duration_minutes : 30
      const existingStart = timeToMinutes(appt.time)
      const existingEnd = existingStart + apptDuration
      return newApptStart < existingEnd && newApptEnd > existingStart
    })
  }

  const renderTimelineBlocks = () => {
    const blocks: { type: string; hour: string; appointment?: any; duration?: number; professional?: any }[] = []
    let skipUntil = 0
    timeSlots.forEach(hour => {
      const currentMins = timeToMinutes(hour)
      if (currentMins < skipUntil) return
      const appointment = appointments.find(a => a.time === hour && a.status !== 'Cancelado')
      
      if (appointment) {
        const svc = availableServices.find(s => s.title === appointment.service)
        const duration = svc ? svc.duration_minutes : 30
        const prof = professionals.find(p => p.id === appointment.professional_id)
        skipUntil = currentMins + duration
        blocks.push({ type: 'appointment', hour, appointment, duration, professional: prof })
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
      availableServices, availableProducts, professionals,
      selectedProfessional, isSheetOpen, clientName, service, selectedTime, 
      isSaving, config, ServiceIcon, t, checkoutAppt 
    },
    actions: {
      setSelectedDate, setIsSheetOpen, setClientName, setService, setSelectedTime, handleSaveAppointment, handleUpdateStatus,
      resetForm, isSlotAvailable, setSelectedProfessional, setCheckoutAppt, handleCheckout
    }
  }
}