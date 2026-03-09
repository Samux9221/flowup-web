"use client"

import { useState, useEffect } from "react"
import { 
  User, Settings, Coffee, MessageSquare, VolumeX, 
  Camera, History, LogOut, ChevronRight, Beer, 
  Gamepad2, FileText, CheckCircle2
} from "lucide-react"

// MOCKS PARA DESENVOLVIMENTO
const MOCK_USER = {
  name: "Marcos de Almeida",
  phone: "+55 11 99999-9999",
  memberSince: "2024",
  avatar: "https://i.pravatar.cc/150?u=marcos_almeida"
}

const MOCK_PREFERENCES = {
  beverage: "coffee", // coffee, beer, water, none
  conversation: "quiet", // chatty, quiet
  entertainment: "sports" // sports, music, news
}

const MOCK_HISTORY = [
  { id: 1, date: "15 Fev 2026", service: "Corte Degradê", prof: "João Silva", price: 45.00 },
  { id: 2, date: "22 Jan 2026", service: "Corte + Barba", prof: "João Silva", price: 75.00 },
]

export default function PerfilDossiePage({ params }: { params: { slug: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState(MOCK_PREFERENCES)

  useEffect(() => {
    // Simulação de tempo de rede (Suspense Fallback)
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Função simulada para atualização do JSONB no Supabase
  const handleUpdatePreference = (key: keyof typeof MOCK_PREFERENCES, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    // TODO: Disparar UPDATE silencioso para public.clients (coluna preferences)
  }

  if (isLoading) return <SkeletonPerfil />

  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-500">
      
      {/* HEADER: PERFIL DO USUÁRIO */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden">
              <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">{MOCK_USER.name}</h1>
            <p className="text-zinc-500 text-xs font-semibold">{MOCK_USER.phone}</p>
          </div>
        </div>
        <button className="p-2 bg-zinc-900 rounded-xl border border-white/5 text-zinc-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 space-y-8">
        
        {/* ========================================================= */}
        {/* O DOSSIÊ VIP (Hospitality Tags) */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-zinc-500" /> Dossiê de Atendimento
            </h3>
            <p className="text-zinc-500 text-xs font-medium mt-1">Sujira como prefere ser atendido. O barbeiro será notificado.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tag: Conversa */}
            <button 
              onClick={() => handleUpdatePreference('conversation', preferences.conversation === 'quiet' ? 'chatty' : 'quiet')}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 ${
                preferences.conversation === 'quiet' 
                  ? 'bg-indigo-500/10 border-indigo-500/30' 
                  : 'bg-zinc-900 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                {preferences.conversation === 'quiet' ? <VolumeX className="w-5 h-5 text-indigo-400" /> : <MessageSquare className="w-5 h-5 text-zinc-500" />}
                {preferences.conversation === 'quiet' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <div>
                <p className={`font-bold text-sm ${preferences.conversation === 'quiet' ? 'text-indigo-400' : 'text-white'}`}>Corte Silencioso</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Prefiro relaxar</p>
              </div>
            </button>

            {/* Tag: Bebida */}
            <button 
              onClick={() => handleUpdatePreference('beverage', preferences.beverage === 'coffee' ? 'beer' : 'coffee')}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 ${
                preferences.beverage === 'coffee' 
                  ? 'bg-amber-500/10 border-amber-500/30' 
                  : 'bg-amber-700/10 border-amber-700/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                {preferences.beverage === 'coffee' ? <Coffee className="w-5 h-5 text-amber-500" /> : <Beer className="w-5 h-5 text-amber-600" />}
                <CheckCircle2 className={`w-4 h-4 ${preferences.beverage === 'coffee' ? 'text-amber-500' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className={`font-bold text-sm ${preferences.beverage === 'coffee' ? 'text-amber-500' : 'text-amber-600'}`}>
                  {preferences.beverage === 'coffee' ? 'Café Espresso' : 'Cerveja Gelada'}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Cortesia da casa</p>
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* GALERIA DE REFERÊNCIA (O "Corte Perfeito") */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-zinc-500" /> Meu Estilo Ideal
            </h3>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2">
            {/* Slot com Foto */}
            <div className="snap-start shrink-0 w-32 h-40 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" alt="Referência" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">Substituir</span>
              </div>
            </div>
            
            {/* Slot Vazio (Upload) */}
            <button className="snap-start shrink-0 w-32 h-40 rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 transition-colors">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Camera className="w-4 h-4 text-zinc-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Adicionar Foto</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HISTÓRICO DE SERVIÇOS E RECIBOS */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-500" /> Histórico Recente
            </h3>
            <button className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center">
              Ver todos <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_HISTORY.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight mb-0.5">{item.service}</p>
                    <p className="text-zinc-500 text-xs font-semibold">{item.date} • {item.prof}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-sm">R$ {item.price.toFixed(2)}</p>
                  <button className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mt-1">Recibo</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* AÇÕES DE CONTA (Danger Zone) */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-white/5">
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-colors font-bold text-sm">
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>

      </div>
    </div>
  )
}

// ==============================================================================
// SKELETON LOADER
// ==============================================================================
function SkeletonPerfil() {
  return (
    <div className="px-6 pt-12 space-y-8 animate-pulse">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-zinc-800 rounded-full"></div>
            <div className="h-3 w-24 bg-zinc-800 rounded-full"></div>
          </div>
        </div>
        <div className="w-10 h-10 bg-zinc-800 rounded-xl"></div>
      </div>

      {/* Skeleton Dossiê */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-zinc-800 rounded-full"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 rounded-2xl bg-zinc-900 border border-white/5"></div>
          <div className="h-28 rounded-2xl bg-zinc-900 border border-white/5"></div>
        </div>
      </div>

      {/* Skeleton Histórico */}
      <div className="space-y-4 pt-4">
        <div className="h-6 w-40 bg-zinc-800 rounded-full"></div>
        <div className="h-16 rounded-2xl bg-zinc-900 border border-white/5"></div>
        <div className="h-16 rounded-2xl bg-zinc-900 border border-white/5"></div>
      </div>
    </div>
  )
}