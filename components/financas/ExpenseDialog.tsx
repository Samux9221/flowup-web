"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { CheckCircle2, Clock, Banknote, CreditCard, QrCode, FileText } from "lucide-react"

export default function ExpenseDialog({ isOpen, onClose, onSuccess, userId, t }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSaving, setIsSaving] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState("PIX")
  const [status, setStatus] = useState("PAGO")

  const handleSave = async () => {
    if (!description || !amount || !date) {
      toast.error("Preencha a descrição, valor e data.")
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        type: "EXPENSE",
        amount: parseFloat(amount),
        description,
        payment_method: method,
        status: status,
        date: date
      }
    ])

    setIsSaving(false)

    if (error) {
      toast.error("Erro ao registrar despesa: " + error.message)
    } else {
      toast.success("Despesa registrada com sucesso!")
      setDescription("")
      setAmount("")
      onSuccess() // Atualiza os gráficos por trás
      onClose() // Fecha o modal
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b border-zinc-100">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-zinc-900">
            Nova Despesa
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Registre contas de luz, aluguel, reposição de estoque, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</Label>
              <Input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Conta de Luz"
                className="mt-1 h-12 rounded-xl border-zinc-200 bg-zinc-50/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor (R$)</Label>
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 h-12 rounded-xl border-zinc-200 text-lg font-medium"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data do Pagamento</Label>
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 h-12 rounded-xl border-zinc-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status da Conta</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStatus("PAGO")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${status === "PAGO" ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
              >
                <CheckCircle2 className="w-4 h-4" /> Pago
              </button>
              <button
                onClick={() => setStatus("PENDENTE")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${status === "PENDENTE" ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
              >
                <Clock className="w-4 h-4" /> Vai Vencer
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <Button 
            disabled={isSaving}
            onClick={handleSave}
            className={`w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}
          >
            {isSaving ? "Salvando..." : "Registrar Saída"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}