"use client"

import { useState, useEffect, use } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { 
  Bell, AlertCircle, RotateCcw, ChevronRight, 
  ImageIcon, Star, Clock, CalendarCheck
} from "lucide-react"

export default function CustomerHomeCockpit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [tenantNotFound, setTenantNotFound] = useState(false)
  
  const [businessName, setBusinessName] = useState("Carregando...")
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // Mock do cliente logado
  const userFirstName = "Samuel"

  useEffect(() => {
    const fetchTenantData = async () => {
      setIsLoading(true)

      const { data: settingsData, error: settingsError } = await supabase
        .from('business_settings')
        .select('*')
        .eq('slug', slug)
        .single()

      if (settingsError || !settingsData) {
        setTenantNotFound(true)
        setIsLoading(false)
        return
      }

      setBusinessName(settingsData.business_name || "Estúdio")

      const { data: catalogData } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', settingsData.user_id)
        .order('title')

      if (catalogData) {
        setServices(catalogData.filter(item => item.type !== 'product'))
        setProducts(catalogData.filter(item => item.type === 'product'))
      }

      setIsLoading(false)
    }

    if (slug) fetchTenantData()
  }, [slug, supabase])


  if (tenantNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mb-6 border border-zinc-900 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
          <AlertCircle className="w-6 h-6 text-zinc-600" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 mb-2 tracking-tight">Página não encontrada</h1>
        <p className="text-zinc-600 text-sm">O estabelecimento não existe ou mudou de endereço.</p>
      </div>
    )
  }

  if (isLoading) return <SkeletonCockpit />

  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-700 bg-black">
      
      {/* HEADER PREMIUM */}
      <header className="flex justify-between items-center px-6 pt-12 pb-7">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{businessName}</span>
          <h1 className="text-2xl font-semibold text-white tracking-tighter">Olá, {userFirstName}</h1>
        </div>
        <button className="w-11 h-11 rounded-full bg-zinc-950/60 flex items-center justify-center active:scale-[0.96] transition-transform border border-zinc-900/80 hover:bg-zinc-900 shadow-[inset_0_0_10px_rgba(255,255,255,0.01)]">
          <Bell className="w-5 h-5 text-zinc-500" />
        </button>
      </header>

      <div className="px-6 space-y-9">
        
        {/* HERO CARD: "Efeito Wise/Apple Card" (Textura Metálica e Luz) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 to-black border border-zinc-900/80 p-7 shadow-2xl shadow-black/60">
          {/* Efeito de Luz Interna (Shimmer) - O segredo do luxo */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-zinc-800/10 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <CalendarCheck className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed tracking-wide pr-8">
                Que tal agendar um horário?
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white pr-4">
              PRONTO PARA UM<br />NOVO VISUAL?
            </h2>

            {/* BOTÃO PRINCIPAL (Destaque Wise Style) */}
            <button className="w-full bg-gradient-to-br from-cyan-600 to-cyan-700 text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all hover:scale-[1.01] shadow-[0_4px_20px_rgba(6,182,212,0.15)] group">
              <CalendarCheck className="w-5 h-5 transition-transform group-hover:rotate-12" />
              Agendar Horário
            </button>
          </div>
        </section>

        {/* QUICK ACTION: Widget iOS Style */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Ação Rápida</h3>
          <div className="group bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:bg-zinc-900/50 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
                <RotateCcw className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-zinc-100 text-sm tracking-tight">Repetir Último Corte</span>
                <span className="text-xs text-zinc-600">Marcos • 12 de Out</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </section>

        {/* GRID PREMIUM: Materiais e Profundidade */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-zinc-950 to-black border border-zinc-900 rounded-[2rem] p-6 active:scale-[0.96] transition-transform cursor-pointer flex flex-col justify-between aspect-square group shadow-xl shadow-black/40">
            <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center mb-5 border border-zinc-800 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base mb-1 tracking-tight">MEU ESTILO</h4>
              <p className="text-xs text-zinc-600 leading-tight">Fotos e referências</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-950 to-black border border-zinc-900 rounded-[2rem] p-6 active:scale-[0.96] transition-transform cursor-pointer flex flex-col justify-between aspect-square group shadow-xl shadow-black/40 relative">
             <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center mb-5 border border-zinc-800 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base mb-1 tracking-tight">CLUBE VIP</h4>
              <p className="text-xs text-zinc-600 leading-tight">1,200 Pontos</p>
            </div>
             <div className="absolute top-6 right-6 w-3 h-3 bg-cyan-600 rounded-full blur-[3px]"></div>
          </div>
        </section>

        {/* CATÁLOGO REAL: Lista Polida (Apenas texto e dados, super clean) */}
        <section className="pt-2">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 mb-5">Menu de Serviços</h3>
          
          {services.length === 0 ? (
            <div className="p-8 text-center border border-zinc-900 rounded-2xl bg-zinc-950/20">
              <p className="text-zinc-700 text-sm">Nenhum serviço disponível.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {services.map((servico) => (
                <div key={servico.id} className="group flex items-center justify-between pb-4 border-b border-zinc-900 active:scale-[0.99] transition-transform cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-zinc-100 text-[15px] tracking-tight group-hover:text-cyan-400 transition-colors">
                      {servico.title}
                    </span>
                    <span className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {servico.duration_minutes || 30} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-[15px] font-semibold tabular-nums tracking-tighter">
                      R$ {Number(servico.price).toFixed(2)}
                    </span>
                     <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function SkeletonCockpit() {
  return (
    <div className="px-6 pt-12 space-y-9 animate-pulse bg-black min-h-full">
      <div className="flex justify-between items-center pb-2">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-950 rounded-full border border-zinc-900"></div>
          <div className="h-7 w-36 bg-zinc-950 rounded-full border border-zinc-900"></div>
        </div>
        <div className="h-11 w-11 bg-zinc-950 rounded-full border border-zinc-900"></div>
      </div>
      <div className="h-44 w-full bg-zinc-950/70 rounded-3xl border border-zinc-900"></div>
      <div className="h-20 w-full bg-zinc-950/40 rounded-2xl border border-zinc-900"></div>
       <div className="grid grid-cols-2 gap-4">
          <div className="h-40 w-full bg-zinc-950/70 rounded-[2rem] border border-zinc-900"></div>
          <div className="h-40 w-full bg-zinc-950/70 rounded-[2rem] border border-zinc-900"></div>
       </div>
    </div>
  )
}