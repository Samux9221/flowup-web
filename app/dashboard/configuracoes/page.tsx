"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Scissors, Users, Package, Loader2, Save } from "lucide-react"
import { useNiche } from "../../contexts/NicheContext"
import { useSettings } from "@/hooks/useSettings"

// 🔹 CORREÇÃO 1: Importações padronizadas para não quebrar a renderização
import BusinessSection from "@/components/settings/BusinessSection"
import AppearanceSection from "@/components/settings/AppearanceSection" 
import WhatsAppSection from "@/components/settings/WhatsAppSection" 

// 🔹 A nossa Nova Peça de Lego (Serviços)
import TabServicos from "@/components/configuracoes/TabServicos"
import TabEquipe from "@/components/configuracoes/TabEquipe"
import TabEstoque from "@/components/configuracoes/TabEstoque"

export default function ConfiguracoesPage() {
  const { config } = useNiche()
  const t = config.theme
  const { state, actions } = useSettings()

  if (state.isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${t.textHighlight}`} />
        <p>A carregar configurações...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Ajustes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            A central de comando do(a) seu(ua) <span className={`font-bold ${t.textHighlight}`}>{config.title.toLowerCase()}</span>.
          </p>
        </div>
      </header>

      {/* O NOVO HUB CENTRAL */}
      <Tabs defaultValue="perfil" className="w-full space-y-6">
        <TabsList className="bg-zinc-100/80 p-1 dark:bg-zinc-900/50 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="perfil" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Store className="w-4 h-4 mr-2 inline-block" /> Meu Negócio
          </TabsTrigger>
          <TabsTrigger value="servicos" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Scissors className="w-4 h-4 mr-2 inline-block" /> Serviços
          </TabsTrigger>
          <TabsTrigger value="equipe" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2 inline-block" /> Profissionais
          </TabsTrigger>
          <TabsTrigger value="estoque" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2 inline-block" /> Produtos
          </TabsTrigger>
        </TabsList>

        {/* 🔹 ABA 1: PERFIL (Recuperado e Blindado) 🔹 */}
        <TabsContent value="perfil" className="focus-visible:outline-none">
          <div className="rounded-3xl border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10 space-y-12">
            
            <BusinessSection state={state} actions={actions} />
            <AppearanceSection state={state} actions={actions} />
            <WhatsAppSection state={state} actions={actions} />

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
        </TabsContent>

        {/* 🔹 ABA 2: O NOSSO NOVO CATÁLOGO DE SERVIÇOS 🔹 */}
        <TabsContent value="servicos" className="focus-visible:outline-none pt-2">
           <TabServicos />
        </TabsContent>

        {/* ABA 3: EQUIPE (Em breve) */}
        <TabsContent value="equipe" className="focus-visible:outline-none">
           <TabEquipe />
        </TabsContent>

        {/* ABA 4: ESTOQUE (Em breve) */}
        <TabsContent value="estoque" className="focus-visible:outline-none">
           <TabEstoque />
        </TabsContent>

      </Tabs>
    </div>
  )
}