"use client"

import { useParams } from "next/navigation"
import { useTVBoard } from "@/hooks/useTVBoard"
import { Scissors, QrCode } from "lucide-react"

export default function TVBoardPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { isLoading, businessName, currentTime, nowServing, upNext } = useTVBoard(slug)

  // Formatação minimalista
  const timeString = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateString = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/20"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black text-white font-sans selection:bg-transparent">
      
      {/* HEADER: Limpo, tipografia forte e alinhamento perfeito */}
      <header className="flex h-32 shrink-0 items-center justify-between px-16">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/5">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">{businessName}</h1>
        </div>
        
        <div className="text-right">
          <p className="text-5xl font-medium tracking-tighter text-white">{timeString}</p>
          <p className="text-lg font-medium text-white/40 capitalize mt-1">{dateString}</p>
        </div>
      </header>

      {/* CORPO: Layout de Cartões com efeito "Frosted Glass" (Estilo Apple) */}
      <main className="flex flex-1 gap-8 px-16 pb-16">
        
        {/* LADO ESQUERDO: ATENDIMENTO ATUAL */}
        <section className="flex-[3] relative flex flex-col rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-12 overflow-hidden backdrop-blur-3xl">
          {/* Brilho sutil no fundo para dar profundidade (Glow) */}
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-[120px] pointer-events-none"></div>

          <h2 className="mb-10 flex items-center gap-3 text-xl font-medium text-white/50 tracking-wide">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            Atendimento Atual
          </h2>

          <div className="flex flex-1 flex-col gap-6 justify-center">
            {nowServing.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center opacity-30">
                <p className="text-3xl font-medium tracking-tight">Cadeiras Livres</p>
              </div>
            ) : (
              nowServing.map((appt, idx) => (
                <div key={idx} className="flex items-center gap-8 rounded-[2rem] bg-white/[0.03] p-8 border border-white/[0.04] transition-all">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-medium text-white shadow-inner">
                    {appt.client_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-5xl font-semibold tracking-tight text-white mb-2">{appt.client_name}</h3>
                    <p className="text-2xl font-medium text-white/40">{appt.service}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* LADO DIREITO: PRÓXIMOS DA FILA */}
        <section className="flex-[2] flex flex-col rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-12 backdrop-blur-3xl">
          <h2 className="mb-10 text-xl font-medium text-white/50 tracking-wide">
            Próximos
          </h2>

          <div className="flex flex-1 flex-col gap-5 overflow-hidden">
            {upNext.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-30">
                <p className="text-xl font-medium">Fila vazia</p>
              </div>
            ) : (
              upNext.slice(0, 5).map((appt, idx) => (
                <div key={idx} className="flex items-center gap-6 rounded-2xl p-4 transition-colors">
                  <div className="text-2xl font-semibold tracking-tight text-white/60 w-20">
                    {appt.time}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate text-2xl font-semibold text-white/90">{appt.client_name}</h3>
                    <p className="truncate text-lg text-white/40">{appt.service}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ÁREA DE MARKETING MINIMALISTA */}
          <div className="mt-8 flex items-center justify-between rounded-3xl bg-white/[0.03] p-6 border border-white/[0.05]">
            <div>
              <p className="text-lg font-semibold tracking-tight text-white/90">Agende o seu horário</p>
              <p className="text-sm font-medium text-white/40 mt-1">Aponte a câmara do telemóvel</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-3">
              <QrCode className="h-full w-full text-white/80" />
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}