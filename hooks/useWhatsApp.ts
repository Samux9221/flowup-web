"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function useWhatsApp() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [automations, setAutomations] = useState({
    reminder_active: false, reminder_text: "",
    review_active: false, review_text: "",
    return_active: false, return_text: "",
    recovery_active: false, recovery_text: ""
  })

  // 🔹 NOVA ÁREA: O MOTOR DE INTELIGÊNCIA DO RADAR 🔹
  const [radarData, setRadarData] = useState<{ recovery: any[], returnList: any[] }>({ recovery: [], returnList: [] })

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Busca as Configurações do Robô
    const { data: configData, error: configError } = await supabase
      .from("whatsapp_automations")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (configData) {
      setAutomations(configData)
    } else if (configError && configError.code === 'PGRST116') {
      const { data: newData } = await supabase.from("whatsapp_automations").insert({ user_id: user.id }).select().single()
      if (newData) setAutomations(newData)
    }

    // 2. Busca o Histórico de Agendamentos para o Radar (Dados Reais)
    const { data: appointments } = await supabase
      .from("appointments")
      .select("client_name, client_phone, date, status, professionals(name)")
      .eq("user_id", user.id)

    if (appointments) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const clientMap = new Map()

      // Agrupa os agendamentos por cliente (usando o telefone como ID único)
      appointments.forEach((appt: any) => {
        if (!appt.client_phone) return // Sem telefone não dá para mandar WhatsApp
        const phone = appt.client_phone.replace(/\D/g, '') // Limpa a formatação
        if (!clientMap.has(phone)) clientMap.set(phone, { appointments: [] })
        clientMap.get(phone).appointments.push(appt)
      })

      const recovery: any[] = []
      const returnList: any[] = []

      clientMap.forEach((data, phone) => {
        // Regra de Ouro: Se o cliente tem um agendamento no futuro, ignoramos. Ele não está "perdido".
        const hasFutureAppt = data.appointments.some((a: any) => {
          const apptDate = new Date(a.date + 'T12:00:00Z')
          return apptDate >= today && a.status !== 'Cancelado'
        })
        if (hasFutureAppt) return

        // Pega apenas agendamentos do passado finalizados
        const pastAppts = data.appointments.filter((a: any) => {
          const apptDate = new Date(a.date + 'T12:00:00Z')
          return apptDate < today && a.status === 'Finalizado'
        })
        
        if (pastAppts.length === 0) return

        // Encontra o corte mais recente
        pastAppts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const latest = pastAppts[0]

        // Calcula a diferença em dias
        const diffTime = Math.abs(today.getTime() - new Date(latest.date + 'T12:00:00Z').getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const clientObj = {
          id: phone,
          name: latest.client_name,
          phone: phone, // Já limpo só com números
          lastVisit: latest.date.split('-').reverse().join('/'),
          daysAway: diffDays,
          barber: latest.professionals?.name || 'Equipe'
        }

        // Separa nas listas cirúrgicas
        if (diffDays >= 45) recovery.push(clientObj)
        else if (diffDays >= 20 && diffDays < 45) returnList.push(clientObj)
      })

      // Ordena quem está há mais tempo sem vir primeiro
      recovery.sort((a, b) => b.daysAway - a.daysAway)
      returnList.sort((a, b) => b.daysAway - a.daysAway)

      setRadarData({ recovery, returnList })
    }
    
    setIsLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const saveAutomations = async (currentAutomations: any) => {
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from("whatsapp_automations")
      .update({
        reminder_active: currentAutomations.reminder_active,
        reminder_text: currentAutomations.reminder_text,
        review_active: currentAutomations.review_active,
        review_text: currentAutomations.review_text,
        return_active: currentAutomations.return_active,
        return_text: currentAutomations.return_text,
        recovery_active: currentAutomations.recovery_active,
        recovery_text: currentAutomations.recovery_text,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)

    setIsSaving(false)
    return !error
  }

  return { isLoading, isSaving, automations, setAutomations, saveAutomations, radarData }
}