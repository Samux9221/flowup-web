"use client"

import { useState, useEffect, use } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { 
  Scissors, CalendarClock, Clock, ArrowRight, 
  ShoppingBag, Star, QrCode, MapPin, ChevronRight, AlertCircle
} from "lucide-react"

export default function CustomerHomeCockpit({ params }: { params: Promise<{ slug: string }> }) {
  // Desempacotamento obrigatório no Next.js 15+
  const { slug } = use(params)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // =======================================================================
  // ESTADOS GLOBAIS
  // =======================================================================
  const [isLoading, setIsLoading] = useState(true)
  const [tenantNotFound, setTenantNotFound] = useState(false)
  
  // Dados Reais do Supabase
  const [businessName, setBusinessName] = useState("Barbearia")
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // Estado Simulado do Cliente Logado
  const [hasAppointment, setHasAppointment] = useState(false) 

  // =======================================================================
  // MOTOR DE BUSCA (MULTI-TENANT BY SLUG)
  // =======================================================================
  useEffect(() => {
    const fetchTenantData = async () => {
      setIsLoading(true)

      // 1. Descobre quem é o dono da barbearia pela URL (Slug)
      const { data: settingsData, error: settingsError } = await supabase
        .from('business_settings')
        .select('*')
        .eq('slug', slug) // Correção aplicada aqui
        .single()

      if (settingsError || !settingsData) {
        setTenantNotFound(true)
        setIsLoading(false)
        return
      }

      const ownerId = settingsData.user_id
      setBusinessName(settingsData.business_name || "Barbearia")

      // 2. Busca o Catálogo Real (Serviços e Produtos) deste dono
      const { data: catalogData } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', ownerId)
        .order('title')

      if (catalogData) {
        setServices(catalogData.filter(item => item.type !== 'product'))
        setProducts(catalogData.filter(item => item.type === 'product'))
      }

      setIsLoading(false)
    }

    if (slug) { // Correção aplicada aqui
      fetchTenantData()
    }
  }, [slug, supabase]) // Correção aplicada aqui


  // =======================================================================
  // PROGRAMAÇÃO DEFENSIVA: ROTA INEXISTENTE
  // =======================================================================
  if (tenantNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
          <AlertCircle className="w-8 h-8 text-zinc-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Página não encontrada</h1>
        <p className="text-zinc-400 text-sm">A barbearia que você está procurando não existe ou mudou de endereço.</p>
      </div>
    )
  }

  if (isLoading) return <SkeletonCockpit />

  // =======================================================================
  // RENDERIZAÇÃO DA INTERFACE
  // =======================================================================
  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-700">
      
      {/* HEADER DA BARBEARIA */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Bom dia, Visitante</h2>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 truncate max-w-[200px]">
            {businessName}
          </h1>
        </div>
        <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
          <Scissors className="w-5 h-5 text-zinc-400" />
        </div>
      </header>

      {/* TOGGLE DE DESENVOLVIMENTO PARA A ÁREA DO CLIENTE */}
      <div className="px-6 mb-4">
        <button 
          onClick={() => setHasAppointment(!hasAppointment)}
          className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full uppercase font-bold tracking-widest hover:text-white transition-colors"
        >
          Mock Cliente: {hasAppointment ? "Estado Ativo" : "Estado Zero"}
        </button>
      </div>

      <div className="px-6 space-y-8">
        
        {/* ========================================================= */}
        {/* SMART CARD (O Cérebro da Tela) */}
        {/* ========================================================= */}
        {hasAppointment ? (
          <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 p-6 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <QrCode className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Confirmado</span>
              </div>
              
              <h3 className="text-3xl font-black text-white tracking-tight mb-1">Amanhã, 18:30</h3>
              <p className="text-zinc-400 font-medium text-sm mb-6">Corte Degradê + Barba com João</p>
              
              <div className="flex items-center gap-3">
                <button className="flex-1 bg-white text-zinc-950 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-200 transition-colors active:scale-95">
                  Fazer Check-in (QR)
                </button>
                <button className="p-3.5 rounded-xl bg-zinc-800 text-zinc-300 border border-white/5 hover:bg-zinc-700 transition-colors active:scale-95">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight mb-1">Corte Novamente</h3>
                <p className="text-zinc-400 text-sm font-medium">Já fazem 22 dias desde o seu último corte.</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-zinc-400" />
              </div>
            </div>
            
            <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Degradê Navalhado</p>
                <p className="text-zinc-500 text-xs font-semibold mt-0.5">Com Profissional • R$ 45,00</p>
              </div>
              <Clock className="w-5 h-5 text-zinc-600" />
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-200 transition-all active:scale-95">
              Repetir Agendamento <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* ATALHOS DE NAVEGAÇÃO RAPIDA */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors text-left group">
            <Star className="w-6 h-6 text-zinc-400 mb-3 group-hover:text-amber-500 transition-colors" />
            <span className="text-white font-bold text-sm">Meus Pontos</span>
            <span className="text-zinc-500 text-xs font-medium mt-1">Faltam 2 cortes</span>
          </button>
          <button className="flex flex-col p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors text-left group">
            <Scissors className="w-6 h-6 text-zinc-400 mb-3 group-hover:text-white transition-colors" />
            <span className="text-white font-bold text-sm">Profissionais</span>
            <span className="text-zinc-500 text-xs font-medium mt-1">Ver equipe</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* SERVIÇOS REAIS DO SUPABASE */}
        {/* ========================================================= */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Scissors className="w-5 h-5 text-zinc-500" /> Nossos Serviços
            </h3>
            <button className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center">
              Ver todos <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          {services.length === 0 ? (
            <div className="p-6 text-center border border-white/5 rounded-2xl bg-zinc-900/30">
              <p className="text-zinc-500 text-sm font-medium">Nenhum serviço cadastrado.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
              {services.map((servico) => (
                <div key={servico.id} className="snap-start shrink-0 w-64 relative group cursor-pointer">
                  <div className="h-32 w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden relative flex items-center justify-center">
                    {/* Fallback de Imagem Real */}
                    {servico.image_url ? (
                      <img src={servico.image_url} alt={servico.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center opacity-50">
                        <Scissors className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h4 className="text-white text-base font-bold leading-tight drop-shadow-md">{servico.title}</h4>
                        <p className="text-zinc-300 text-xs font-semibold mt-1 flex items-center gap-1.5 drop-shadow-md">
                          <Clock className="w-3 h-3 text-zinc-400" /> {servico.duration_minutes || 30} min
                        </p>
                      </div>
                      <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl">
                        R$ {Number(servico.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* PRODUTOS REAIS DO SUPABASE */}
        {/* ========================================================= */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-500" /> Para o seu estilo
            </h3>
            <button className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center">
              Ver loja <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          {products.length === 0 ? (
            <div className="p-6 text-center border border-white/5 rounded-2xl bg-zinc-900/30">
              <p className="text-zinc-500 text-sm font-medium">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
              {products.map((produto) => (
                <div key={produto.id} className="snap-start shrink-0 w-40 relative group cursor-pointer">
                  <div className="h-40 w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden mb-3 relative flex items-center justify-center">
                    {produto.image_url ? (
                      <img src={produto.image_url} alt={produto.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center opacity-60">
                         <ShoppingBag className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl">
                        R$ {Number(produto.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-white text-sm font-bold leading-tight">{produto.title}</h4>
                  <button className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold mt-1.5 hover:text-white transition-colors">
                    + Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function SkeletonCockpit() {
  return (
    <div className="px-6 pt-12 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-zinc-800 rounded-full"></div>
          <div className="h-6 w-40 bg-zinc-800 rounded-full"></div>
        </div>
        <div className="h-12 w-12 bg-zinc-800 rounded-full"></div>
      </div>
      
      <div className="h-56 w-full bg-zinc-900 rounded-[2rem] border border-white/5"></div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-zinc-900 rounded-2xl border border-white/5"></div>
        <div className="h-28 bg-zinc-900 rounded-2xl border border-white/5"></div>
      </div>
      
      <div className="space-y-4 pt-4">
        <div className="h-6 w-48 bg-zinc-800 rounded-full"></div>
        <div className="flex gap-4">
          <div className="h-32 w-64 bg-zinc-900 rounded-2xl shrink-0 border border-white/5"></div>
          <div className="h-32 w-64 bg-zinc-900 rounded-2xl shrink-0 border border-white/5"></div>
        </div>
      </div>
    </div>
  )
}