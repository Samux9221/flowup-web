"use client"

import { X, Filter } from "lucide-react"

export default function PortfolioSheet({ state, actions }: { state: any, actions: any }) {
  const { photos, activePhotoCategory, photoCategories, brandColor } = state
  const { setActiveTab, setActivePhotoCategory } = actions

  return (
    <div className="absolute inset-0 z-20 pt-8 px-4 pb-24 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Nossos Trabalhos</h2>
          <button onClick={() => setActiveTab('agendar')} className="bg-zinc-200/50 dark:bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        
        {/* Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
          {photoCategories.map((cat: string) => (
            <button key={cat} onClick={() => setActivePhotoCategory(cat)} style={activePhotoCategory === cat ? { backgroundColor: brandColor, color: '#fff' } : {}} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${activePhotoCategory !== cat ? 'bg-white text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800' : ''}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {photos.filter((p: any) => activePhotoCategory === 'Todos' || p.category === activePhotoCategory).map((photo: any) => (
            <div key={photo.id} className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm relative group">
              <img src={photo.url} alt="Trabalho" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute bottom-2 left-2"><span className="text-[10px] font-medium text-white bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">{photo.category}</span></div>
            </div>
          ))}
          {photos.length === 0 && <p className="col-span-2 text-center py-10 text-zinc-400 text-sm">Nenhuma foto adicionada ainda.</p>}
        </div>
      </div>
    </div>
  )
}