"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, CreditCard, QrCode, Plus, Minus, Package, Scissors, Users, Receipt } from "lucide-react"

export default function CheckoutDialog({ state, actions }: any) {
  // 🔹 RECEBEMOS OS availableProducts DIRETAMENTE DO CÉREBRO
  const { checkoutAppt, availableServices, availableProducts, professionals, isSaving, t } = state
  const { setCheckoutAppt, handleCheckout } = actions
  
  const products = availableProducts || []

  const [servicePrice, setServicePrice] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})
  const [method, setMethod] = useState<string>("")
  const [selectedProfId, setSelectedProfId] = useState<string>("")

  useEffect(() => {
    if (checkoutAppt) {
      const svc = availableServices.find((s: any) => s.title === checkoutAppt.service)
      setServicePrice(svc?.price ? svc.price.toString() : "")
      setSelectedProducts({})
      setMethod("")
      
      if (checkoutAppt.professional_id) {
        setSelectedProfId(checkoutAppt.professional_id)
      } else if (professionals && professionals.length > 0) {
        setSelectedProfId(professionals[0].id)
      } else {
        setSelectedProfId("")
      }
    }
  }, [checkoutAppt, availableServices, professionals])

  if (!checkoutAppt) return null

  const handleAddProduct = (productId: string) => setSelectedProducts(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const next = { ...prev }
      if (next[productId] > 1) next[productId] -= 1
      else delete next[productId]
      return next
    })
  }

  const parsedServicePrice = parseFloat(servicePrice) || 0
  const productsTotal = products.reduce((acc: number, p: any) => acc + (selectedProducts[p.id] || 0) * p.price, 0)
  const grossTotal = parsedServicePrice + productsTotal
  
  const TAXA_CARTAO_PERCENT = 0.05
  const feeAmount = method === 'CARTAO' ? (grossTotal * TAXA_CARTAO_PERCENT) : 0
  const liquidTotal = grossTotal - feeAmount

  const confirmCheckout = () => {
    if (!grossTotal || !method) return
    handleCheckout(checkoutAppt.id, parsedServicePrice, productsTotal, method, selectedProfId || null)
  }

  return (
    <Dialog open={!!checkoutAppt} onOpenChange={(isOpen) => { if (!isOpen) setCheckoutAppt(null) }}>
      <DialogContent className="sm:max-w-[480px] border-zinc-200/50 shadow-2xl rounded-[2rem] p-0 overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#09090b]">
        
        {/* HEADER */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${t.secondaryBg} ${t.textHighlight} shadow-inner`}>
              <Receipt className="w-5 h-5" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Checkout</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-500 font-medium text-sm ml-12">
            {checkoutAppt.client_name} • {checkoutAppt.service}
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          
          {/* PROFISSIONAL */}
          {professionals && professionals.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Users className="w-4 h-4" /> Quem atendeu?
              </Label>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
                {professionals.map((prof: any) => (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfId(prof.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all snap-start min-w-[200px] ${
                      selectedProfId === prof.id 
                        ? `border-${t.primaryBg.split('-')[1]}-500 bg-${t.primaryBg.split('-')[1]}-50 dark:bg-${t.primaryBg.split('-')[1]}-500/10 ring-1 ring-${t.primaryBg.split('-')[1]}-500/20 shadow-md` 
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-100 dark:border-white/5">
                      {prof.avatar_url ? (
                        <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">{prof.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${selectedProfId === prof.id ? t.textHighlight : 'text-zinc-900 dark:text-white'}`}>{prof.name}</p>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold truncate mt-0.5">Barbeiro</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VALOR DO SERVIÇO */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Scissors className="w-4 h-4" /> Valor do Serviço
            </Label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">R$</span>
              <Input 
                type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                className="pl-14 text-2xl h-16 font-semibold tracking-tight border-zinc-200 dark:border-white/10 rounded-2xl focus-visible:ring-2 focus-visible:ring-zinc-900 dark:bg-zinc-900/50 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* ADD PRODUTOS MINIMALISTA */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Package className="w-4 h-4" /> Venda de Produtos
            </Label>
            {products.length === 0 ? (
               <div className="p-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
                 <p className="text-sm font-medium text-zinc-500">Nenhum produto cadastrado no menu de Serviços.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-2">
                 {products.map((p: any) => {
                    const qty = selectedProducts[p.id] || 0;
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${qty > 0 ? 'border-zinc-900 bg-zinc-50 dark:border-white/20 dark:bg-zinc-800/50 shadow-sm' : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300'}`}>
                         <div className="flex-1 min-w-0 pr-4">
                           <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{p.name || p.title}</p>
                           <p className="text-xs font-semibold text-zinc-500 mt-0.5">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                         </div>
                         {qty === 0 ? (
                           <button onClick={() => handleAddProduct(p.id)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors">
                             <Plus className="w-4 h-4" />
                           </button>
                         ) : (
                           <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-950 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
                             <button onClick={() => handleRemoveProduct(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white hover:bg-zinc-50"><Minus className="w-4 h-4" /></button>
                             <span className="text-sm font-black w-6 text-center text-zinc-900 dark:text-white">{qty}</span>
                             <button onClick={() => handleAddProduct(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white hover:bg-zinc-50"><Plus className="w-4 h-4" /></button>
                           </div>
                         )}
                      </div>
                    )
                 })}
               </div>
            )}
          </div>

          {/* FORMA DE PAGAMENTO */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Forma de Recebimento
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <PaymentButton icon={<QrCode className="w-5 h-5 mb-2" />} label="Pix" value="PIX" selected={method === 'PIX'} onClick={() => setMethod('PIX')} />
              <PaymentButton icon={<CreditCard className="w-5 h-5 mb-2" />} label="Cartão" value="CARTAO" selected={method === 'CARTAO'} onClick={() => setMethod('CARTAO')} />
              <PaymentButton icon={<Banknote className="w-5 h-5 mb-2" />} label="Dinheiro" value="DINHEIRO" selected={method === 'DINHEIRO'} onClick={() => setMethod('DINHEIRO')} />
            </div>
          </div>

        </div>

        {/* FOOTER: MATEMÁTICA E CONFIRMAÇÃO */}
        <div className="p-8 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950">
           <div className="space-y-2 mb-6 text-sm font-medium">
             <div className="flex justify-between text-zinc-500">
               <span>Subtotal (Serviço + Produtos)</span>
               <span>R$ {grossTotal.toFixed(2)}</span>
             </div>
             {method === 'CARTAO' && (
               <div className="flex justify-between text-red-400">
                 <span>Taxa Maquininha (5%)</span>
                 <span>- R$ {feeAmount.toFixed(2)}</span>
               </div>
             )}
             <div className="flex justify-between text-zinc-900 dark:text-white font-bold text-lg pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
               <span>Líquido para o Caixa</span>
               <span>R$ {liquidTotal.toFixed(2)}</span>
             </div>
           </div>
           
           <Button 
            disabled={!grossTotal || !method || isSaving}
            onClick={confirmCheckout}
            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
          >
            {isSaving ? "Finalizando..." : "Confirmar Recebimento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentButton({ icon, label, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
        selected 
          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-md scale-105' 
          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-500 hover:text-zinc-900 dark:border-white/10 dark:bg-zinc-900/50 dark:hover:border-white/20 dark:hover:text-white'
      }`}
    >
      <div className={selected ? '' : 'opacity-70'}>{icon}</div>
      <span className={`text-xs font-bold uppercase tracking-wider mt-1 ${selected ? '' : 'opacity-70'}`}>{label}</span>
    </button>
  )
}