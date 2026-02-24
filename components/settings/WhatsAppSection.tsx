"use client"

import { MessageSquare } from "lucide-react"
import { useNiche } from "../../app/contexts/NicheContext"

export default function WhatsAppSection({ state, actions }: { state: any, actions: any }) {
  const { config } = useNiche()
  const t = config.theme
  
  const { whatsappMessage } = state
  const { setWhatsappMessage, insertTag } = actions

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200/60 pb-3 dark:border-white/10">
        <MessageSquare className="h-5 w-5 text-zinc-900 dark:text-white" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Mensagem de Confirmação
        </h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Texto Padrão para o WhatsApp
          </label>
          <textarea 
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            rows={4}
            className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 p-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white resize-none transition-colors`}
          />
        </div>
        
        {/* VARIÁVEIS MÁGICAS INTERATIVAS */}
        <div className={`${t.radius} bg-zinc-50/80 p-5 border border-zinc-200/60 dark:bg-zinc-900/50 dark:border-white/5`}>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-300 mb-3">
            Variáveis Mágicas (Clique para inserir no texto):
          </p>
          <div className="flex flex-wrap gap-2">
            {['cliente', 'servico', 'data', 'hora', 'estabelecimento'].map((tag) => (
              <button
                key={tag}
                onClick={() => insertTag(tag)}
                className="bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 transition-colors active:scale-95 shadow-sm"
              >
                {`{${tag}}`}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4 italic">
            Dica: O sistema vai substituir essas palavras automaticamente pelos dados reais da reserva do cliente.
          </p>
        </div>
      </div>
    </div>
  )
}