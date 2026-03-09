"use client"

import { useState, useEffect } from "react"
import { Award, Scissors, CheckCircle2, CreditCard, ShieldCheck, ChevronRight, Gift, History } from "lucide-react"

// MOCK DE DADOS PARA DESENVOLVIMENTO
const MOCK_LOYALTY = {
  currentPoints: 7,
  targetPoints: 10,
  tier: "Membro Ouro",
  nextReward: "1 Corte Degradê 100% OFF"
}

export default function ClubeFlowPage({ params }: { params: { slug: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [autoPayEnabled, setAutoPayEnabled] = useState(true)

  useEffect(() => {
    // Simulação de fetch (Suspense fallback)
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <SkeletonClube />

  return (
    <div className="flex flex-col min-h-full w-full pb-10 animate-in fade-in duration-500">
      
      {/* HEADER PREMIUM */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black tracking-tight text-white">Clube Flow</h1>
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        <p className="text-zinc-400 text-sm font-medium">Seu programa de fidelidade e pagamentos rápidos.</p>
      </div>

      <div className="px-6 space-y-8">
        
        {/* ========================================================= */}
        {/* CARTÃO FIDELIDADE DIGITAL (Gamificação) */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-900 to-[#111113] border border-white/10 p-6 shadow-2xl">
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">{MOCK_LOYALTY.tier}</p>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {MOCK_LOYALTY.currentPoints} <span className="text-zinc-500 text-lg">/ {MOCK_LOYALTY.targetPoints} cortes</span>
                </h3>
              </div>
              <button className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                Regulamento <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Grid de Selos (Stamps) */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {Array.from({ length: MOCK_LOYALTY.targetPoints }).map((_, index) => {
                const isEarned = index < MOCK_LOYALTY.currentPoints
                const isNext = index === MOCK_LOYALTY.currentPoints
                
                return (
                  <div 
                    key={index} 
                    className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isEarned 
                        ? "bg-amber-500 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                        : isNext
                          ? "bg-zinc-800/50 border-zinc-600 border-dashed"
                          : "bg-zinc-900 border-white/5"
                    }`}
                  >
                    {isEarned ? (
                      <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                    ) : (
                      <Scissors className={`w-4 h-4 ${isNext ? 'text-zinc-500' : 'text-zinc-800'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Próxima Recompensa</p>
                  <p className="text-white text-sm font-bold">{MOCK_LOYALTY.nextReward}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLOW PAY (Frictionless Checkout Wallet) */}
        {/* ========================================================= */}
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-zinc-500" /> Flow Pay
          </h3>
          
          <div className="bg-zinc-900 rounded-[2rem] border border-white/5 p-6 space-y-6">
            
            {/* O Cartão Tokenizado */}
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center border border-white/10">
                  {/* Ícone Genérico de Bandeira */}
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 -ml-1.5"></div>
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">•••• 4242</p>
                  <p className="text-zinc-500 text-xs font-medium">Expira em 12/28</p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Trocar
              </button>
            </div>

            {/* Toggle de Pagamento Automático */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-bold text-sm mb-1 flex items-center gap-1.5">
                  Check-out Automático <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-[250px]">
                  Levante da cadeira e vá embora. Cobraremos este cartão automaticamente após a finalização do serviço pelo barbeiro.
                </p>
              </div>
              
              {/* Toggle Switch Customizado Apple-like */}
              <button 
                onClick={() => setAutoPayEnabled(!autoPayEnabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoPayEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoPayEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
          </div>
        </div>

        {/* ========================================================= */}
        {/* ATALHO PARA HISTÓRICO */}
        {/* ========================================================= */}
        <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-white/10 transition-all group">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            <span className="text-white font-bold text-sm">Ver histórico de transações</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
        </button>

      </div>
    </div>
  )
}

// ==============================================================================
// SKELETON LOADER
// ==============================================================================
function SkeletonClube() {
  return (
    <div className="px-6 pt-12 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-zinc-800 rounded-full"></div>
          <div className="h-4 w-60 bg-zinc-800 rounded-full"></div>
        </div>
        <div className="h-10 w-10 bg-zinc-800 rounded-xl"></div>
      </div>
      
      {/* Skeleton Cartão Fidelidade */}
      <div className="h-64 w-full bg-zinc-900 rounded-[2rem] border border-white/5 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-zinc-800 rounded-full"></div>
          <div className="h-8 w-32 bg-zinc-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <div key={i} className="aspect-square rounded-full bg-zinc-800"></div>
          ))}
        </div>
      </div>

      {/* Skeleton Flow Pay */}
      <div className="space-y-4 pt-4">
        <div className="h-6 w-32 bg-zinc-800 rounded-full"></div>
        <div className="h-48 w-full bg-zinc-900 rounded-[2rem] border border-white/5"></div>
      </div>
    </div>
  )
}