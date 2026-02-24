"use client"

import { Store, Phone, Link as LinkIcon, Copy } from "lucide-react"
import { useNiche } from "../../app/contexts/NicheContext"

export default function BusinessSection({ state, actions }: { state: any, actions: any }) {
  const { config } = useNiche()
  const t = config.theme
  const { businessName, whatsappNumber, slug } = state
  const { setBusinessName, setWhatsappNumber, setSlug, copyLink } = actions

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200/60 pb-3 dark:border-white/10">
        <Store className="h-5 w-5 text-zinc-900 dark:text-white" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Dados do(a) {config.title}
        </h2>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome do Estabelecimento *</label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={`Ex: Meu(ua) ${config.title}`}
              className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-colors`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">WhatsApp *</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="5511999999999" 
              className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-colors`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Link Personalizado (Slug)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder={`ex: ${config.title.toLowerCase()}-do-joao`}
                className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-colors`}
              />
            </div>
            {/* BOTÃO MÁGICO DE COPIAR AQUI 👇 */}
            <button
              onClick={copyLink}
              type="button"
              className={`flex items-center justify-center gap-2 px-4 border border-zinc-200/60 bg-white/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:border-white/10 dark:hover:bg-zinc-800 ${t.radius} transition-colors text-sm font-medium text-zinc-700 dark:text-zinc-300`}
              title="Copiar Link"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copiar</span>
            </button>
          </div>
          {slug && (
            <p className="text-xs text-zinc-500">Seu link: <span className="font-semibold text-zinc-700 dark:text-zinc-300">seudominio.com/agendar/{slug}</span></p>
          )}
        </div>
      </div>
    </div>
  )
}