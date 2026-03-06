"use client"

import { useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Users, Plus, Percent, BadgeDollarSign, ShieldAlert, CheckCircle2 } from "lucide-react"

import { useNiche } from "../../contexts/NicheContext"
import ProfessionalDialog from "@/components/equipe/ProfessionalDialog"

export default function EquipePage() {
  const { config } = useNiche()
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [team, setTeam] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchTeam = useCallback(async (uid: string) => {
    setIsLoading(true)
    
    // Busca os profissionais e as suas regras de comissão atreladas
    const { data } = await supabase
      .from("professionals")
      .select(`
        *,
        commission_rules (*)
      `)
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    if (data) {
      setTeam(data)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchTeam(user.id)
      }
    }
    init()
  }, [fetchTeam, supabase])

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Minha Equipe</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Gira os profissionais e regras de remuneração.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
        >
          <Plus className="w-4 h-4" /> Novo Profissional
        </button>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className={`h-48 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>)
        ) : team.length === 0 ? (
          <div className={`col-span-full flex flex-col items-center justify-center py-20 ${t.radius} border border-dashed border-zinc-300 bg-zinc-50/50`}>
             <Users className="h-12 w-12 text-zinc-300 mb-4" />
             <h3 className="text-lg font-bold text-zinc-900">Nenhum profissional cadastrado</h3>
             <p className="text-sm text-zinc-500 mt-1 mb-6">Adicione o seu primeiro membro para gerir as comissões.</p>
             <button 
               onClick={() => setIsDialogOpen(true)}
               className="text-sm font-bold text-zinc-900 bg-white border border-zinc-200 shadow-sm px-4 py-2 rounded-lg hover:bg-zinc-50"
             >
               Começar agora
             </button>
          </div>
        ) : (
          team.map((prof) => {
            const rule = prof.commission_rules?.[0] // Pega a regra principal (Serviços)
            
            return (
              <div key={prof.id} className={`${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl relative overflow-hidden group`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                     <Users className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 leading-tight">{prof.name}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">{prof.bio || "Membro da Equipe"}</p>
                  </div>
                </div>

                {rule ? (
                  <div className="space-y-3 bg-zinc-50/80 p-4 rounded-xl border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Comissão</span>
                      <span className="font-bold text-zinc-900 flex items-center gap-1">
                        {rule.commission_type === 'PERCENTAGE' ? <Percent className="w-3.5 h-3.5 text-zinc-400" /> : <BadgeDollarSign className="w-3.5 h-3.5 text-zinc-400" />}
                        {rule.commission_type === 'PERCENTAGE' ? `${rule.commission_value}%` : `R$ ${rule.commission_value}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-200/60">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Desconta Taxas?</span>
                      {rule.discount_fees_first ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          <ShieldAlert className="w-3 h-3" /> Sim
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Não
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-200 text-center">
                    <p className="text-xs font-medium text-zinc-500">Sem regras de comissão</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <ProfessionalDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => { if (userId) fetchTeam(userId) }}
        userId={userId}
        t={t}
      />
    </div>
  )
}