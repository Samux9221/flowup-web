"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { Package, Plus, Pencil, Trash2, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNiche } from "../../app/contexts/NicheContext"

export default function TabEstoque() {
  const { config } = useNiche()
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados do Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Campos do Formulário
  const [name, setName] = useState("")
  const [price, setPrice] = useState("") // Preço de Venda
  const [costPrice, setCostPrice] = useState("") // Preço de Custo
  const [stockQty, setStockQty] = useState("")
  const [minStock, setMinStock] = useState("3") // Alerta de estoque baixo

  const fetchProducts = useCallback(async (uid: string) => {
    setIsLoading(true)
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", uid)
      .eq("type", "product") // Filtra apenas produtos físicos
      .order("title", { ascending: true })

    if (data) setProducts(data)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchProducts(user.id)
      }
    }
    init()
  }, [fetchProducts, supabase])

  const openNew = () => {
    setEditingId(null); setName(""); setPrice(""); setCostPrice(""); setStockQty(""); setMinStock("3");
    setIsDialogOpen(true)
  }

  const openEdit = (p: any) => {
    setEditingId(p.id); setName(p.title); setPrice(p.price.toString());
    setCostPrice(p.cost_price?.toString() || "");
    setStockQty(p.stock_qty?.toString() || "0");
    setMinStock(p.min_stock?.toString() || "3");
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name || !price || !stockQty) return toast.error("Nome, preço de venda e estoque são obrigatórios.")

    setIsSaving(true)
    const productData = {
      user_id: userId,
      title: name,
      price: parseFloat(price),
      cost_price: costPrice ? parseFloat(costPrice) : 0,
      stock_qty: parseInt(stockQty),
      min_stock: parseInt(minStock),
      type: 'product',
      duration_minutes: 0 // Produtos não ocupam tempo na agenda
    }

    if (editingId) {
      const { error } = await supabase.from("services").update(productData).eq("id", editingId)
      if (!error) toast.success("Produto atualizado!")
    } else {
      const { error } = await supabase.from("services").insert([productData])
      if (!error) toast.success("Produto adicionado ao estoque!")
    }

    setIsSaving(false); setIsDialogOpen(false);
    if (userId) fetchProducts(userId)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja remover este produto do estoque?")) return
    const { error } = await supabase.from("services").delete().eq("id", id)
    if (!error) {
      toast.success("Produto removido.")
      if (userId) fetchProducts(userId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Estoque de Produtos</h2>
          <p className="text-sm text-zinc-500">Gira seus itens de revenda e consumo interno.</p>
        </div>
        <button 
          onClick={openNew}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className={`h-40 w-full animate-pulse ${t.radius} bg-zinc-100 dark:bg-zinc-800`}></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-16 ${t.radius} border border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20`}>
          <Package className="h-10 w-10 text-zinc-300 mb-3" />
          <p className="text-sm font-medium text-zinc-500">Seu estoque está vazio.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const isLowStock = p.stock_qty <= p.min_stock
            const profit = p.price - (p.cost_price || 0)

            return (
              <div key={p.id} className={`group relative p-5 ${t.radius} border border-zinc-200/60 bg-white shadow-sm transition-all hover:border-zinc-300 dark:bg-zinc-900/30`}>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 rounded-md border border-zinc-200"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-zinc-50 rounded-md border border-zinc-200"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white pr-14 truncate">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        Qtd: {p.stock_qty}
                      </span>
                      {isLowStock && (
                            <span title="Estoque Baixo!">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 dark:border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Preço Venda</p>
                      <p className="font-bold text-zinc-900 dark:text-white">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Lucro Un.</p>
                      <p className="font-bold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE PRODUTO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b border-zinc-100">
            <DialogTitle className="text-xl font-semibold">{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-5">
            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase">Nome da Mercadoria</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pomada Efeito Matte 80g" className="mt-1 h-12 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Preço de Venda (R$)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="pl-9 h-12 rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Preço de Custo (R$)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" className="pl-9 h-12 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Qtd. em Estoque</Label>
                <Input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="Ex: 20" className="mt-1 h-12 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase">Alerta Estoque Baixo</Label>
                <Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="Ex: 3" className="mt-1 h-12 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100">
            <Button disabled={isSaving} onClick={handleSave} className={`w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}>
              {isSaving ? "Guardando..." : editingId ? "Atualizar Estoque" : "Adicionar ao Estoque"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}