"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { HandCoins, Wallet, Receipt, ToggleRight, ToggleLeft, CheckCircle2 } from "lucide-react"

export default function CommissionDialog({ isOpen, onClose, onSuccess, professional, userId, t }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSaving, setIsSaving] = useState(false)
  const [actionType, setActionType] = useState<"VALE" | "PAGAMENTO">("PAGAMENTO")
  const [amount, setAmount] = useState("")

  // 🔹 Estados para o Extrato Transparente
  const [extrato, setExtrato] = useState({ credits: 0, debits: 0 })
  const [applyTax, setApplyTax] = useState(false)
  const [taxAmount, setTaxAmount] = useState("")

  // Busca os detalhes do Ledger para montar o recibo transparente
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
        
        // Reseta os estados ao abrir
        setApplyTax(false)
        setTaxAmount("")
        setAmount("")
      }
      fetchLedger()
    }
  }, [isOpen, professional, supabase])

  if (!professional) return null

  // 🔹 MATEMÁTICA DO ACERTO
  const valorTaxa = applyTax ? parseFloat(taxAmount || "0") : 0
  const saldoLiquidoAPagar = professional.balance - valorTaxa

  const handleSave = async () => {
    if (actionType === "VALE") {
      const valueToDeduct = parseFloat(amount)
      if (!valueToDeduct || valueToDeduct <= 0 || valueToDeduct > professional.balance) {
        toast.error("Valor de vale inválido ou maior que o saldo.")
        return
      }

      setIsSaving(true)
      
      // Lança o DÉBITO no ledger
      await supabase.from("commission_ledger").insert([{
        professional_id: professional.id,
        type: 'DEBIT',
        amount: valueToDeduct,
        description: "Adiantamento (Vale)",
      }])

      // Lança a DESPESA no Caixa Geral
      await supabase.from("transactions").insert([{
        user_id: userId,
        type: 'EXPENSE',
        amount: valueToDeduct,
        description: `Vale: ${professional.name}`,
        payment_method: 'PIX',
        status: 'PAGO',
        date: new Date().toISOString().split('T')[0]
      }])

      toast.success("Vale registrado com sucesso!")
    } 
    
    else if (actionType === "PAGAMENTO") {
      if (saldoLiquidoAPagar < 0) {
        toast.error("A taxa não pode ser maior que o saldo do profissional.")
        return
      }

      setIsSaving(true)

      // 1. Se tem taxa, lança o desconto no Ledger para justificar o abate
      if (applyTax && valorTaxa > 0) {
        await supabase.from("commission_ledger").insert([{
          professional_id: professional.id,
          type: 'DEBIT',
          amount: valorTaxa,
          description: "Desconto: Taxa de Maquininha/Outros",
        }])
      }

      // 2. Lança o pagamento do valor LÍQUIDO no Ledger para zerar a conta
      if (saldoLiquidoAPagar > 0) {
        await supabase.from("commission_ledger").insert([{
          professional_id: professional.id,
          type: 'DEBIT',
          amount: saldoLiquidoAPagar,
          description: "Fechamento de Comissões (Pagamento)",
        }])

        // 3. Lança a DESPESA real no Caixa Geral apenas do valor líquido que saiu do bolso do salão
        await supabase.from("transactions").insert([{
          user_id: userId,
          type: 'EXPENSE',
          amount: saldoLiquidoAPagar,
          description: `Acerto Comissão: ${professional.name}`,
          payment_method: 'PIX',
          status: 'PAGO',
          date: new Date().toISOString().split('T')[0]
        }])
      }

      toast.success("Profissional pago e conta zerada! 💰")
    }

    setIsSaving(false)
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl p-0 overflow-hidden bg-white dark:bg-[#09090b]">
        
        {/* HEADER */}
        <div className="p-6 bg-zinc-50 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-white/5">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Acerto: {professional.name}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 mt-1">
            Gerencie pagamentos e vales deste profissional.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {/* BOTÕES DE AÇÃO */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setActionType("PAGAMENTO"); setAmount(""); }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${actionType === "PAGAMENTO" ? `border-zinc-900 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md` : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50'}`}
            >
              <Receipt className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Acerto Final</span>
            </button>
            <button
              onClick={() => setActionType("VALE")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${actionType === "VALE" ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50'}`}
            >
              <HandCoins className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Lançar Vale</span>
            </button>
          </div>

          {/* SESSÃO: LANÇAR VALE */}
          {actionType === "VALE" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300 bg-amber-50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <Label className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Valor do Adiantamento (R$)</Label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-14 rounded-xl text-2xl font-light tracking-tight border-amber-200 dark:border-amber-900/50 focus-visible:ring-amber-500 bg-white dark:bg-black"
              />
              <p className="text-xs text-amber-600/80 font-medium">O saldo atual dele é de R$ {professional.balance.toFixed(2)}</p>
            </div>
          )}

          {/* SESSÃO: EXTRATO TRANSPARENTE (ACERTO FINAL) */}
          {actionType === "PAGAMENTO" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              
              <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-sm">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Produção Total (Créditos)</span>
                    <span className="font-medium">R$ {extrato.credits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-500/80">
                    <span>Vales Anteriores (Débitos)</span>
                    <span className="font-medium">- R$ {extrato.debits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white">
                    <span>Saldo Bruto Disponível</span>
                    <span>R$ {professional.balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* TOGGLE PREMIUM DE TAXAS */}
                <div className="p-4 bg-zinc-100/50 dark:bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs uppercase tracking-wider">Descontos Extras</span>
                      <span className="text-xs text-zinc-500">Taxas de maquininha, materiais, etc.</span>
                    </div>
                    <button 
                      onClick={() => setApplyTax(!applyTax)}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      {applyTax ? <ToggleRight className={`w-8 h-8 ${t.textHighlight}`} /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  {applyTax && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                      <span className="text-zinc-400 font-medium text-sm">R$</span>
                      <Input 
                        type="number"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(e.target.value)}
                        placeholder="0.00"
                        className="h-10 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black font-semibold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* LÍQUIDO A PAGAR */}
              <div className={`flex items-center justify-between p-5 rounded-xl text-white shadow-lg ${t.primaryBg}`}>
                <span className="font-bold uppercase tracking-wider text-xs">Líquido a Pagar</span>
                <span className="text-3xl font-black tracking-tight">R$ {saldoLiquidoAPagar.toFixed(2)}</span>
              </div>

            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950">
          <Button 
            disabled={isSaving || professional.balance <= 0 || (actionType === "PAGAMENTO" && saldoLiquidoAPagar < 0)}
            onClick={handleSave}
            className={`w-full h-14 rounded-xl text-base font-bold shadow-sm transition-all ${
              actionType === "VALE" 
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                : `${t.bgPrimary} ${t.textOnPrimary}`
            }`}
          >
            {isSaving ? "Processando..." : actionType === "PAGAMENTO" ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Liquidar e Zerar Conta</span>
            ) : "Registrar Vale"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}