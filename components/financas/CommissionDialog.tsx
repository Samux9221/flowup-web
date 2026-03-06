"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { HandCoins, Wallet } from "lucide-react"

export default function CommissionDialog({ isOpen, onClose, onSuccess, professional, userId, t }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSaving, setIsSaving] = useState(false)
  const [actionType, setActionType] = useState<"VALE" | "PAGAMENTO">("PAGAMENTO")
  const [amount, setAmount] = useState("")

  if (!professional) return null

  const handleSave = async () => {
    const valueToDeduct = actionType === "PAGAMENTO" ? professional.balance : parseFloat(amount)

    if (!valueToDeduct || valueToDeduct <= 0 || valueToDeduct > professional.balance) {
      toast.error("Valor inválido ou maior que o saldo disponível.")
      return
    }

    setIsSaving(true)

    // 1. Lança o DÉBITO no banco virtual do profissional (Ledger)
    const { error: ledgerError } = await supabase.from("commission_ledger").insert([{
      professional_id: professional.id,
      type: 'DEBIT',
      amount: valueToDeduct,
      description: actionType === "VALE" ? "Adiantamento (Vale)" : "Fechamento Semanal (Pagamento)",
    }])

    if (ledgerError) {
      toast.error("Erro ao registrar no ledger: " + ledgerError.message)
      setIsSaving(false)
      return
    }

    // 2. Lança a SAÍDA (Despesa) no Fluxo de Caixa Geral da Barbearia
    const { error: txnError } = await supabase.from("transactions").insert([{
      user_id: userId,
      type: 'EXPENSE',
      amount: valueToDeduct,
      description: actionType === "VALE" ? `Vale: ${professional.name}` : `Pagamento Comissão: ${professional.name}`,
      payment_method: 'PIX', // Padrão simplificado, pode ser expandido depois
      status: 'PAGO',
      date: new Date().toISOString().split('T')[0]
    }])

    setIsSaving(false)

    if (txnError) {
      toast.error("Erro ao abater do caixa geral.")
    } else {
      toast.success(actionType === "VALE" ? "Vale registrado!" : "Profissional pago e conta zerada!")
      setAmount("")
      onSuccess()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b border-zinc-100">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-zinc-900">
            Acerto: {professional.name}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Saldo atual a receber: <strong className="text-zinc-900">R$ {professional.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setActionType("PAGAMENTO"); setAmount(""); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${actionType === "PAGAMENTO" ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/10' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Pagar Tudo</span>
            </button>
            <button
              onClick={() => setActionType("VALE")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${actionType === "VALE" ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
            >
              <HandCoins className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Lançar Vale</span>
            </button>
          </div>

          {actionType === "VALE" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Qual o valor do Vale? (R$)</Label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 h-12 rounded-xl text-lg font-medium"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <Button 
            disabled={isSaving || professional.balance <= 0}
            onClick={handleSave}
            className={`w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}
          >
            {isSaving ? "Processando..." : actionType === "PAGAMENTO" ? "Zerar e Abater do Caixa" : "Registrar Vale"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}