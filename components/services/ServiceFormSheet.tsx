"use client"

import { Loader2, DollarSign, Clock, Package } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export default function ServiceFormSheet({ state, actions }: { state: any, actions: any }) {
  const { isSheetOpen, isSaving, editingId, title, price, duration, type, config, t, ServiceIcon } = state
  const { setIsSheetOpen, setTitle, setPrice, setDuration, setType, handleSaveService, resetForm } = actions

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) resetForm(); }}>
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
  )
}