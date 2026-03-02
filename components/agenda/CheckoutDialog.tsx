"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, CreditCard, QrCode } from "lucide-react"

export default function CheckoutDialog({ state, actions }: any) {
  const { checkoutAppt, availableServices, isSaving, t } = state
  const { setCheckoutAppt, handleCheckout } = actions

  const [price, setPrice] = useState<string>("")
  const [method, setMethod] = useState<string>("")

  useEffect(() => {
    if (checkoutAppt) {
      const svc = availableServices.find((s: any) => s.title === checkoutAppt.service)
      setPrice(svc?.price ? svc.price.toString() : "")
      setMethod("")
    }
  }, [checkoutAppt, availableServices])

  if (!checkoutAppt) return null

  const confirmCheckout = () => {
    if (!price || !method) return
    handleCheckout(checkoutAppt.id, parseFloat(price), method)
  }

  return (
    <Dialog open={!!checkoutAppt} onOpenChange={(isOpen) => { if (!isOpen) setCheckoutAppt(null) }}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b border-zinc-100">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-zinc-900">
            Finalizar Atendimento
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {checkoutAppt.client_name} • {checkoutAppt.service}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Valor Cobrado (R$)</Label>
            <Input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="text-3xl h-14 font-light tracking-tighter border-0 border-b-2 border-zinc-100 rounded-none focus-visible:ring-0 focus-visible:border-zinc-900 px-0 shadow-none transition-colors"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-3">
              <PaymentButton 
                icon={<QrCode className="w-6 h-6 mb-2" />} 
                label="Pix" value="PIX" 
                selected={method === 'PIX'} onClick={() => setMethod('PIX')} t={t} 
              />
              <PaymentButton 
                icon={<CreditCard className="w-6 h-6 mb-2" />} 
                label="Cartão" value="CARTAO" 
                selected={method === 'CARTAO'} onClick={() => setMethod('CARTAO')} t={t} 
              />
              <PaymentButton 
                icon={<Banknote className="w-6 h-6 mb-2" />} 
                label="Dinheiro" value="DINHEIRO" 
                selected={method === 'DINHEIRO'} onClick={() => setMethod('DINHEIRO')} t={t} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            disabled={!price || !method || isSaving}
            onClick={confirmCheckout}
            className={`w-full h-12 rounded-xl text-base font-medium shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}
          >
            {isSaving ? "Registrando..." : "Confirmar e Receber"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentButton({ icon, label, selected, onClick, t }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
        selected 
          ? 'border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900' 
          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-500 hover:text-zinc-900'
      }`}
    >
      <div className={selected ? t.textHighlight : ''}>{icon}</div>
      <span className={`text-xs font-medium ${selected ? 'text-zinc-900' : ''}`}>{label}</span>
    </button>
  )
}