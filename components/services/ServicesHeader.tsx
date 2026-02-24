"use client"

import { Plus } from "lucide-react"

export default function ServicesHeader({ state, actions }: { state: any, actions: any }) {
  const { config, t } = state
  const { openNewPanel } = actions

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Serviços {config.features.hasQuickProducts && "& Produtos"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Gerencie o catálogo e os preços do seu negócio.
        </p>
      </div>

      <button 
        onClick={openNewPanel}
        className={`w-full sm:w-auto group flex items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all active:scale-95`}
      >
        <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        Novo Item
      </button>
    </header>
  )
}