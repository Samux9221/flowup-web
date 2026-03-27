"use client"

import { useState, useEffect, use } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { 
  Bell, AlertCircle, RotateCcw, ChevronRight, 
  Sparkles, Star, Clock, CalendarCheck, MapPin, Scissors
} from "lucide-react"

// MOCK: Simulando o estado preditivo do cliente
const MOCK_USER = {
  firstName: "Samuel",
  points: 1200,
  nextAppointment: {
    id: "apt-123",
    date: "Amanhã, 12 de Out",
    time: "14:30",
    service: "Degradê Navalhado",
    profName: "Marcos"
  }, // Mude para `null` para ver o estado de "Agendar Agora"
  lastAppointment: {
    serviceId: "mock-1",
    profId: "1",
    dateStr: "12 de Set"
  }
}

export default function CustomerHomeCockpit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const pathname = usePathname()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [tenantNotFound, setTenantNotFound] = useState(false)
  const [businessName, setBusinessName] = useState("Carregando...")
  const [services, setServices] = useState<any[]>([])

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
      }
      setIsLoading(false)
    }

    if (slug) fetchTenantData()
  }, [slug, supabase])


  // 🔹 AÇÕES DE DEEP LINKING (Conversão Rápida)
  const openNewBooking = () => {
    router.push(`${pathname}?booking=true&step=1`, { scroll: false })
  }

  const repeatLastBooking = () => {
    // Pula direto pro passo de escolher o horário (Passo 3), já com serviço e profissional da última vez
    const { serviceId, profId } = MOCK_USER.lastAppointment
    router.push(`${pathname}?booking=true&step=3&service=${serviceId}&prof=${profId}`, { scroll: false })
  }


  if (tenantNotFound) return <ErrorState />
  if (isLoading) return <SkeletonCockpit />

  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-700 bg-black">
      
      {/* HEADER DE BOAS VINDAS */}
      <header className="flex justify-between items-center px-6 pt-12 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{businessName}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tighter">Olá, {MOCK_USER.firstName}</h1>
        </div>
        <button className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center active:scale-95 transition-transform border border-zinc-800 relative">
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-cyan-500 rounded-full border-2 border-zinc-900"></span>
        </button>
      </header>

      <div className="px-6 space-y-8">
        
        {/* ========================================================= */}
        {/* HERO SECTION (PREDITIVA) */}
        {/* ========================================================= */}
        {MOCK_USER.nextAppointment ? (
          // ESTADO 1: O cliente JÁ TEM um agendamento (Apple Wallet Style)
          <section className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-zinc-800 p-1 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="bg-zinc-950 rounded-[1.8rem] p-6 relative z-10 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Próximo Agendamento</span>
              </div>
              
              <h2 className="text-3xl font-semibold text-white tracking-tighter mb-1">
                {MOCK_USER.nextAppointment.time}
              </h2>
              <p className="text-zinc-400 text-sm font-medium mb-6">{MOCK_USER.nextAppointment.date}</p>
              
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 mb-6">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{MOCK_USER.nextAppointment.service}</p>
                  <p className="text-xs text-zinc-500">com {MOCK_USER.nextAppointment.profName}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white text-black py-3.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                  Ver Detalhes
                </button>
                <button className="w-12 flex items-center justify-center bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl active:scale-95 transition-transform">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        ) : (
          // ESTADO 2: O cliente NÃO TEM agendamento (CTA Principal)
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-7 shadow-2xl group cursor-pointer" onClick={openNewBooking}>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-600/15 rounded-full blur-[60px] transition-all group-hover:bg-cyan-500/20" />
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
                <CalendarCheck className="w-6 h-6 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white mb-2">
                  Pronto para um<br />novo visual?
                </h2>
                <p className="text-zinc-400 text-sm">Escolha seu serviço e horário ideal.</p>
              </div>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_4px_20px_rgba(6,182,212,0.15)]">
                Agendar Horário <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ATALHOS INTELIGENTES (Ação com 1 Clique) */}
        {/* ========================================================= */}
        <section className="grid grid-cols-2 gap-3">
          {/* Repetir Serviço */}
          <div 
            onClick={repeatLastBooking}
            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between aspect-square active:scale-[0.96] transition-all cursor-pointer hover:bg-zinc-900"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <RotateCcw className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-[15px] leading-tight mb-1">Repetir<br/>Último</h4>
              <p className="text-[11px] text-zinc-500">{MOCK_USER.lastAppointment.dateStr}</p>
            </div>
          </div>

          {/* Clube VIP (Dinâmico) */}
          <div 
            onClick={() => router.push(`/c/${slug}/clube`)}
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between aspect-square active:scale-[0.96] transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4">
              <Star className="w-8 h-8 text-cyan-500/20 fill-cyan-500/10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-950/50 flex items-center justify-center border border-cyan-900/50 z-10">
              <Star className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="z-10">
              <h4 className="font-semibold text-white text-[15px] leading-tight mb-1">Clube VIP</h4>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-cyan-500 h-full w-[60%] rounded-full"></div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 tracking-wide uppercase font-bold">1200 Pontos</p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* LISTA DE SERVIÇOS (Acesso Rápido) */}
        {/* ========================================================= */}
        <section className="pt-2 pb-10">
          <div className="flex justify-between items-end mb-5">
            <h3 className="text-lg font-semibold text-white tracking-tight">Serviços</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Todos</span>
          </div>
          
          <div className="flex flex-col gap-3">
            {services.map((servico) => (
              <div 
                key={servico.id} 
                onClick={() => router.push(`${pathname}?booking=true&step=2&service=${servico.id}`)}
                className="group flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 active:scale-[0.98] transition-all cursor-pointer hover:border-zinc-700"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-zinc-100 text-[15px] tracking-tight group-hover:text-white transition-colors">
                    {servico.title}
                  </span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {servico.duration_minutes || 30} min
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white text-[15px] font-medium tracking-tighter">
                    R$ {Number(servico.price).toFixed(2)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-black" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in bg-black">
      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
        <AlertCircle className="w-6 h-6 text-zinc-600" />
      </div>
      <h1 className="text-xl font-semibold text-white mb-2 tracking-tight">Página não encontrada</h1>
      <p className="text-zinc-500 text-sm">O estabelecimento não existe ou mudou de endereço.</p>
    </div>
  )
}

function SkeletonCockpit() {
  return (
    <div className="px-6 pt-12 space-y-8 animate-pulse bg-black min-h-[100dvh]">
      <div className="flex justify-between items-center pb-2">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-900 rounded-full border border-zinc-800"></div>
          <div className="h-7 w-36 bg-zinc-900 rounded-full border border-zinc-800"></div>
        </div>
        <div className="h-11 w-11 bg-zinc-900 rounded-full border border-zinc-800"></div>
      </div>
      <div className="h-[200px] w-full bg-zinc-900/50 rounded-[2rem] border border-zinc-800"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-36 w-full bg-zinc-900/50 rounded-3xl border border-zinc-800"></div>
        <div className="h-36 w-full bg-zinc-900/50 rounded-3xl border border-zinc-800"></div>
      </div>
      <div className="space-y-3">
        <div className="h-20 w-full bg-zinc-900/30 rounded-2xl border border-zinc-800"></div>
        <div className="h-20 w-full bg-zinc-900/30 rounded-2xl border border-zinc-800"></div>
      </div>
    </div>
  )
}