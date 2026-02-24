"use client"

import { useSettings } from "@/hooks/useSettings"
import { useNiche } from "../../../app/contexts/NicheContext"
import { Loader2, Save } from "lucide-react"

// Importe seus componentes divididos aqui
import BusinessSection from "@/components/settings/BusinessSection"
import AppearanceSection from "../../../components/settings/AppearanceSection" 
import WhatsAppSection from "../../../components/settings/WhatsAppSection" 

export default function ConfiguracoesPage() {
  const { state, actions } = useSettings()
  const { config } = useNiche()
  const t = config.theme

  if (state.isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${t.textHighlight}`} />
        <p>A carregar configurações...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Configurações</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Personalize a página pública, horários e estilo do(a) seu(ua) <span className={`font-bold ${t.textHighlight}`}>{config.title.toLowerCase()}</span>.
        </p>
      </header>

      <div className="rounded-3xl border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10 space-y-12">
        
        <BusinessSection state={state} actions={actions} />
        
        {/* Extraia o restante do seu código para estes componentes: */}
        <AppearanceSection state={state} actions={actions} />
        <WhatsAppSection state={state} actions={actions} />

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-6 border-t border-zinc-200/60 dark:border-white/10">
          <button 
            onClick={actions.handleSaveSettings}
            disabled={state.isSaving}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-70`}
          >
            {state.isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {state.isSaving ? "A guardar..." : "Guardar Configurações"}
          </button>
        </div>

      </div>
    </div>
  )
}