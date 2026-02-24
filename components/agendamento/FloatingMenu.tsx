"use client"

import { Calendar as CalendarIcon, Image as ImageIcon, Package } from "lucide-react"

export default function FloatingMenu({ state, actions }: { state: any, actions: any }) {
  const { activeTab, brandColor } = state
  const { setActiveTab } = actions

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl border border-zinc-200/50 dark:bg-zinc-900/90 dark:border-white/10">
        
        <button 
          onClick={() => setActiveTab('agendar')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === 'agendar' ? 'text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
          style={activeTab === 'agendar' ? { backgroundColor: brandColor } : {}}
        >
          <CalendarIcon className="h-4 w-4" /> <span className="hidden sm:inline">Agendar</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === 'portfolio' ? 'text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
          style={activeTab === 'portfolio' ? { backgroundColor: brandColor } : {}}
        >
          <ImageIcon className="h-4 w-4" /> <span className="hidden sm:inline">Fotos</span>
        </button>

        <button 
          onClick={() => setActiveTab('catalogo')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === 'catalogo' ? 'text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
          style={activeTab === 'catalogo' ? { backgroundColor: brandColor } : {}}
        >
          <Package className="h-4 w-4" /> <span className="hidden sm:inline">Produtos</span>
        </button>

      </div>
    </div>
  )
}