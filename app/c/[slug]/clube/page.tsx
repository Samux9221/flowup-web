"use client"

import { useState } from "react"
import { 
  Star, Trophy, Gift, ChevronRight, 
  Zap, Info, Sparkles, CheckCircle2 
} from "lucide-react"

// MOCK: Dados do Cliente VIP
const VIP_DATA = {
  tier: "Black Member",
  currentPoints: 1200,
  pointsToNextReward: 300,
  history: [
    { id: "1", label: "Corte de Cabelo", points: "+150", date: "12 Out" },
    { id: "2", label: "Resgate: Pomada Matte", points: "-800", date: "05 Out" },
    { id: "3", label: "Bónus de Boas-vindas", points: "+500", date: "01 Out" },
  ],
  rewards: [
    { id: "r1", title: "Corte Grátis", points: 2000, icon: <Star className="w-5 h-5" /> },
    { id: "r2", title: "Pomada Premium", points: 800, icon: <Gift className="w-5 h-5" /> },
    { id: "r3", title: "Cerveja Artesanal", points: 400, icon: <Zap className="w-5 h-5" /> },
  ]
}

export default function VIPClubPage() {
  const [activeTab, setActiveTab] = useState<"STATUS" | "HISTORICO">("STATUS")

  return (
    <div className="flex flex-col min-h-full w-full pb-20 animate-in fade-in duration-700 bg-black">
      
      {/* HEADER */}
      <div className="pt-12 pb-6 px-6">
        <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] mb-1 block">Fidelidade</span>
        <h1 className="text-3xl font-semibold text-white tracking-tighter">Clube VIP</h1>
      </div>

      <div className="px-6 space-y-8">
        
        {/* ========================================================= */}
        {/* O CARTÃO BLACK (O Coração da UI Premium) */}
        {/* ========================================================= */}
        <div className="relative group perspective-1000">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-8 border border-white/10 shadow-2xl transition-transform duration-500 group-hover:rotate-1 group-hover:scale-[1.01]">
            
            {/* Efeitos de Luz (Gritam "Premium") */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col justify-between h-48">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h2 className="text-white text-xl font-semibold tracking-tight uppercase italic italic-not-really">
                    {VIP_DATA.tier}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Desde 2024</span>
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-cyan-500/20" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Pontos Acumulados</span>
                    <span className="text-4xl font-bold text-white tracking-tighter tabular-nums">
                      {VIP_DATA.currentPoints}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Próximo Nível</span>
                    <p className="text-xs text-zinc-300 font-medium">{VIP_DATA.pointsToNextReward} pts restantes</p>
                  </div>
                </div>
                
                {/* Barra de Progresso Minimalista */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SUBTIS */}
        <div className="flex gap-8 border-b border-zinc-900 px-2">
          <button 
            onClick={() => setActiveTab("STATUS")}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "STATUS" ? "text-white border-b-2 border-cyan-500" : "text-zinc-600"}`}
          >
            Recompensas
          </button>
          <button 
            onClick={() => setActiveTab("HISTORICO")}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "HISTORICO" ? "text-white border-b-2 border-cyan-500" : "text-zinc-600"}`}
          >
            Histórico
          </button>
        </div>

        {/* CONTEÚDO DINÂMICO */}
        {activeTab === "STATUS" ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-semibold text-zinc-400 ml-1">Disponíveis para resgate</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {VIP_DATA.rewards.map(reward => {
                const canAfford = VIP_DATA.currentPoints >= reward.points
                return (
                  <div key={reward.id} className={`group flex items-center justify-between p-5 rounded-3xl border transition-all ${canAfford ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-950/20 border-zinc-900 opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${canAfford ? 'bg-zinc-900 border-zinc-700 text-cyan-400' : 'bg-zinc-950 border-zinc-900 text-zinc-700'}`}>
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-[15px] tracking-tight">{reward.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium">{reward.points} pontos</p>
                      </div>
                    </div>
                    {canAfford ? (
                      <button className="bg-white text-black text-[10px] font-bold uppercase px-4 py-2 rounded-full active:scale-95 transition-transform">
                        Resgatar
                      </button>
                    ) : (
                      <div className="p-2">
                        <Info className="w-4 h-4 text-zinc-800" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
             {VIP_DATA.history.map(item => (
                <div key={item.id} className="flex justify-between items-center py-4 border-b border-zinc-900">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-zinc-800" />
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${item.points.startsWith('+') ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {item.points}
                  </span>
                </div>
             ))}
          </div>
        )}

      </div>

      {/* FOOTER DE BENEFÍCIO */}
      <div className="mt-12 px-6">
        <div className="p-6 rounded-[2rem] bg-cyan-950/20 border border-cyan-900/30 flex items-start gap-4">
          <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
          <p className="text-xs text-cyan-100/70 leading-relaxed">
            Como <span className="text-white font-bold">Black Member</span>, você tem prioridade em cancelamentos de última hora e 10% de desconto em todos os produtos da loja.
          </p>
        </div>
      </div>

    </div>
  )
}