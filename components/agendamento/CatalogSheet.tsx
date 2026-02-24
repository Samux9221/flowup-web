"use client"

import { X } from "lucide-react"

export default function CatalogSheet({ state, actions }: { state: any, actions: any }) {
  const { products, brandColor } = state
  const { setActiveTab } = actions

  return (
    <div className="absolute inset-0 z-20 pt-8 px-4 pb-24 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Nossos Produtos</h2>
          <button onClick={() => setActiveTab('agendar')} className="bg-zinc-200/50 dark:bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product: any) => (
            <div key={product.id} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex flex-col justify-center flex-1">
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-2">{product.name}</h4>
                <span className="mt-1 font-bold" style={{ color: brandColor }}>R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="col-span-2 text-center py-10 text-zinc-400 text-sm">Nenhum produto cadastrado.</p>}
        </div>
      </div>
    </div>
  )
}