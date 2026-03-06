"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, CreditCard, QrCode, Plus, Minus, Package, Scissors, Users } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"

export default function CheckoutDialog({ state, actions }: any) {
  const { checkoutAppt, availableServices, professionals, isSaving, t, userId } = state
  const { setCheckoutAppt, handleCheckout } = actions
  const { products, loading: productsLoading } = useProducts(userId)

  const [servicePrice, setServicePrice] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({})
  const [method, setMethod] = useState<string>("")
  
  // 🔹 O ESTADO DO PROFISSIONAL GARANTIDO NO ESCOPO 🔹
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

  // Separação cirúrgica da matemática
  const parsedServicePrice = parseFloat(servicePrice) || 0
  const productsTotal = products.reduce((acc: number, p: any) => acc + (selectedProducts[p.id] || 0) * p.price, 0)
  const finalTotal = parsedServicePrice + productsTotal

  const confirmCheckout = () => {
    if (!finalTotal || !method) return
    // 🔹 CHAMADA BLINDADA: Enviamos Serviço e Produto separados para o motor calcular as regras exatas
    handleCheckout(checkoutAppt.id, parsedServicePrice, productsTotal, method, selectedProfId || null)
  }

  return (
    <Dialog open={!!checkoutAppt} onOpenChange={(isOpen) => { if (!isOpen) setCheckoutAppt(null) }}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 bg-white/50 backdrop-blur-md z-10">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-zinc-900">Finalizar Atendimento</DialogTitle>
          <DialogDescription className="text-zinc-500 mt-1">
            {checkoutAppt.client_name} • {checkoutAppt.service}
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          
          {/* SECÇÃO: QUEM PRESTOU O SERVIÇO? */}
          {professionals && professionals.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <Users className="w-4 h-4" /> Profissional Responsável
              </Label>
              <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                {professionals.map((prof: any) => (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfId(prof.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all snap-start min-w-[200px] ${
                      selectedProfId === prof.id 
                        ? `border-${t.primaryBg.split('-')[1]}-500 bg-${t.primaryBg.split('-')[1]}-50 ring-1 ring-${t.primaryBg.split('-')[1]}-500/20` 
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                      {prof.avatar_url ? (
                        <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-bold text-zinc-500`}>
                          {prof.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${selectedProfId === prof.id ? t.textHighlight : 'text-zinc-900'}`}>{prof.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{prof.bio || 'Membro'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Valor do Serviço */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <Scissors className="w-4 h-4" /> Valor do Serviço
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">R$</span>
              <Input 
                type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                className="pl-12 text-2xl h-14 font-medium tracking-tight border-zinc-200 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-900"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <Package className="w-4 h-4" /> Adicionar Produtos
            </Label>
            {productsLoading ? (
               <div className="animate-pulse flex gap-3 overflow-x-auto pb-2">
                 {[1,2,3].map(i => <div key={i} className="h-16 w-full bg-zinc-100 rounded-xl shrink-0"></div>)}
               </div>
            ) : products.length === 0 ? (
               <div className="p-4 rounded-xl border border-dashed border-zinc-200 text-center bg-zinc-50/50">
                 <p className="text-sm font-medium text-zinc-500">Nenhum produto cadastrado.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {products.map((p: any) => {
                    const qty = selectedProducts[p.id] || 0;
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${qty > 0 ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900/10' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}>
                         <div className="flex-1 min-w-0 pr-2">
                           <p className="text-sm font-semibold text-zinc-900 truncate">{p.name}</p>
                           <p className="text-xs font-medium text-zinc-500">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                         </div>
                         {qty === 0 ? (
                           <button onClick={() => handleAddProduct(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                             <Plus className="w-4 h-4" />
                           </button>
                         ) : (
                           <div className="flex items-center gap-2 bg-zinc-200/50 rounded-lg p-1">
                             <button onClick={() => handleRemoveProduct(p.id)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm text-zinc-900"><Minus className="w-3 h-3" /></button>
                             <span className="text-xs font-bold w-4 text-center text-zinc-900">{qty}</span>
                             <button onClick={() => handleAddProduct(p.id)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm text-zinc-900"><Plus className="w-3 h-3" /></button>
                           </div>
                         )}
                      </div>
                    )
                 })}
               </div>
            )}
          </div>

          {/* Pagamento */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Forma de Pagamento
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <PaymentButton icon={<QrCode className="w-5 h-5 mb-2" />} label="Pix" value="PIX" selected={method === 'PIX'} onClick={() => setMethod('PIX')} />
              <PaymentButton icon={<CreditCard className="w-5 h-5 mb-2" />} label="Cartão" value="CARTAO" selected={method === 'CARTAO'} onClick={() => setMethod('CARTAO')} />
              <PaymentButton icon={<Banknote className="w-5 h-5 mb-2" />} label="Dinheiro" value="DINHEIRO" selected={method === 'DINHEIRO'} onClick={() => setMethod('DINHEIRO')} />
            </div>
            {method === 'CARTAO' && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg font-medium border border-amber-100 mt-2">
                Aviso: Uma taxa de 5% será deduzida deste pagamento pelo sistema para simular os custos da maquininha.
              </p>
            )}
          </div>

        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/80 backdrop-blur-md">
           <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Total a receber</span>
             <span className="text-3xl font-bold tracking-tight text-zinc-900">
               R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </span>
           </div>
           
           <Button 
            disabled={!finalTotal || !method || isSaving}
            onClick={confirmCheckout}
            className={`w-full h-14 rounded-xl text-lg font-semibold shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}
          >
            {isSaving ? "Processando..." : "Confirmar Recebimento"}
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
      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
        selected 
          ? 'border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900' 
          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-500 hover:text-zinc-900'
      }`}
    >
      <div className={selected ? 'text-zinc-900' : ''}>{icon}</div>
      <span className={`text-xs font-medium ${selected ? 'text-zinc-900' : ''}`}>{label}</span>
    </button>
  )
}