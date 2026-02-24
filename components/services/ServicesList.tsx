"use client"

import { useEffect, useRef } from "react"
import { Loader2, MoreVertical, Edit2, Trash2, Clock, Package } from "lucide-react"

export default function ServicesList({ state, actions }: { state: any, actions: any }) {
  const { services, isLoadingData, t, ServiceIcon, activeDropdown } = state
  const { setActiveDropdown, openEditPanel, handleDelete } = actions
  
  // Ref local para fechar o dropdown ao clicar fora
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setActiveDropdown])

  return (
    <div className={`relative ${t.radius} border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10`}>
      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Carregando catálogo...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-center">
          <ServiceIcon className={`h-12 w-12 mb-4 opacity-20 ${t.textHighlight}`} />
          <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">Nenhum item cadastrado.</p>
          <p className="text-sm mt-1">Clique em "Novo Item" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((svc: any) => (
            <div 
              key={svc.id} 
              className={`group relative flex items-center justify-between ${t.radius} border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 dark:border-white/5 dark:bg-zinc-900/50`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center ${t.radius} shrink-0 ${svc.type === 'product' ? 'bg-amber-100/80 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : `${t.secondaryBg} ${t.textHighlight}`}`}>
                  {svc.type === 'product' ? <Package className="h-5 w-5" /> : <ServiceIcon className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{svc.title}</p>
                    {svc.type === 'product' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">PRODUTO</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      R$ {Number(svc.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {svc.type !== 'product' && (
                      <div className="flex items-center text-xs text-zinc-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {svc.duration_minutes} min
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative" ref={activeDropdown === svc.id ? dropdownRef : null}>
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === svc.id ? null : svc.id)}
                  className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {activeDropdown === svc.id && (
                  <div className={`absolute right-0 top-10 z-50 w-36 ${t.radius} border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 dark:border-white/10 dark:bg-zinc-900`}>
                    <button 
                      onClick={() => openEditPanel(svc)}
                      className={`flex w-full items-center gap-2 ${t.radius} px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`}
                    >
                      <Edit2 className="h-4 w-4" /> Editar
                    </button>
                    <button 
                      onClick={() => { setActiveDropdown(null); handleDelete(svc.id); }}
                      className={`flex w-full items-center gap-2 ${t.radius} px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10`}
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}