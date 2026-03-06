"use client"

import { useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Users, Plus, Percent, BadgeDollarSign, ShieldAlert, CheckCircle2, Pencil, Trash2 } from "lucide-react"

import { useNiche } from "@/app/contexts/NicheContext"
import ProfessionalDialog from "@/components/equipe/ProfessionalDialog"
import { toast } from "sonner"

export default function TabEquipe() {
  const { config } = useNiche()
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [team, setTeam] = useState<any[]>([])
  
  // Estados do Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProf, setEditingProf] = useState<any>(null)

  const fetchTeam = useCallback(async (uid: string) => {
    setIsLoading(true)
    const { data } = await supabase
      .from("professionals")
      .select(`*, commission_rules (*)`)
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    if (data) setTeam(data)
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

  const openNew = () => {
    setEditingProf(null)
    setIsDialogOpen(true)
  }

  const openEdit = (prof: any) => {
    setEditingProf(prof)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este profissional? Os históricos de agenda vinculados a ele podem ser afetados.")) return
    
    // A deleção em cascata (ON DELETE CASCADE) no banco cuidará de apagar as regras e ledgers
    const { error } = await supabase.from("professionals").delete().eq("id", id)
    if (error) toast.error("Erro ao excluir profissional.")
    else {
      toast.success("Profissional removido da equipe.")
      if (userId) fetchTeam(userId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Gestão de Equipe</h2>
          <p className="text-sm text-zinc-500">Cadastre os profissionais e configure as regras de comissão.</p>
        </div>
        <button 
          onClick={openNew}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
        >
          <Plus className="w-4 h-4" /> Novo Profissional
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className={`h-48 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>)
        ) : team.length === 0 ? (
          <div className={`col-span-full flex flex-col items-center justify-center py-16 ${t.radius} border border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20`}>
             <Users className="h-10 w-10 text-zinc-300 mb-4" />
             <p className="text-sm font-medium text-zinc-500 mb-4">Nenhum profissional cadastrado.</p>
             <button onClick={openNew} className="text-sm font-bold text-zinc-900 bg-white border border-zinc-200 shadow-sm px-4 py-2 rounded-lg hover:bg-zinc-50">
               Adicionar o primeiro
             </button>
          </div>
        ) : (
          team.map((prof) => {
            const ruleService = prof.commission_rules?.find((r: any) => r.item_type === 'SERVICE')
            const ruleProduct = prof.commission_rules?.find((r: any) => r.item_type === 'PRODUCT')
            
            return (
              <div key={prof.id} className={`${t.radius} border border-zinc-200/60 bg-white/50 p-5 shadow-sm backdrop-blur-xl relative overflow-hidden group dark:border-white/5 dark:bg-zinc-900/30`}>
                
                {/* 🔹 BOTÕES DE EDITAR E EXCLUIR 🔹 */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(prof)} className="p-1.5 text-zinc-400 hover:text-zinc-900 bg-white rounded-md shadow-sm border border-zinc-200 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(prof.id)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-white rounded-md shadow-sm border border-zinc-200 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>

                <div className="flex items-start gap-3 mb-4 pr-16">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                    {prof.avatar_url ? (
                      <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Users className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">{prof.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{prof.bio || "Membro da Equipe"}</p>
                  </div>
                </div>

                <div className="space-y-2 bg-zinc-50/80 p-3 rounded-xl border border-zinc-100 dark:bg-zinc-800/50 dark:border-white/5">
                  {ruleService ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase">Serviços</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">
                        {ruleService.commission_type === 'PERCENTAGE' ? `${ruleService.commission_value}%` : `R$ ${ruleService.commission_value}`}
                      </span>
                    </div>
                  ) : <span className="text-xs text-zinc-400">Sem regra de serviço</span>}

                  {ruleProduct ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase">Produtos</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">
                        {ruleProduct.commission_type === 'PERCENTAGE' ? `${ruleProduct.commission_value}%` : `R$ ${ruleProduct.commission_value}`}
                      </span>
                    </div>
                  ) : <span className="text-xs text-zinc-400">Sem regra de produtos</span>}
                  
                  {ruleService && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-white/10 mt-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Desconta Maquininha?</span>
                      {ruleService.discount_fees_first ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                  )}
                </div>
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
        professionalToEdit={editingProf} 
        t={t}
      />
    </div>
  )
}