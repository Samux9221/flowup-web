"use client"

import { useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { ArrowDownRight, ArrowUpRight, Wallet, Plus, Receipt, Users, CheckCircle2, Clock, Trash2, HandCoins } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { useNiche } from "../../contexts/NicheContext"
import ExpenseDialog from "@/components/financas/ExpenseDialog"
import CommissionDialog from "@/components/financas/CommissionDialog" // 🔹 Novo Import

export default function FinancasPage() {
  const { config } = useNiche()
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Estados do Caixa Geral
  const [transactions, setTransactions] = useState<any[]>([])
  const [metrics, setMetrics] = useState({ balance: 0, income: 0, expense: 0 })
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)

  // 🔹 Estados das Comissões
  const [professionals, setProfessionals] = useState<any[]>([])
  const [selectedProf, setSelectedProf] = useState<any>(null)

  const fetchFinances = useCallback(async (uid: string) => {
    setIsLoading(true)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // 1. Busca Transações Gerais
    const { data: txns } = await supabase
      .from("transactions")
      .select(`*`)
      .eq("user_id", uid)
      .gte("created_at", startOfMonth)
      .order("created_at", { ascending: false })

    if (txns) {
      setTransactions(txns)
      let income = 0
      let expense = 0
      txns.forEach(txn => {
        if (txn.status === 'PAGO') {
          if (txn.type === 'INCOME') income += Number(txn.amount)
          if (txn.type === 'EXPENSE') expense += Number(txn.amount)
        }
      })
      setMetrics({ balance: income - expense, income, expense })
    }

    // 2. Busca Profissionais e seus Saldos (O Motor de Comissões)
    const { data: profs } = await supabase.from("professionals").select("*").eq("user_id", uid)
    
    if (profs && profs.length > 0) {
      const profIds = profs.map(p => p.id)
      const { data: ledgers } = await supabase.from("commission_ledger").select("*").in("professional_id", profIds)
      
      const profsWithBalance = profs.map(p => {
        const myLedgers = ledgers?.filter(l => l.professional_id === p.id) || []
        let balance = 0
        myLedgers.forEach(l => {
          if (l.type === 'CREDIT') balance += Number(l.amount)
          if (l.type === 'DEBIT') balance -= Number(l.amount)
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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAGO' ? 'PENDENTE' : 'PAGO'
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    const { error } = await supabase.from("transactions").update({ status: newStatus }).eq("id", id)
    if (error) {
      toast.error("Erro ao atualizar status.")
      if (userId) fetchFinances(userId)
    } else {
      toast.success(`Marcado como ${newStatus.toLowerCase()}!`)
      if (userId) fetchFinances(userId)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este registro?")) return
    const { error } = await supabase.from("transactions").delete().eq("id", id)
    if (!error) {
      toast.success("Registro apagado.")
      if (userId) fetchFinances(userId)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Financeiro</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">O controle absoluto do seu fluxo de caixa e pagamentos.</p>
        </div>
        <button 
          onClick={() => setIsExpenseOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
        >
          <Plus className="w-4 h-4" /> Nova Despesa
        </button>
      </header>

      <Tabs defaultValue="geral" className="w-full space-y-6">
        <TabsList className="bg-zinc-100/80 p-1 dark:bg-zinc-900/50 rounded-xl">
          <TabsTrigger value="geral" className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Wallet className="w-4 h-4 mr-2 inline-block" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="lancamentos" className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Receipt className="w-4 h-4 mr-2 inline-block" /> Lançamentos
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2 inline-block" /> Comissões e Vales
          </TabsTrigger>
        </TabsList>

        {/* ABA: VISÃO GERAL (MANTIDA) */}
        <TabsContent value="geral" className="space-y-6 focus-visible:outline-none">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Saldo Atual (Mês)</p>
              <h3 className={`text-3xl font-bold mt-2 ${metrics.balance >= 0 ? 'text-zinc-900 dark:text-white' : 'text-red-600'}`}>
                R$ {metrics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Entradas</p>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-3">
                R$ {metrics.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`relative overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Saídas</p>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-3">
                R$ {metrics.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </TabsContent>

        {/* ABA: LANÇAMENTOS (MANTIDA) */}
        <TabsContent value="lancamentos" className="focus-visible:outline-none">
          {/* ... (O código dos Lançamentos permanece exatamente igual ao anterior) ... */}
           <div className={`${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 overflow-hidden`}>
            <div className="border-b border-zinc-200/60 px-6 py-5 dark:border-white/5 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Todos os Lançamentos</h2>
            </div>
            <div className="p-0">
               <div className="divide-y divide-zinc-100 dark:divide-white/5">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${txn.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                          {txn.type === 'INCOME' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-base text-zinc-900 dark:text-white">{txn.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-zinc-500">{new Date(txn.date).toLocaleDateString('pt-BR')}</span>
                            <span className="text-xs text-zinc-300">•</span>
                            <span className="text-xs font-medium text-zinc-500">{txn.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <p className={`font-bold text-lg ${txn.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                          {txn.type === 'INCOME' ? '+' : '-'} R$ {Number(txn.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(txn.id, txn.status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                              txn.status === 'PAGO' 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-400/50'
                            }`}
                          >
                            {txn.status === 'PAGO' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {txn.status}
                          </button>
                          <button onClick={() => handleDelete(txn.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </TabsContent>

        {/* 🔹 NOVA ABA: COMISSÕES E VALES 🔹 */}
        <TabsContent value="comissoes" className="focus-visible:outline-none space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
               <div className={`h-32 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>
            ) : professionals.length === 0 ? (
               <div className={`col-span-full flex flex-col items-center justify-center py-16 ${t.radius} border border-dashed border-zinc-300 bg-zinc-50/50`}>
                 <Users className="h-10 w-10 text-zinc-300 mb-3" />
                 <p className="text-sm font-medium text-zinc-500">Nenhum profissional cadastrado na equipe ainda.</p>
               </div>
            ) : (
              professionals.map((prof) => (
                <div key={prof.id} className={`${t.radius} border border-zinc-200/60 bg-white/50 p-5 shadow-sm backdrop-blur-xl flex flex-col justify-between h-full`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-zinc-100 shadow-sm">
                      {prof.avatar_url ? (
                        <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${t.secondaryBg} ${t.textHighlight} font-bold text-lg`}>
                          {prof.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{prof.name}</h3>
                      <p className="text-xs text-zinc-500">Saldo a receber</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <span className={`text-3xl font-black tracking-tight ${prof.balance > 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                      R$ {prof.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button 
                    onClick={() => setSelectedProf(prof)}
                    disabled={prof.balance <= 0}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${prof.balance > 0 ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                  >
                    Fazer Acerto
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

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