"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, Scissors, User, ShoppingBag, Clock, CalendarPlus } from "lucide-react"

// MOCKS PARA DESENVOLVIMENTO VISUAL
const CATEGORIES = ["Todos", "Cabelo", "Barba", "Tratamentos", "Combos"]

const MOCK_SERVICES = [
  { id: "1", title: "Corte Degradê", category: "Cabelo", price: 45.00, duration: "45 min", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80" },
  { id: "2", title: "Barba Terapia (Toalha Quente)", category: "Barba", price: 35.00, duration: "30 min", img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" },
  { id: "3", title: "Corte + Barba VIP", category: "Combos", price: 75.00, duration: "1h 15m", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80" },
  { id: "4", title: "Platinado Global", category: "Tratamentos", price: 120.00, duration: "2h", img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80" }
]

const MOCK_PROFS = [
  { id: "1", name: "João Silva", role: "Barbeiro Sênior", img: "https://i.pravatar.cc/150?u=joao" },
  { id: "2", name: "Marcos", role: "Especialista em Colorimetria", img: "https://i.pravatar.cc/150?u=marcos" },
  { id: "3", name: "Lucas", role: "Barbeiro", img: "https://i.pravatar.cc/150?u=lucas" },
]

export default function ExplorarPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"SERVICOS" | "EQUIPE" | "PRODUTOS">("SERVICOS")
  const [activeCategory, setActiveCategory] = useState("Todos")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [activeTab])

  // 🔹 MOTOR DE DEEP LINKING: Aciona o Wizard Global já com dados pré-selecionados
  const bookSpecificService = (serviceId: string) => {
    // Pula para o passo 2 (Escolher Profissional) com o serviço salvo na URL
    router.push(`${pathname}?booking=true&step=2&service=${serviceId}`, { scroll: false })
  }

  const bookSpecificProf = (profId: string) => {
    // Abre no passo 1 (Escolher Serviço), mas já fixa o profissional na URL para o passo 3
    router.push(`${pathname}?booking=true&step=1&prof=${profId}`, { scroll: false })
  }

  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-500">
      
      {/* HEADER DE BUSCA E TABS */}
      <div className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 pt-12 pb-4 px-6">
        <h1 className="text-3xl font-black tracking-tight text-white mb-6">Explorar</h1>
        
        {/* Barra de Pesquisa */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar serviços, produtos..." 
            className="w-full h-14 pl-12 pr-4 bg-zinc-900 border border-white/10 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Segmented Control (Tabs) */}
        <div className="flex p-1 bg-zinc-900 rounded-xl border border-white/5">
          <TabButton active={activeTab === "SERVICOS"} onClick={() => setActiveTab("SERVICOS")} icon={<Scissors className="w-4 h-4" />} label="Serviços" />
          <TabButton active={activeTab === "EQUIPE"} onClick={() => setActiveTab("EQUIPE")} icon={<User className="w-4 h-4" />} label="Equipe" />
          <TabButton active={activeTab === "PRODUTOS"} onClick={() => setActiveTab("PRODUTOS")} icon={<ShoppingBag className="w-4 h-4" />} label="Shop" />
        </div>
      </div>

      <div className="px-6 pt-6 space-y-8">
        {isLoading ? (
          <SkeletonVitrine />
        ) : (
          <>
            {/* ========================================================= */}
            {/* ABA: SERVIÇOS */}
            {/* ========================================================= */}
            {activeTab === "SERVICOS" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Filtros de Categoria (Pills) */}
                <div className="flex overflow-x-auto gap-2 pb-6 no-scrollbar snap-x -mx-6 px-6">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`snap-start shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                        activeCategory === cat 
                          ? "bg-white text-zinc-950 border-white" 
                          : "bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {MOCK_SERVICES.filter(s => activeCategory === "Todos" || s.category === activeCategory).map(svc => (
                    <div key={svc.id} className="flex gap-4 p-3 bg-zinc-900 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                        <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center flex-1 py-1">
                        <h3 className="font-bold text-white text-base leading-tight mb-1">{svc.title}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-emerald-400 font-black text-sm">R$ {svc.price.toFixed(2)}</span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-zinc-500">
                            <Clock className="w-3 h-3" /> {svc.duration}
                          </span>
                        </div>
                        <button 
                          onClick={() => bookSpecificService(svc.id)}
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" /> Agendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* ABA: EQUIPE (Profissionais) */}
            {/* ========================================================= */}
            {activeTab === "EQUIPE" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {MOCK_PROFS.map(prof => (
                  <div key={prof.id} className="bg-zinc-900 rounded-2xl border border-white/5 p-4 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-800 mb-3 group-hover:border-white/30 transition-colors">
                      <img src={prof.img} alt={prof.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-white text-base">{prof.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1 mb-4">{prof.role}</p>
                    
                    <button 
                      onClick={() => bookSpecificProf(prof.id)}
                      className="w-full py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold transition-transform active:scale-95"
                    >
                      Agendar com ele
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================= */}
            {/* ABA: PRODUTOS (Shop) */}
            {/* ========================================================= */}
            {activeTab === "PRODUTOS" && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <ShoppingBag className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Flow Shop</h3>
                <p className="text-zinc-500 text-sm max-w-[250px]">
                  Em breve, compre seus produtos de grooming favoritos direto pelo app e retire na barbearia.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Subcomponente de Tab
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
        active ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon} {label}
    </button>
  )
}

// Skeleton Loader para a Vitrine
function SkeletonVitrine() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2 mb-6">
        <div className="h-10 w-24 bg-zinc-900 rounded-full border border-white/5"></div>
        <div className="h-10 w-24 bg-zinc-900 rounded-full border border-white/5"></div>
        <div className="h-10 w-24 bg-zinc-900 rounded-full border border-white/5"></div>
      </div>
      
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4 p-3 bg-zinc-900 rounded-2xl border border-white/5">
          <div className="w-24 h-24 rounded-xl bg-zinc-800 shrink-0"></div>
          <div className="flex-1 py-2 space-y-3">
            <div className="h-4 w-3/4 bg-zinc-800 rounded"></div>
            <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
            <div className="h-8 w-full bg-zinc-800 rounded-lg mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}