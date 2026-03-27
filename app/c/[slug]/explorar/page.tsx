"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Scissors, X, CalendarCheck } from "lucide-react"

// MOCKS: Dados simulando o Portfólio da Barbearia
const LOOKBOOK_FEED = [
  { 
    id: "look-1", 
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80", 
    style: "Fade Texturizado", 
    profId: "1", 
    profName: "Marcos", 
    serviceId: "mock-1" // ID do serviço "Degradê Navalhado" do seu Wizard
  },
  { 
    id: "look-2", 
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80", 
    style: "Barba Lenhador", 
    profId: "any", 
    profName: "Equipe", 
    serviceId: "mock-2" 
  },
  { 
    id: "look-3", 
    img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80", 
    style: "Social Moderno", 
    profId: "1", 
    profName: "Marcos", 
    serviceId: "mock-1" 
  },
  { 
    id: "look-4", 
    img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80", 
    style: "Platinado Global", 
    profId: "any", 
    profName: "Equipe", 
    serviceId: "mock-4" 
  }
]

export default function ExplorarPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Estado para o Modal de Visualização da Foto
  const [selectedLook, setSelectedLook] = useState<typeof LOOKBOOK_FEED[0] | null>(null)

  // 🔹 MOTOR DE DEEP LINKING: Pula direto pro passo de data/hora já com Serviço e Profissional setados!
  const bookThisLook = (look: typeof LOOKBOOK_FEED[0]) => {
    setSelectedLook(null) // Fecha o modal
    router.push(`${pathname}?booking=true&step=3&service=${look.serviceId}&prof=${look.profId}`, { scroll: false })
  }

  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-500 bg-black">
      
      {/* HEADER FIXO LUXUOSO */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl pt-12 pb-4 px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Inspirações</span>
            <h1 className="text-3xl font-semibold tracking-tighter text-white">Lookbook</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-900 active:scale-95 transition-transform">
            <Search className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        {/* Pílulas de Filtro (Subtis e elegantes) */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar snap-x">
          {["Todos", "Cabelo", "Barba", "Colorimetria"].map((cat, i) => (
            <button 
              key={cat}
              className={`snap-start shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all border ${
                i === 0 
                  ? "bg-zinc-100 text-black border-white" 
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FEED MASONRY (Estilo Pinterest) */}
      <div className="px-4 pt-4">
        <div className="columns-2 gap-4 space-y-4">
          {LOOKBOOK_FEED.map((look) => (
            <div 
              key={look.id} 
              onClick={() => setSelectedLook(look)}
              className="break-inside-avoid relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg shadow-black/50"
            >
              <img 
                src={look.img} 
                alt={look.style} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              {/* Overlay Escuro para Legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
              
              {/* Metadados da Foto */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium tracking-tight text-sm leading-tight">{look.style}</h3>
                <p className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider mt-1 flex items-center gap-1">
                  <Scissors className="w-3 h-3" /> {look.profName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL EXPANDIDO DE CONVERSÃO (Foco Total em Agendar) */}
      {/* ========================================================= */}
      {selectedLook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedLook(null)} />
          
          <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center animate-in zoom-in-95 duration-400">
            {/* Botão Fechar */}
            <button 
              onClick={() => setSelectedLook(null)}
              className="absolute -top-12 right-4 w-10 h-10 bg-zinc-900/80 rounded-full flex items-center justify-center text-white border border-zinc-700/50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Imagem Ampliada */}
            <div className="w-full rounded-[2rem] overflow-hidden border border-zinc-800/50 shadow-2xl relative">
              <img src={selectedLook.img} alt={selectedLook.style} className="w-full max-h-[60vh] object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pt-20">
                 <span className="text-cyan-400 text-xs uppercase font-bold tracking-widest mb-1 block">Visual Selecionado</span>
                 <h2 className="text-2xl font-semibold text-white tracking-tighter">{selectedLook.style}</h2>
                 <p className="text-zinc-400 text-sm mt-1">Por {selectedLook.profName}</p>
              </div>
            </div>

            {/* O BOTÃO MÁGICO DE CONVERSÃO */}
            <button 
              onClick={() => bookThisLook(selectedLook)}
              className="mt-6 w-full bg-gradient-to-br from-cyan-600 to-cyan-700 text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
              <CalendarCheck className="w-5 h-5" />
              Quero este visual
            </button>
          </div>
        </div>
      )}

    </div>
  )
}