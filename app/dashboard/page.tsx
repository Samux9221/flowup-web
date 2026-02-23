"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { DollarSign, Users, Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// 🔹 IMPORTANDO O NOSSO CÉREBRO
import { useNiche } from "../contexts/NicheContext"

export default function DashboardPage() {
  const router = useRouter()
  
  // 🔹 PUXANDO A INTELIGÊNCIA DO NICHO (Agora com o Tema!)
  const { config } = useNiche()
  const PrimaryIcon = config.icons.primary
  const t = config.theme // Atalho para o tema para manter o código limpo

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [metrics, setMetrics] = useState({
    faturamento: 0,
    agendamentos: 0,
    clientesAtivos: 0
  })
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

      const { data: settings } = await supabase
        .from("business_settings")
        .select("business_name")
        .eq("user_id", user.id)
        .single()
        
      if (settings?.business_name) {
        setBusinessName(settings.business_name)
      }

      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)

      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)

      if (appointments && services) {
        let totalFaturamento = 0
        let totalAgendamentos = 0
        const clientesUnicos = new Set()
        const proximosHoje: any[] = []

        appointments.forEach(appt => {
          if (appt.status !== 'Cancelado') {
            totalAgendamentos++
            clientesUnicos.add(appt.client_name.toLowerCase().trim())

            if (appt.status === 'Finalizado') {
              const svc = services.find(s => s.title === appt.service)
              if (svc) {
                totalFaturamento += Number(svc.price)
              }
            }

            if (appt.date === todayDate && appt.status === 'Confirmado') {
              proximosHoje.push(appt)
            }
          }
        })

        proximosHoje.sort((a, b) => a.time.localeCompare(b.time))

        setMetrics({
          faturamento: totalFaturamento,
          agendamentos: totalAgendamentos,
          clientesAtivos: clientesUnicos.size
        })
        setUpcomingAppointments(proximosHoje)
      }
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [supabase, router])

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Visão Geral</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Acompanhe o desempenho de <strong className={`font-semibold ${t.textHighlight}`}>{businessName}</strong> este mês.
        </p>
      </header>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Usando o t.radius para bordas dinâmicas */}
        <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
          <div className="flex items-center gap-4">
            {/* Usando as cores secundárias e de texto do nicho */}
            <div className={`flex h-12 w-12 items-center justify-center ${t.radius} ${t.secondaryBg} ${t.textHighlight} dark:bg-white/10`}>
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Faturamento Real</p>
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
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Agendamentos (Mês)</p>
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

      {/* PRÓXIMOS ATENDIMENTOS DE HOJE */}
      <div className={`${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 overflow-hidden`}>
        <div className="border-b border-zinc-200/60 px-6 py-5 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className={`h-5 w-5 ${t.textHighlight}`} /> Próximos Atendimentos (Hoje)
          </h2>
          <Link href="/dashboard/agenda" className={`text-sm font-medium ${t.textHighlight} hover:opacity-80 flex items-center gap-1 transition-opacity`}>
            Ver agenda <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className={`h-16 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 text-center">
              <PrimaryIcon className={`h-10 w-10 mb-3 opacity-20 ${t.textHighlight}`} />
              <p className="text-base font-medium text-zinc-600 dark:text-zinc-300">Nenhum atendimento pendente para hoje.</p>
              <p className="text-sm mt-1">Aproveite para organizar o espaço ou divulgar seu link! 🚀</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className={`flex items-center justify-between ${t.radius} border border-zinc-200/60 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 dark:border-white/5 dark:bg-zinc-900/50`}>
                  <div className="flex items-center gap-4">
                    {/* Fundo primário dinâmico na pílula do horário */}
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
    </div>
  )
}