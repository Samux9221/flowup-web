"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"

// Função auxiliar para converter "14:30" em minutos para facilitar a matemática
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function useTVBoard(slug: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [businessName, setBusinessName] = useState("FlowUp")
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // As duas gavetas da nossa TV
  const [nowServing, setNowServing] = useState<any[]>([])
  const [upNext, setUpNext] = useState<any[]>([])

  // Relógio em tempo real para a TV
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchBoardData = useCallback(async () => {
    // 1. Descobrir o ID da barbearia através do slug
    // Nota: Assumimos que a tabela business_settings tem uma coluna 'slug'.
    // Caso não tenhas, podes usar o próprio user_id no link, mas o slug é mais elegante.
    const { data: settings } = await supabase
      .from("business_settings")
      .select("user_id, business_name")
      .eq("slug", slug) // 🔹 Certifica-te que tens esta coluna na base de dados
      .single()

    if (!settings) {
      setIsLoading(false)
      return
    }

    setBusinessName(settings.business_name || "FlowUp")

    // 2. Buscar agendamentos e serviços para calcular a duração
    const today = new Date()
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
    const todayStr = today.toISOString().split("T")[0]

    const { data: appointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", settings.user_id)
      .eq("date", todayStr)
      .in("status", ["Confirmado", "Em Andamento"]) // Ignora Cancelados e Finalizados

    const { data: services } = await supabase
      .from("services")
      .select("title, duration_minutes")
      .eq("user_id", settings.user_id)

    if (appointments && services) {
      const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes()
      
      const emAtendimento: any[] = []
      const proximos: any[] = []

      appointments.forEach(appt => {
        const startMins = timeToMinutes(appt.time)
        const svc = services.find(s => s.title === appt.service)
        const duration = svc ? svc.duration_minutes : 30
        const endMins = startMins + duration

        // Lógica: Se a hora atual está dentro da janela do serviço, está "Na Cadeira"
        if (nowMins >= startMins && nowMins < endMins) {
          emAtendimento.push(appt)
        } 
        // Se a hora do serviço ainda vai chegar, está nos "Próximos"
        else if (startMins >= nowMins) {
          proximos.push(appt)
        }
      })

      // Ordenar a fila de espera pela hora
      proximos.sort((a, b) => a.time.localeCompare(b.time))

      setNowServing(emAtendimento)
      setUpNext(proximos)
    }
    
    setIsLoading(false)
  }, [slug, supabase, currentTime])

  // Motor de Polling (Atualiza a TV de 30 em 30 segundos)
  useEffect(() => {
    fetchBoardData() // Busca imediata
    const interval = setInterval(() => {
      fetchBoardData()
    }, 30000) 
    return () => clearInterval(interval)
  }, [fetchBoardData])

  return {
    isLoading,
    businessName,
    currentTime,
    nowServing,
    upNext
  }
}