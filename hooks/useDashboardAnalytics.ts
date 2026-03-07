"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function useDashboardAnalytics(startDate: string, endDate: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  
  const [dre, setDre] = useState({ bruto: 0, taxas: 0, despesas: 0, comissoes: 0, liquido: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [barberRanking, setBarberRanking] = useState<any[]>([])
  const [rawAppointments, setRawAppointments] = useState<any[]>([]) 
  const [details, setDetails] = useState<{ expenses: any[], commissions: any[], cardFees: any[] }>({ expenses: [], commissions: [], cardFees: [] })
  
  // 🔹 NOVOS DADOS DE INTELIGÊNCIA 🔹
  const [topServices, setTopServices] = useState<any[]>([])
  const [paymentMix, setPaymentMix] = useState<any[]>([])

  const fetchAnalytics = useCallback(async () => {
    if (!startDate || !endDate) return
    setIsLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: appointments } = await supabase
      .from("appointments")
      .select("*, professionals(name)")
      .eq("user_id", user.id)
      .eq("status", "Finalizado")
      .eq("payment_status", "PAGO")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    const { data: expenses } = await supabase
      .from("transactions")
      .select("amount, date, description")
      .eq("user_id", user.id)
      .eq("type", "EXPENSE")
      .gte("date", startDate)
      .lte("date", endDate)

    const { data: commissions } = await supabase
      .from("commission_ledger")
      .select("amount, professional_id, professionals(name), created_at")
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)

    if (appointments) {
      setRawAppointments(appointments)

      let bruto = 0
      let taxas = 0
      const cardFeesList: any = [] 
      const profMap: Record<string, { nome: string, faturamento: number, cortes: number, comissao: number }> = {}
      
      // Mapas para os novos gráficos
      const serviceMap: Record<string, number> = {}
      const paymentMap: Record<string, number> = { 'PIX': 0, 'CARTAO': 0, 'DINHEIRO': 0 }

      // 🔹 NOVO: PREENCHE TODOS OS DIAS DO PERÍODO COM ZERO 🔹
      // Isso cria os "vales" (quedas) no gráfico nos dias sem movimento
      const dailyMap: Record<string, { faturamento: number }> = {}
      const start = new Date(`${startDate}T12:00:00Z`)
      const end = new Date(`${endDate}T12:00:00Z`)
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const diaStr = String(d.getUTCDate()).padStart(2, '0')
        const mesStr = String(d.getUTCMonth() + 1).padStart(2, '0')
        dailyMap[`${diaStr}/${mesStr}`] = { faturamento: 0 }
      }

      appointments.forEach((appt: any) => {
        const valor = Number(appt.total_price || 0)
        bruto += valor

        // Taxas e Pagamentos
        const method = appt.payment_method || 'DINHEIRO'
        if (paymentMap[method] !== undefined) paymentMap[method] += valor
        
        if (method === 'CARTAO') {
          const taxaAppt = valor * 0.05
          taxas += taxaAppt
          cardFeesList.push({ ...appt, feeValue: taxaAppt })
        }

        // 🔹 Faturamento Diário (Soma no dia correto do mapa que já criamos) 🔹
        const dia = appt.date.split('-').reverse().slice(0, 2).join('/')
        if (dailyMap[dia]) {
          dailyMap[dia].faturamento += valor
        } else {
          dailyMap[dia] = { faturamento: valor } // Prevenção caso uma data fuja do padrão
        }

        // Curva ABC (Serviços)
        const srv = appt.service || 'Outros'
        if (!serviceMap[srv]) serviceMap[srv] = 0
        serviceMap[srv] += valor

        // Ranking Profissionais
        const profId = appt.professional_id
        if (profId) {
          if (!profMap[profId]) profMap[profId] = { nome: appt.professionals?.name || "Desconhecido", faturamento: 0, cortes: 0, comissao: 0 }
          profMap[profId].faturamento += valor
          profMap[profId].cortes += 1
        }
      })

      // 🔹 O FILTRO ANTI COBRANÇA DUPLA 🔹
      const filteredExpenses: any = []
      let despesas = 0
      if (expenses) {
        expenses.forEach((curr: any) => {
          const desc = (curr.description || "").toLowerCase()
          // Se for acerto de barbeiro, IGNORA (pois já entra no Custo de Equipe)
          const isAcerto = desc.includes("comissão") || desc.includes("comissao") || desc.includes("acerto") || desc.includes("pagamento")
          
          if (!isAcerto) {
            despesas += Number(curr.amount)
            filteredExpenses.push(curr)
          }
        })
      }

      let totalComissoes = 0
      if (commissions) {
        commissions.forEach((c: any) => {
          totalComissoes += Number(c.amount)
          if (c.professional_id && profMap[c.professional_id]) {
            profMap[c.professional_id].comissao += Number(c.amount)
          }
        })
      }

      // Formatando Top Serviços (Curva ABC)
      const formattedServices = Object.keys(serviceMap)
        .map(name => ({ name, value: serviceMap[name], percent: bruto > 0 ? (serviceMap[name] / bruto) * 100 : 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4) // Pega apenas os Top 4 para não poluir

      // Formatando Mix de Pagamentos
      const formattedPayments = [
        { name: 'Pix', value: paymentMap['PIX'], color: '#10b981' },
        { name: 'Cartão', value: paymentMap['CARTAO'], color: '#6366f1' },
        { name: 'Dinheiro', value: paymentMap['DINHEIRO'], color: '#f59e0b' }
      ].filter(p => p.value > 0)

      setDre({ bruto, taxas, despesas, comissoes: totalComissoes, liquido: bruto - taxas - despesas - totalComissoes })
      setDetails({ expenses: filteredExpenses, commissions: commissions || [], cardFees: cardFeesList })
      
      // Mapeia de volta para o formato do Recharts
      setChartData(Object.keys(dailyMap).map(dia => ({ dia, faturamento: dailyMap[dia].faturamento })))
      setBarberRanking(Object.values(profMap).sort((a, b) => b.faturamento - a.faturamento))
      setTopServices(formattedServices)
      setPaymentMix(formattedPayments)
    }

    setIsLoading(false)
  }, [supabase, startDate, endDate])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  return { isLoading, dre, chartData, barberRanking, rawAppointments, details, topServices, paymentMix }
}