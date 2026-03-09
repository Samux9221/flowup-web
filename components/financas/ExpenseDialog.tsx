"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { CheckCircle2, Clock, Tags, CalendarDays } from "lucide-react"

const PLANO_DE_CONTAS = [
  'Custo Fixo', 
  'Insumos', 
  'Marketing', 
  'Folha e Comissões', 
  'Impostos/Taxas', 
  'Outros'
]

export default function ExpenseDialog({ isOpen, onClose, onSuccess, userId, t }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSaving, setIsSaving] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Custo Fixo")
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState("PIX")
  const [status, setStatus] = useState("PAGO")

  const handleSave = async () => {
    if (!description || !amount || !dueDate) {
      toast.error("Preencha a descrição, valor e data de vencimento.")
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        type: "EXPENSE",
        category: category,
        amount: parseFloat(amount),
        description,
        payment_method: method,
        status: status,
        date: new Date().toISOString().split('T')[0], // Data do registro
        due_date: dueDate // A data real de vencimento (Previsibilidade)
      }
    ])

    setIsSaving(false)

    if (error) {
      toast.error("Erro ao registrar despesa. Tente novamente.")
    } else {
      toast.success("Despesa registrada no fluxo de caixa!")
      setDescription("")
      setAmount("")
      setCategory("Custo Fixo")
      onSuccess() 
      onClose() 
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-[2rem] p-0 overflow-hidden bg-white dark:bg-[#09090b]">
        
        <div className="p-8 pb-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Nova Despesa
          </DialogTitle>
          <DialogDescription className="text-zinc-500 mt-2 font-medium">
            Alimente o fluxo de caixa categorizando suas saídas.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-5">
            <div>
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Descrição</Label>
              <Input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Conta de Luz (Abril)"
                className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-base shadow-sm focus-visible:ring-emerald-500"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Tags className="w-3.5 h-3.5" /> Plano de Contas</Label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PLANO_DE_CONTAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Valor (R$)</Label>
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-lg font-black text-zinc-900 dark:text-white shadow-sm focus-visible:ring-emerald-500"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Vencimento</Label>
                <Input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-sm font-semibold shadow-sm focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status do Pagamento</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStatus("PAGO")}
                className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 font-bold transition-all ${status === "PAGO" ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'}`}
              >
                <CheckCircle2 className="w-5 h-5" /> Já Paguei
              </button>
              <button
                onClick={() => setStatus("PENDENTE")}
                className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 font-bold transition-all ${status === "PENDENTE" ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'}`}
              >
                <Clock className="w-5 h-5" /> Vai Vencer
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 pt-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20">
          <Button 
            disabled={isSaving}
            onClick={handleSave}
            className={`w-full h-14 rounded-2xl text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100`}
          >
            {isSaving ? "Registrando..." : "Confirmar Lançamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}