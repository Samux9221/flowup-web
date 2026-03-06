"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { Scissors, Plus, Pencil, Trash2, Clock, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Importamos a inteligência do nicho para puxar as categorias automáticas (Cabelo, Barba, etc.)
import { useNiche } from "../../app/contexts/NicheContext"

export default function TabServicos() {
  const { config } = useNiche()
  const t = config.theme
  const ServiceIcon = config.icons.service

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados do Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Campos do Formulário
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("30")
  const [category, setCategory] = useState(config.categories[0] || "Geral")

  const fetchServices = useCallback(async (uid: string) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", uid)
      .eq("type", "service") // Garante que não puxa produtos físicos
      .order("category", { ascending: true })
      .order("title", { ascending: true })

    if (data) setServices(data)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchServices(user.id)
      }
    }
    init()
  }, [fetchServices, supabase])

  const openNewService = () => {
    setEditingId(null)
    setTitle("")
    setPrice("")
    setDuration("30")
    setCategory(config.categories[0] || "Geral")
    setIsDialogOpen(true)
  }

  const openEditService = (svc: any) => {
    setEditingId(svc.id)
    setTitle(svc.title)
    setPrice(svc.price.toString())
    setDuration(svc.duration_minutes.toString())
    setCategory(svc.category || config.categories[0] || "Geral")
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title || !price || !duration) {
      toast.error("Preencha título, preço e duração.")
      return
    }

    setIsSaving(true)
    const serviceData = {
      user_id: userId,
      title,
      price: parseFloat(price),
      duration_minutes: parseInt(duration),
      category,
      type: 'service'
    }

    if (editingId) {
      const { error } = await supabase.from("services").update(serviceData).eq("id", editingId)
      if (error) toast.error("Erro ao atualizar: " + error.message)
      else toast.success("Serviço atualizado!")
    } else {
      const { error } = await supabase.from("services").insert([serviceData])
      if (error) toast.error("Erro ao criar: " + error.message)
      else toast.success("Novo serviço adicionado ao catálogo!")
    }

    setIsSaving(false)
    setIsDialogOpen(false)
    if (userId) fetchServices(userId)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço? A agenda pode ser afetada.")) return
    
    const { error } = await supabase.from("services").delete().eq("id", id)
    if (error) toast.error("Erro ao excluir.")
    else {
      toast.success("Serviço removido.")
      if (userId) fetchServices(userId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Catálogo de Serviços</h2>
          <p className="text-sm text-zinc-500">Gira os serviços que os clientes podem agendar.</p>
        </div>
        <button 
          onClick={openNewService}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className={`h-24 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>)}
        </div>
      ) : services.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-16 ${t.radius} border border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20`}>
          <Scissors className="h-10 w-10 text-zinc-300 mb-3" />
          <p className="text-sm font-medium text-zinc-500">Nenhum serviço cadastrado.</p>
          <button onClick={openNewService} className="mt-4 text-sm font-bold text-zinc-900 hover:underline">Adicionar o primeiro</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div key={svc.id} className={`group relative overflow-hidden flex flex-col justify-between p-5 ${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl transition-all hover:border-zinc-300 dark:border-white/5 dark:bg-zinc-900/30`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800">
                    <Tag className="w-3 h-3" /> {svc.category || 'Geral'}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditService(svc)} className="p-1.5 text-zinc-400 hover:text-zinc-900 bg-white rounded-md shadow-sm border border-zinc-200"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(svc.id)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-white rounded-md shadow-sm border border-zinc-200"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white mt-1">{svc.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 font-medium">
                  <Clock className="w-3.5 h-3.5" /> {svc.duration_minutes} minutos
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
                <p className={`font-black text-lg tracking-tight ${t.textHighlight}`}>
                  R$ {Number(svc.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b border-zinc-100">
            <DialogTitle className="text-xl font-semibold">{editingId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase">Nome do Serviço</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Corte Degradê" className="mt-1 h-12 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Valor (R$)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="mt-1 h-12 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Duração (Minutos)</Label>
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 flex h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1h 30min</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase">Categoria</Label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 flex h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              >
                {config.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100">
            <Button disabled={isSaving} onClick={handleSave} className={`w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}>
              {isSaving ? "Salvando..." : editingId ? "Atualizar Serviço" : "Cadastrar Serviço"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}