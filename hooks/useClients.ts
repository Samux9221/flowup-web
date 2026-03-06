"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

export function useClients() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // O Estado Bruto
  const [clients, setClients] = useState<any[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([])

  // 🔹 AS GAVETAS INTELIGENTES (Onde a mágica acontece) 🔹
  const [metrics, setMetrics] = useState({
    total: 0,
    ativos: 0,
    retencao: 0,
    totalFiado: 0
  })

  const [lists, setLists] = useState({
    vips: [] as any[],
    vencidos: [] as any[],
    fiados: [] as any[],
    quaseLa: [] as any[]
  })

  const fetchCRMData = useCallback(async (uid: string) => {
    setIsLoading(true)

    // 1. Busca todos os clientes
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    // 2. Busca todos os agendamentos "Pendentes" (Fiado)
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*, clients(*)')
      .eq('user_id', uid)
      .eq('payment_status', 'PENDENTE') 

    const allClients = clientsData || []
    const allPending = appointmentsData || []

    setClients(allClients)
    setPendingAppointments(allPending)

    // ==========================================
    // 🧠 O MOTOR DE INTELIGÊNCIA ARTIFICIAL DO CRM
    // ==========================================
    
    const today = new Date()
    const fortyFiveDaysAgo = new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // --- CÁLCULO DE MÉTRICAS DO TOPO ---
    const total = allClients.length
    const ativos = allClients.filter(c => c.last_visit && c.last_visit >= fortyFiveDaysAgo).length
    const retencao = total > 0 ? Math.round((ativos / total) * 100) : 0
    const totalFiado = allPending.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0)

    setMetrics({ total, ativos, retencao, totalFiado })

    // --- GAVETA 1: OS REIS DA CADEIRA (VIPs Top 10) ---
    const vips = [...allClients]
      .filter(c => c.total_spent > 0)
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)

    // --- GAVETA 2: CORTES VENCIDOS (Sumidos há mais de 30 dias) ---
    const vencidos = allClients
      .filter(c => c.last_visit && c.last_visit < thirtyDaysAgo)
      .map(c => {
        const diffTime = Math.abs(today.getTime() - new Date(c.last_visit).getTime())
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return { ...c, days_away: days }
      })
      .sort((a, b) => b.days_away - a.days_away)

    // --- GAVETA 3: CADERNETA (Quem deve dinheiro) ---
    // Agrupamos as dívidas por cliente
    const fiadosMap: Record<string, any> = {}
    allPending.forEach(appt => {
      if (appt.client_id) {
        if (!fiadosMap[appt.client_id]) {
          fiadosMap[appt.client_id] = {
            ...appt.clients,
            total_debt: 0,
            pending_count: 0
          }
        }
        fiadosMap[appt.client_id].total_debt += Number(appt.total_price || 0)
        fiadosMap[appt.client_id].pending_count += 1
      }
    })
    const fiados = Object.values(fiadosMap).sort((a: any, b: any) => b.total_debt - a.total_debt)

    // --- GAVETA 4: FIDELIDADE (Quase Lá - 8 ou 9 visitas) ---
    // Considerando um cartão de 10 cortes
    const quaseLa = allClients
      .filter(c => {
        const remainder = c.total_visits % 10
        return remainder === 8 || remainder === 9
      })
      .map(c => ({
        ...c,
        visits_to_reward: 10 - (c.total_visits % 10)
      }))

    setLists({ vips, vencidos, fiados, quaseLa })
    setIsLoading(false)

  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchCRMData(user.id)
      }
    }
    init()
  }, [fetchCRMData, supabase])

  // Ação Rápida: Adicionar Novo Cliente Manualmente
  const addClient = async (payload: any) => {
    if (!userId) return false
    const { data, error } = await supabase.from('clients').insert([{ ...payload, user_id: userId }]).select().single()
    if (error) {
      toast.error("Erro ao cadastrar cliente.")
      return false
    }
    toast.success("Cliente adicionado ao CRM!")
    fetchCRMData(userId) // Recalcula toda a inteligência
    return true
  }

  return {
    state: { isLoading, metrics, lists, clients },
    actions: { addClient, refreshCRM: () => userId && fetchCRMData(userId) }
  }
}