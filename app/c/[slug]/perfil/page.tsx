"use client"

import { useState } from "react"
import { 
  User, Settings, Coffee, MessageSquare, VolumeX, 
  Camera, History, LogOut, ChevronRight, Beer, 
  CheckCircle2, Sparkles, ShieldCheck, Clock
} from "lucide-react"

// MOCK: Dados do Cliente
const MOCK_USER = {
  name: "Samuel",
  phone: "+55 35 99999-9999",
  memberSince: "2024",
  avatar: "https://i.pravatar.cc/150?u=samuel"
}

export default function PerfilDossiePage() {
  const [preferences, setPreferences] = useState({
    beverage: "coffee", // coffee, beer
    conversation: "quiet", // chatty, quiet
  })

  return (
    <div className="flex flex-col min-h-full w-full pb-24 animate-in fade-in duration-700 bg-black">
      
      {/* HEADER: PERFIL COM GLASSMORPHISM */}
      <div className="px-6 pt-16 pb-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border-2 border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/10">
            <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-cyan-500 shadow-xl">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight text-white">{MOCK_USER.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Membro desde {MOCK_USER.memberSince}</p>
        </div>
      </div>

      <div className="px-6 space-y-9">
        
        {/* ========================================================= */}
        {/* O DOSSIÊ VIP (O Diferencial do seu SaaS) */}
        {/* ========================================================= */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Dossiê de Hospitalidade</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Preferência de Conversa */}
            <button 
              onClick={() => setPreferences(p => ({...p, conversation: p.conversation === 'quiet' ? 'chatty' : 'quiet'}))}
              className={`p-5 rounded-[2rem] border transition-all text-left flex flex-col gap-4 relative overflow-hidden ${
                preferences.conversation === 'quiet' 
                  ? 'bg-zinc-900 border-cyan-500/30' 
                  : 'bg-zinc-950 border-zinc-900'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${preferences.conversation === 'quiet' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                {preferences.conversation === 'quiet' ? <VolumeX className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold text-white text-sm tracking-tight">Corte Silencioso</p>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Prefiro relaxar</p>
              </div>
              {preferences.conversation === 'quiet' && <CheckCircle2 className="absolute top-4 right-4 w-4 h-4 text-cyan-400" />}
            </button>

            {/* Preferência de Bebida */}
            <button 
              onClick={() => setPreferences(p => ({...p, beverage: p.beverage === 'coffee' ? 'beer' : 'coffee'}))}
              className={`p-5 rounded-[2rem] border transition-all text-left flex flex-col gap-4 relative overflow-hidden ${
                preferences.beverage === 'coffee' 
                  ? 'bg-zinc-900 border-amber-500/30' 
                  : 'bg-zinc-900 border-amber-900/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${preferences.beverage === 'coffee' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-amber-700'}`}>
                {preferences.beverage === 'coffee' ? <Coffee className="w-5 h-5" /> : <Beer className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold text-white text-sm tracking-tight">{preferences.beverage === 'coffee' ? 'Café Espresso' : 'Cerveja'}</p>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Sempre pronto</p>
              </div>
              <CheckCircle2 className={`absolute top-4 right-4 w-4 h-4 ${preferences.beverage === 'coffee' ? 'text-amber-500' : 'text-amber-700'}`} />
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GALERIA PESSOAL (Lookbook do Cliente) */}
        {/* ========================================================= */}
        <section className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Meu Estilo</h3>
            <button className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Adicionar</button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <div className="shrink-0 w-32 h-40 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <button className="shrink-0 w-32 h-40 rounded-3xl bg-zinc-950 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 transition-colors">
              <Camera className="w-5 h-5 text-zinc-700" />
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Nova Ref</span>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HISTÓRICO MINIMALISTA */}
        {/* ========================================================= */}
        <section className="space-y-5">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Últimas Visitas</h3>
          
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/20 border border-zinc-900 rounded-3xl group active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <Clock className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Corte Degradê</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">12 Mar • João Silva</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* LOGOUT */}
        <div className="pt-8">
          <button className="w-full py-4 rounded-2xl bg-rose-500/5 text-rose-500 text-xs font-bold uppercase tracking-widest border border-rose-500/10 active:scale-95 transition-transform">
            Sair da Conta
          </button>
        </div>

      </div>
    </div>
  )
}