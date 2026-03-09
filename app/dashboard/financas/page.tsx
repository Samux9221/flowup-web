"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { 
  ArrowDownRight, ArrowUpRight, Wallet, Plus, Receipt, Users, 
  CheckCircle2, Clock, Trash2, AlertCircle, PieChart as PieChartIcon, 
  CalendarDays, ChevronRight
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { toast } from "sonner"

import { useNiche } from "../../contexts/NicheContext"
import ExpenseDialog from "@/components/financas/ExpenseDialog"
import CommissionDialog from "@/components/financas/CommissionDialog"

// Paleta corporativa para o Gráfico de Categorias
const CATEGORY_COLORS: Record<string, string> = {
  'Custo Fixo': '#6366f1', // Indigo
  'Insumos': '#f59e0b', // Amber
  'Marketing': '#ec4899', // Pink
  'Folha e Comissões': '#10b981', // Emerald
  'Impostos/Taxas': '#ef4444', // Red
  'Outros': '#9ca3af' // Gray
}

export default function FinancasPage() {
  const { config } = useNiche()
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Estados do Caixa e Lançamentos
  const [transactions, setTransactions] = useState<any[]>([])
  const [filter, setFilter] = useState<'ALL' | 'LATE' | 'TODAY' | 'NEXT_7' | 'PAID'>('ALL')
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)

  // Estados da Equipe
  const [professionals, setProfessionals] = useState<any[]>([])
  const [selectedProf, setSelectedProf] = useState<any>(null)

  const fetchFinances = useCallback(async (uid: string) => {
    setIsLoading(true)
    const now = new Date()
    // Pega o início do mês atual para o escopo principal
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // 1. Busca Transações (Incluindo contas a pagar futuras)
    const { data: txns } = await supabase
      .from("transactions")
      .select(`*`)
      .eq("user_id", uid)
      .order("due_date", { ascending: true })

    if (txns) {
      setTransactions(txns)
    }

    // 2. Busca Equipe e Calcula Saldos em Tempo Real (Ledger)
    const { data: profs } = await supabase.from("professionals").select("*").eq("user_id", uid)
    
    if (profs && profs.length > 0) {
      const profIds = profs.map(p => p.id)
      const { data: ledgers } = await supabase.from("commission_ledger").select("*").in("professional_id", profIds)
      
      const profsWithBalance = profs.map(p => {
        const myLedgers = ledgers?.filter(l => l.professional_id === p.id) || []
        let balance = 0
        myLedgers.forEach(l => {
          if (l.type === 'CREDIT') balance += Number(l.amount)
          if (l.type === 'DEBIT') balance -= Number(l.amount) // Vales e Acertos
        })
        return { ...p, balance }
      })
      
      setProfessionals(profsWithBalance)
    } else {
      setProfessionals([])
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchFinances(user.id)
      }
    }
    init()
  }, [fetchFinances, supabase])

  // ========================================================================
  // INTELIGÊNCIA DE DADOS (MEMOIZADA PARA PERFORMANCE)
  // ========================================================================
  
  const todayStr = new Date().toISOString().split('T')[0]
  const next7Days = new Date()
  next7Days.setDate(next7Days.getDate() + 7)
  const next7Str = next7Days.toISOString().split('T')[0]

  const metrics = useMemo(() => {
    let saldoAtual = 0
    let aPagar = 0
    let aReceber = 0
    const expensesByCategory: Record<string, number> = {}

    transactions.forEach(txn => {
      const amt = Number(txn.amount)
      
      // Saldo Real em Caixa (Tudo que já foi pago)
      if (txn.status === 'PAGO') {
        if (txn.type === 'INCOME') saldoAtual += amt
        if (txn.type === 'EXPENSE' || txn.type === 'WITHDRAWAL') {
          saldoAtual -= amt
          // Agrupa para o gráfico apenas o que já saiu ou vai sair este mês
          const cat = txn.category || 'Outros'
          expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt
        }
      }

      // Previsibilidade (O que está Pendente)
      if (txn.status === 'PENDENTE') {
        if (txn.type === 'INCOME') aReceber += amt
        if (txn.type === 'EXPENSE' || txn.type === 'WITHDRAWAL') {
          aPagar += amt
          const cat = txn.category || 'Outros'
          expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt
        }
      }
    })

    // Formata para o Recharts
    const chartData = Object.keys(expensesByCategory).map(key => ({
      name: key,
      value: expensesByCategory[key],
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS['Outros']
    })).sort((a, b) => b.value - a.value)

    return { saldoAtual, aPagar, aReceber, chartData }
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      if (filter === 'ALL') return true
      if (filter === 'PAID') return txn.status === 'PAGO'
      
      const due = txn.due_date
      if (filter === 'LATE') return txn.status === 'PENDENTE' && due < todayStr
      if (filter === 'TODAY') return txn.status === 'PENDENTE' && due === todayStr
      if (filter === 'NEXT_7') return txn.status === 'PENDENTE' && due > todayStr && due <= next7Str
      
      return true
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [transactions, filter, todayStr, next7Str])

  // ========================================================================
  // AÇÕES
  // ========================================================================

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAGO' ? 'PENDENTE' : 'PAGO'
    // Optimistic UI Update
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    
    const { error } = await supabase.from("transactions").update({ status: newStatus }).eq("id", id)
    if (error) {
      toast.error("Erro ao atualizar status.")
      if (userId) fetchFinances(userId) // Revert on error
    } else {
      toast.success(newStatus === 'PAGO' ? 'Baixa realizada no caixa!' : 'Marcado como pendente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este registro? Isso pode afetar seu DRE.")) return
    const { error } = await supabase.from("transactions").delete().eq("id", id)
    if (!error) {
      toast.success("Registro apagado.")
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER PREMIUM */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white dark:bg-[#09090b] p-8 rounded-[2rem] border border-zinc-200/60 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-zinc-400" /> Centro Financeiro
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm font-medium">Controle absoluto do fluxo de caixa, pagamentos e equipe.</p>
        </div>
        <button 
          onClick={() => setIsExpenseOpen(true)}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100`}
        >
          <Plus className="w-5 h-5" /> Novo Lançamento
        </button>
      </header>

      <Tabs defaultValue="geral" className="w-full space-y-8">
        <TabsList className="bg-zinc-100/80 p-1.5 dark:bg-zinc-900/50 rounded-2xl inline-flex">
          <TabsTrigger value="geral" className="rounded-xl px-8 py-2.5 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="lancamentos" className="rounded-xl px-8 py-2.5 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="rounded-xl px-8 py-2.5 text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            Comissões & Vales
          </TabsTrigger>
        </TabsList>

        {/* ================================================================== */}
        {/* ABA: VISÃO GERAL (COCKPIT) */}
        {/* ================================================================== */}
        <TabsContent value="geral" className="space-y-8 focus-visible:outline-none">
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Saldo Atual */}
            <div className={`relative overflow-hidden rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 dark:border-white/5 dark:bg-[#09090b]`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Saldo Atualizado</p>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
              </div>
              <h3 className={`text-4xl font-black tracking-tight ${metrics.saldoAtual >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600'}`}>
                R$ {metrics.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>

            {/* A Pagar (Risco) */}
            <div className={`relative overflow-hidden rounded-[2rem] border border-rose-100 bg-rose-50/30 p-8 shadow-sm transition-all hover:border-rose-200 dark:border-rose-900/30 dark:bg-rose-900/10`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-rose-500">A Pagar (Pendente)</p>
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl"><ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                R$ {metrics.aPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>

            {/* A Receber */}
            <div className={`relative overflow-hidden rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 dark:border-white/5 dark:bg-[#09090b]`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">A Receber</p>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl"><ArrowUpRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /></div>
              </div>
              <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                R$ {metrics.aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Gráfico de Plano de Contas */}
          <div className="rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#09090b] flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-zinc-400" /> Raio-X de Despesas
              </h3>
              <p className="text-sm text-zinc-500 mb-6">Para onde o dinheiro do caixa está indo (Pagas e Pendentes).</p>
              
              <div className="space-y-4">
                {metrics.chartData.length === 0 ? (
                  <p className="text-sm text-zinc-400">Nenhuma despesa registrada no período.</p>
                ) : (
                  metrics.chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="w-full md:w-[300px] h-[250px] relative">
              {metrics.chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={metrics.chartData} 
                      cx="50%" cy="50%" 
                      innerRadius={60} outerRadius={90} 
                      paddingAngle={5} dataKey="value"
                      stroke="none"
                    >
                      {metrics.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, "Valor"]} 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ================================================================== */}
        {/* ABA: FLUXO DE CAIXA (LANÇAMENTOS) */}
        {/* ================================================================== */}
        <TabsContent value="lancamentos" className="focus-visible:outline-none space-y-6">
          
          {/* Motor de Filtros Corporativo */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setFilter('ALL')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-zinc-900 text-white shadow-md' : 'bg-white border border-zinc-200/60 text-zinc-600 hover:bg-zinc-50'}`}>Todos</button>
            <button onClick={() => setFilter('LATE')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'LATE' ? 'bg-rose-100 text-rose-700 border-rose-200 border' : 'bg-white border border-zinc-200/60 text-zinc-600 hover:bg-rose-50 hover:text-rose-600'}`}>
              <AlertCircle className="w-4 h-4" /> Vencidos
            </button>
            <button onClick={() => setFilter('TODAY')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'TODAY' ? 'bg-amber-100 text-amber-800 border-amber-200 border' : 'bg-white border border-zinc-200/60 text-zinc-600 hover:bg-amber-50 hover:text-amber-700'}`}>Vence Hoje</button>
            <button onClick={() => setFilter('NEXT_7')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'NEXT_7' ? 'bg-blue-100 text-blue-800 border-blue-200 border' : 'bg-white border border-zinc-200/60 text-zinc-600 hover:bg-blue-50 hover:text-blue-700'}`}>Próximos 7 Dias</button>
            <button onClick={() => setFilter('PAID')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 border' : 'bg-white border border-zinc-200/60 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>
              <CheckCircle2 className="w-4 h-4" /> Pagos
            </button>
          </div>

          <div className="rounded-[2rem] border border-zinc-200/60 bg-white shadow-sm overflow-hidden dark:border-white/5 dark:bg-[#09090b]">
            <div className="divide-y divide-zinc-100 dark:divide-white/5">
              {isLoading ? (
                <div className="p-10 text-center text-zinc-400 font-medium animate-pulse">Carregando fluxo de caixa...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-zinc-400">
                  <Receipt className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-base font-bold text-zinc-500">Nenhum lançamento encontrado.</p>
                  <p className="text-sm mt-1">Sua lista está limpa para este filtro.</p>
                </div>
              ) : (
                filteredTransactions.map((txn) => {
                  const isLate = txn.status === 'PENDENTE' && txn.due_date < todayStr;
                  const isIncome = txn.type === 'INCOME';
                  
                  return (
                    <div key={txn.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors gap-4 group">
                      <div className="flex items-center gap-5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isIncome ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                          {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-base text-zinc-900 dark:text-white">{txn.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isLate ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-600'}`}>
                              Vence: {new Date(txn.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </span>
                            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                              <PieChartIcon className="w-3 h-3" /> {txn.category || 'Outros'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <p className={`font-black text-lg ${isIncome ? 'text-emerald-600' : 'text-zinc-900 dark:text-white'}`}>
                          {isIncome ? '+' : '-'} R$ {Number(txn.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(txn.id, txn.status)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                              txn.status === 'PAGO' 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                : isLate 
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 ring-1 ring-rose-400/50'
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200 ring-1 ring-amber-400/50'
                            }`}
                          >
                            {txn.status === 'PAGO' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {txn.status}
                          </button>
                          <button onClick={() => handleDelete(txn.id)} className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </TabsContent>

        {/* ================================================================== */}
        {/* ABA: COMISSÕES E VALES (GESTÃO DE EQUIPE) */}
        {/* ================================================================== */}
        <TabsContent value="comissoes" className="focus-visible:outline-none space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
               <div className="h-40 w-full animate-pulse rounded-[2rem] bg-zinc-100 dark:bg-zinc-800 col-span-full"></div>
            ) : professionals.length === 0 ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                 <Users className="h-12 w-12 text-zinc-300 mb-4" />
                 <p className="text-base font-bold text-zinc-500">Equipe Vazia.</p>
                 <p className="text-sm text-zinc-400 mt-1">Cadastre barbeiros na aba de Equipe para gerenciar repasses.</p>
               </div>
            ) : (
              professionals.map((prof) => (
                <div key={prof.id} className="rounded-[2rem] border border-zinc-200/60 bg-white p-6 shadow-sm flex flex-col justify-between h-full hover:border-zinc-300 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-xl font-black text-zinc-400 border border-zinc-200/50">
                        {prof.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-zinc-900">{prof.name}</h3>
                        <p className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                          {prof.commission_type === 'PERCENTAGE' ? `${prof.commission_value}%` : `R$ ${prof.commission_value} fixo`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Saldo a Pagar</p>
                    <span className={`text-3xl font-black tracking-tight ${prof.balance > 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                      R$ {prof.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button 
                    onClick={() => setSelectedProf(prof)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all bg-zinc-900 text-white hover:bg-zinc-800 shadow-md active:scale-95"
                  >
                    Lançar Vale / Acerto <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAIS (Estes componentes precisarão ser atualizados no próximo passo) */}
      <ExpenseDialog 
        isOpen={isExpenseOpen} 
        onClose={() => setIsExpenseOpen(false)} 
        onSuccess={() => { if (userId) fetchFinances(userId) }}
        userId={userId}
        t={t}
      />

      <CommissionDialog 
        isOpen={!!selectedProf}
        onClose={() => setSelectedProf(null)}
        onSuccess={() => { if (userId) fetchFinances(userId) }}
        professional={selectedProf}
        userId={userId}
        t={t}
      />
    </div>
  )
}