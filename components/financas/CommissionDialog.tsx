"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { HandCoins, Receipt, ToggleRight, ToggleLeft, CheckCircle2 } from "lucide-react"

export default function CommissionDialog({ isOpen, onClose, onSuccess, professional, userId, t }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSaving, setIsSaving] = useState(false)
  const [actionType, setActionType] = useState<"VALE" | "PAGAMENTO">("PAGAMENTO")
  const [amount, setAmount] = useState("")

  const [extrato, setExtrato] = useState({ credits: 0, debits: 0 })
  const [applyTax, setApplyTax] = useState(false)
  const [taxAmount, setTaxAmount] = useState("")

  useEffect(() => {
    if (isOpen && professional) {
      const fetchLedger = async () => {
        const { data } = await supabase.from("commission_ledger").select("*").eq("professional_id", professional.id)
        let credits = 0; let debits = 0;
        data?.forEach(l => {
          if (l.type === 'CREDIT') credits += Number(l.amount)
          if (l.type === 'DEBIT') debits += Number(l.amount)
        })
        setExtrato({ credits, debits })
        
        setApplyTax(false)
        setTaxAmount("")
        setAmount("")
      }
      fetchLedger()
    }
  }, [isOpen, professional, supabase])

  if (!professional) return null

  const valorTaxa = applyTax ? parseFloat(taxAmount || "0") : 0
  const saldoLiquidoAPagar = professional.balance - valorTaxa

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0]

    if (actionType === "VALE") {
      const valueToDeduct = parseFloat(amount)
      if (!valueToDeduct || valueToDeduct <= 0 || valueToDeduct > professional.balance) {
        toast.error("Valor de vale inválido ou maior que o saldo a receber.")
        return
      }

      setIsSaving(true)
      
      await supabase.from("commission_ledger").insert([{
        professional_id: professional.id,
        type: 'DEBIT',
        amount: valueToDeduct,
        description: "Adiantamento (Vale)",
      }])

      // Lança a DESPESA categorizada e com due_date
      await supabase.from("transactions").insert([{
        user_id: userId,
        type: 'WITHDRAWAL', // Tipado como Vale para inteligência futura
        category: 'Folha e Comissões',
        amount: valueToDeduct,
        description: `Vale Adiantamento: ${professional.name}`,
        payment_method: 'PIX',
        status: 'PAGO',
        date: today,
        due_date: today
      }])

      toast.success("Vale registrado e descontado do saldo!")
    } 
    
    else if (actionType === "PAGAMENTO") {
      if (saldoLiquidoAPagar < 0) {
        toast.error("Os descontos extras não podem ser maiores que o saldo.")
        return
      }

      setIsSaving(true)

      if (applyTax && valorTaxa > 0) {
        await supabase.from("commission_ledger").insert([{
          professional_id: professional.id,
          type: 'DEBIT',
          amount: valorTaxa,
          description: "Desconto Extra: Taxa/Insumo",
        }])
      }

      if (saldoLiquidoAPagar > 0) {
        await supabase.from("commission_ledger").insert([{
          professional_id: professional.id,
          type: 'DEBIT',
          amount: saldoLiquidoAPagar,
          description: "Fechamento de Acerto (Pagamento)",
        }])

        // Lança o Acerto Final categorizado e com due_date
        await supabase.from("transactions").insert([{
          user_id: userId,
          type: 'EXPENSE',
          category: 'Folha e Comissões',
          amount: saldoLiquidoAPagar,
          description: `Acerto de Comissões: ${professional.name}`,
          payment_method: 'PIX',
          status: 'PAGO',
          date: today,
          due_date: today
        }])
      }

      toast.success("Acerto liquidado e lançado no caixa geral! 💰")
    }

    setIsSaving(false)
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-[2rem] p-0 overflow-hidden bg-white dark:bg-[#09090b]">
        
        <div className="p-8 pb-6 bg-zinc-50 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-white/5">
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            Acerto: <span className={t.textHighlight}>{professional.name}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-500 mt-2 font-medium">
            Gerencie repasses e adiantamentos com impacto no caixa.
          </DialogDescription>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-3 bg-zinc-100/50 p-1.5 rounded-2xl dark:bg-zinc-900">
            <button
              onClick={() => { setActionType("PAGAMENTO"); setAmount(""); }}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${actionType === "PAGAMENTO" ? `bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white` : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <Receipt className="w-4 h-4" /> Acerto Final
            </button>
            <button
              onClick={() => setActionType("VALE")}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${actionType === "VALE" ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <HandCoins className="w-4 h-4" /> Lançar Vale
            </button>
          </div>

          {actionType === "VALE" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Valor do Adiantamento</Label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="R$ 0.00"
                className="h-16 rounded-2xl text-2xl font-black tracking-tight border-zinc-200 dark:border-zinc-800 focus-visible:ring-amber-500 bg-white dark:bg-black"
              />
              <div className="flex justify-between items-center px-2">
                <p className="text-xs text-zinc-400 font-bold">Saldo disponível:</p>
                <p className="text-sm font-black text-emerald-600">R$ {professional.balance.toFixed(2)}</p>
              </div>
            </div>
          )}

          {actionType === "PAGAMENTO" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-sm">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Produção Total</span>
                    <span>R$ {extrato.credits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500/80 font-medium">
                    <span>Vales e Adiantamentos</span>
                    <span>- R$ {extrato.debits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 font-black text-base text-zinc-900 dark:text-white">
                    <span>Saldo Bruto</span>
                    <span>R$ {professional.balance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-5 bg-zinc-100/50 dark:bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs uppercase tracking-wider mb-1">Descontos Manuais</span>
                      <span className="text-xs text-zinc-500 font-medium">Taxas de maquininha, lâminas, etc.</span>
                    </div>
                    <button onClick={() => setApplyTax(!applyTax)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      {applyTax ? <ToggleRight className={`w-10 h-10 ${t.textHighlight}`} /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                  </div>
                  {applyTax && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <span className="text-zinc-400 font-black text-sm uppercase">Valor:</span>
                      <Input 
                        type="number"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(e.target.value)}
                        placeholder="R$ 0.00"
                        className="h-12 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-bold text-base rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-between p-6 rounded-2xl text-white shadow-xl bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700`}>
                <span className="font-bold uppercase tracking-widest text-xs text-zinc-400">Líquido a Pagar</span>
                <span className="text-4xl font-black tracking-tight text-white">R$ {saldoLiquidoAPagar.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 pt-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20">
          <Button 
            disabled={isSaving || professional.balance <= 0 || (actionType === "PAGAMENTO" && saldoLiquidoAPagar < 0)}
            onClick={handleSave}
            className={`w-full h-14 rounded-2xl text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 ${
              actionType === "VALE" 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isSaving ? "Processando..." : actionType === "PAGAMENTO" ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Liquidar e Zerar Conta</span>
            ) : "Confirmar Adiantamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}