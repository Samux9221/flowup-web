"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Plus, Loader2, MoreVertical, Edit2, Trash2, DollarSign, Clock, Package } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// 🔹 IMPORTANDO O NOSSO CÉREBRO
import { useNiche } from "../../contexts/NicheContext"

export default function ServicosPage() {
  const router = useRouter()
  
  // 🔹 PUXANDO A INTELIGÊNCIA DO NICHO E O TEMA
  const { config } = useNiche()
  const ServiceIcon = config.icons.service
  const t = config.theme // Atalho para o design system

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("30")
  const [type, setType] = useState<"service" | "product">("service")

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase, router])

  const fetchServices = async () => {
    if (!userId) return

    setIsLoadingData(true)
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", userId)
      .order("type", { ascending: false }) 
      .order("title")
    
    if (data) setServices(data)
    setIsLoadingData(false)
  }

  useEffect(() => {
    if (userId) {
      fetchServices()
    }
  }, [userId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSaveService = async () => {
    if (!title || !price || (type === "service" && !duration)) {
      toast.error("Preencha todos os campos obrigatórios!")
      return
    }

    if (!userId) return

    setIsSaving(true)

    const formattedPrice = parseFloat(price.replace(",", "."))
    const durationMinutes = type === "product" ? 0 : parseInt(duration)

    const payload = { 
      user_id: userId,
      title, 
      price: formattedPrice, 
      duration_minutes: durationMinutes,
      type: type 
    }

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", userId)

      if (error) toast.error("Erro ao atualizar: " + error.message)
      else toast.success("Item atualizado com sucesso! ✨")
    } else {
      const { error } = await supabase
        .from("services")
        .insert([payload])

      if (error) toast.error("Erro ao salvar: " + error.message)
      else toast.success("Novo item adicionado! 🎉")
    }

    setIsSaving(false)
    setIsSheetOpen(false)
    resetForm()
    fetchServices()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) return

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      toast.error("Erro ao excluir: " + error.message)
    } else {
      toast.success("Item excluído com sucesso!")
      fetchServices()
    }
  }

  const openEditPanel = (service: any) => {
    setEditingId(service.id)
    setTitle(service.title)
    setPrice(service.price.toString())
    setDuration(service.duration_minutes?.toString() || "30")
    setType(service.type || "service") 
    setActiveDropdown(null)
    setIsSheetOpen(true)
  }

  const openNewPanel = () => {
    resetForm()
    setIsSheetOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setPrice("")
    setDuration("30")
    setType("service")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Serviços {config.features.hasQuickProducts && "& Produtos"}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Gerencie o catálogo e os preços do seu negócio.</p>
        </div>

        <button 
          onClick={openNewPanel}
          className={`w-full sm:w-auto group flex items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all active:scale-95`}
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Novo Item
        </button>
      </header>

      <div className={`relative ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10`}>
        
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Carregando catálogo...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-center">
            <ServiceIcon className={`h-12 w-12 mb-4 opacity-20 ${t.textHighlight}`} />
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">Nenhum item cadastrado.</p>
            <p className="text-sm mt-1">Clique em "Novo Item" para começar.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((svc) => (
              <div 
                key={svc.id} 
                className={`group relative flex items-center justify-between ${t.radius} border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 dark:border-white/5 dark:bg-zinc-900/50`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center ${t.radius} shrink-0 ${svc.type === 'product' ? 'bg-amber-100/80 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : `${t.secondaryBg} ${t.textHighlight}`}`}>
                    {svc.type === 'product' ? <Package className="h-5 w-5" /> : <ServiceIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{svc.title}</p>
                      {svc.type === 'product' && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">PRODUTO</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        R$ {Number(svc.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {svc.type !== 'product' && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {svc.duration_minutes} min
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative" ref={activeDropdown === svc.id ? dropdownRef : null}>
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === svc.id ? null : svc.id)}
                    className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {activeDropdown === svc.id && (
                    <div className={`absolute right-0 top-10 z-50 w-36 ${t.radius} border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 dark:border-white/10 dark:bg-zinc-900`}>
                      <button 
                        onClick={() => openEditPanel(svc)}
                        className={`flex w-full items-center gap-2 ${t.radius} px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`}
                      >
                        <Edit2 className="h-4 w-4" /> Editar
                      </button>
                      <button 
                        onClick={() => {
                          setActiveDropdown(null)
                          handleDelete(svc.id)
                        }}
                        className={`flex w-full items-center gap-2 ${t.radius} px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open)
        if (!open) resetForm()
      }}>
        <SheetContent className="w-full sm:max-w-md border-zinc-200/60 bg-white/90 backdrop-blur-2xl p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-950/90 sm:rounded-l-3xl">
          <div className="flex h-full flex-col">
            <SheetHeader className="text-left space-y-2 pb-6 border-b border-zinc-200/60 dark:border-white/10">
              <SheetTitle className="text-2xl font-bold">
                {editingId ? "Editar Item" : "Novo Item"}
              </SheetTitle>
              <p className="text-sm text-zinc-500">
                {editingId ? "Atualize os dados selecionados." : `Cadastre um novo item para o seu ${config.title.toLowerCase()}.`}
              </p>
            </SheetHeader>
            
            <div className="flex-1 py-8 space-y-6">
              
              {config.features.hasQuickProducts && !editingId && (
                <div className={`flex ${t.radius} bg-zinc-100 p-1 dark:bg-zinc-900`}>
                  <button
                    onClick={() => setType("service")}
                    className={`flex-1 ${t.radius} py-2 text-sm font-medium transition-all ${type === "service" ? `${t.primaryBg} text-white shadow-sm` : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"}`}
                  >
                    Serviço
                  </button>
                  <button
                    onClick={() => setType("product")}
                    className={`flex-1 ${t.radius} py-2 text-sm font-medium transition-all ${type === "product" ? `${t.primaryBg} text-white shadow-sm` : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"}`}
                  >
                    Produto Rápido
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nome do {type === 'product' ? 'Produto' : 'Serviço'}</label>
                <div className="relative">
                  {type === 'product' ? (
                    <Package className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  ) : (
                    <ServiceIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  )}
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === 'product' ? config.examples.product : config.examples.service} 
                    className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
                  />
                </div>
              </div>

              <div className={`grid ${type === 'product' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Preço (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="35.00" 
                      className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3.5 pl-10 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
                    />
                  </div>
                </div>

                {type === 'service' && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Duração</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3.5 pl-10 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white appearance-none`}
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">1 hora</option>
                        <option value="90">1h 30m</option>
                        <option value="120">2 horas</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto border-t border-zinc-200/60 pt-6 pb-2 dark:border-white/10">
              <button 
                onClick={handleSaveService}
                disabled={isSaving}
                className={`w-full flex items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-4 py-4 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-70`}
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}