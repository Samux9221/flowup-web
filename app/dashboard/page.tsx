"use client"

import { useCashClosing } from "@/hooks/useCashClosing"
import CashClosingWizard from "./CashClosingWizard"
import { ShieldCheck } from "lucide-react" 
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { DollarSign, Users, Calendar as CalendarIcon, Clock, ArrowRight, AlertCircle, MessageCircle, CreditCard, QrCode, Banknote } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useNiche } from "../contexts/NicheContext"

export default function DashboardPage() {
  const router = useRouter()
  
  const { config } = useNiche()
  const PrimaryIcon = config.icons.primary
  const t = config.theme 

  // 🔹 CONTROLADOR DO FECHAMENTO DE CAIXA
  const cashClosingController = useCashClosing()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [metrics, setMetrics] = useState({
    faturamento: 0,
    agendamentos: 0,
    clientesAtivos: 0
  })
  
  // Novos Estados de Inteligência
  const [paymentStats, setPaymentStats] = useState({ PIX: 0, CARTAO: 0, DINHEIRO: 0 })
  const [atRiskClients, setAtRiskClients] = useState<any[]>([])
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [businessName, setBusinessName] = useState("seu negócio") 
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const todayDate = now.toISOString().split("T")[0]
      
      const startOfMonth = `${year}-${month}-01`
      const endOfMonth = `${year}-${month}-31`

      // Puxando últimos 90 dias para alimentar o Radar de Retenção
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(now.getDate() - 90)
      const ninetyDaysStr = ninetyDaysAgo.toISOString().split("T")[0]

      const { data: settings } = await supabase
        .from("business_settings")
        .select("business_name")
        .eq("user_id", user.id)
        .single()
        
      if (settings?.business_name) {
        setBusinessName(settings.business_name)
      }

      // Buscando agendamentos dos últimos 3 meses
      const { data: allAppointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", ninetyDaysStr)

      if (allAppointments) {
        let totalFaturamento = 0
        let totalAgendamentos = 0
        const clientesUnicos = new Set()
        const proximosHoje: any[] = []
        const currentPaymentStats = { PIX: 0, CARTAO: 0, DINHEIRO: 0 }
        
        // Mapear histórico para encontrar a última visita de cada cliente
        const clientHistory: Record<string, any> = {}

        allAppointments.forEach(appt => {
          // Lógica de Retenção (Apenas confirmados ou finalizados)
          if (appt.status !== 'Cancelado') {
            if (!clientHistory[appt.client_name] || appt.date > clientHistory[appt.client_name].date) {
              clientHistory[appt.client_name] = { date: appt.date, phone: appt.client_phone }
            }
          }

          // Lógica do Mês Atual (Métricas e Financeiro)
          if (appt.date >= startOfMonth && appt.date <= endOfMonth && appt.status !== 'Cancelado') {
            totalAgendamentos++
            clientesUnicos.add(appt.client_name.toLowerCase().trim())

            if (appt.status === 'Finalizado') {
              // Agora usa o total_price real que salvamos no checkout
              const val = Number(appt.total_price || 0)
              totalFaturamento += val
              
              if (appt.payment_method === 'PIX') currentPaymentStats.PIX += val
              if (appt.payment_method === 'CARTAO') currentPaymentStats.CARTAO += val
              if (appt.payment_method === 'DINHEIRO') currentPaymentStats.DINHEIRO += val
            }

            if (appt.date === todayDate && appt.status === 'Confirmado') {
              proximosHoje.push(appt)
            }
          }
        })

        proximosHoje.sort((a, b) => a.time.localeCompare(b.time))

        // Processar Clientes em Risco (Sumidos há mais de 30 dias)
        const atRisk: any[] = []
        const thirtyDaysAgoStr = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

        Object.entries(clientHistory).forEach(([name, data]) => {
          if (data.date < thirtyDaysAgoStr) {
            const diffTime = Math.abs(now.getTime() - new Date(data.date).getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            atRisk.push({ name, lastVisit: data.date, days: diffDays, phone: data.phone })
          }
        })
        
        // Ordenar dos que sumiram há mais tempo para os mais recentes
        atRisk.sort((a, b) => b.days - a.days)

        setMetrics({
          faturamento: totalFaturamento,
          agendamentos: totalAgendamentos,
          clientesAtivos: clientesUnicos.size
        })
        setPaymentStats(currentPaymentStats)
        setUpcomingAppointments(proximosHoje)
        setAtRiskClients(atRisk.slice(0, 5)) // Mostra o Top 5
      }
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [supabase, router])

  // Cálculo para a barra visual de pagamentos
  const totalPagamentos = paymentStats.PIX + paymentStats.CARTAO + paymentStats.DINHEIRO || 1
  const pctPix = (paymentStats.PIX / totalPagamentos) * 100
  const pctCartao = (paymentStats.CARTAO / totalPagamentos) * 100
  const pctDinheiro = (paymentStats.DINHEIRO / totalPagamentos) * 100

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Visão Geral</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Acompanhe o desempenho de <strong className={`font-semibold ${t.textHighlight}`}>{businessName}</strong> este mês.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* BOTÃO MÁGICO DO CAIXA */}
          <button 
            onClick={() => cashClosingController.actions.setIsOpen(true)}
            className={`group flex items-center justify-center gap-2 ${t.radius} border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800/80 active:scale-95`}
          >
            <ShieldCheck className={`h-4 w-4 ${t.textHighlight} transition-transform group-hover:scale-110`} />
            Bater Caixa
          </button>

          {/* 🔹 NOVO BOTÃO DE ACESSO AO FINANCEIRO 🔹 */}
          <Link 
            href="/dashboard/financas" 
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
          >
            Acessar Financeiro
          </Link>
        </div>
      </header>

      {/* CARDS DE MÉTRICAS BÁSICAS */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center ${t.radius} ${t.secondaryBg} ${t.textHighlight} dark:bg-white/10`}>
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Faturamento Mensal</p>
              {isLoading ? (
                <div className={`h-8 w-24 animate-pulse ${t.radius} bg-zinc-200 dark:bg-zinc-800 mt-1`}></div>
              ) : (
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  R$ {metrics.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              )}
            </div>
          </div>
        </div>

        <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center ${t.radius} ${t.secondaryBg} ${t.textHighlight} dark:bg-white/10`}>
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Agendamentos</p>
              {isLoading ? (
                <div className={`h-8 w-16 animate-pulse ${t.radius} bg-zinc-200 dark:bg-zinc-800 mt-1`}></div>
              ) : (
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  {metrics.agendamentos}
                </h3>
              )}
            </div>
          </div>
        </div>

        <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center ${t.radius} ${t.secondaryBg} ${t.textHighlight} dark:bg-white/10`}>
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{config.clientName}s Ativos</p>
              {isLoading ? (
                <div className={`h-8 w-16 animate-pulse ${t.radius} bg-zinc-200 dark:bg-zinc-800 mt-1`}></div>
              ) : (
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  {metrics.clientesAtivos}
                </h3>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* GRÁFICO DE FORMAS DE PAGAMENTO */}
        <div className={`${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 p-6`}>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Divisão de Receitas</h2>
          
          {isLoading ? (
            <div className={`h-32 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>
          ) : metrics.faturamento === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-zinc-400">
              <p className="text-sm font-medium">Nenhum pagamento registrado neste mês.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Barra de Progresso Múltipla Apple Style */}
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div style={{ width: `${pctPix}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                <div style={{ width: `${pctCartao}%` }} className="bg-blue-500 transition-all duration-1000"></div>
                <div style={{ width: `${pctDinheiro}%` }} className="bg-amber-500 transition-all duration-1000"></div>
              </div>

              {/* Legendas */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div> Pix
                  </div>
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    R$ {paymentStats.PIX.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div> Cartão
                  </div>
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    R$ {paymentStats.CARTAO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div> Dinheiro
                  </div>
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                    R$ {paymentStats.DINHEIRO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RADAR DE RETENÇÃO (A Máquina de Vendas) */}
        <div className={`${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 overflow-hidden flex flex-col`}>
          <div className="border-b border-zinc-200/60 px-6 py-5 dark:border-white/5 bg-red-50/50 dark:bg-red-500/5">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Radar de Retenção
            </h2>
            <p className="text-xs text-red-500/80 mt-1 font-medium">
              Clientes que não retornam há mais de 30 dias.
            </p>
          </div>

          <div className="p-0 flex-1 overflow-y-auto max-h-[250px]">
            {isLoading ? (
               <div className="p-6 space-y-3">
                 {[1, 2, 3].map(i => <div key={i} className={`h-12 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>)}
               </div>
            ) : atRiskClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-400">
                <Users className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Excelente retenção!</p>
                <p className="text-xs mt-1">Nenhum cliente sumido recentemente.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-white/5">
                {atRiskClients.map((client, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{client.name}</p>
                      <p className="text-xs font-medium text-red-500 mt-0.5">
                        Ausente há {client.days} dias
                      </p>
                    </div>
                    {client.phone && (
                      <a 
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=Olá ${client.name.split(' ')[0]}! Tudo bem? Faz um tempinho que você não vem aqui na ${businessName}. Que tal agendarmos um horário?`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Chamar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRÓXIMOS ATENDIMENTOS DE HOJE (Mantido abaixo) */}
      <div className={`${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 overflow-hidden`}>
        <div className="border-b border-zinc-200/60 px-6 py-5 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className={`h-5 w-5 ${t.textHighlight}`} /> Hoje na Agenda
          </h2>
          <Link href="/dashboard/agenda" className={`text-sm font-medium ${t.textHighlight} hover:opacity-80 flex items-center gap-1 transition-opacity`}>
            Ver agenda completa <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className={`h-16 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>)}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-zinc-400">
              <p className="text-sm font-medium">Nenhum atendimento pendente hoje.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className={`flex items-center justify-between ${t.radius} border border-zinc-200/60 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900/50`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center ${t.radius} ${t.primaryBg} font-bold text-white shrink-0`}>
                      {appt.time}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{appt.client_name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{appt.service}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RENDERIZAR O WIZARD DE FECHAMENTO AQUI */}
      <CashClosingWizard state={cashClosingController.state} actions={cashClosingController.actions} />

    </div>
  )
}