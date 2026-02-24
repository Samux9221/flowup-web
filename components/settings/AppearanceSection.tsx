"use client"

import { LayoutTemplate, Clock, Palette, Sparkles, CheckCircle2 } from "lucide-react"
import { useNiche } from "../../app/contexts/NicheContext"

// Array de temas premium (movido para cá para organizar)
const themes = [
  { 
    id: 'liso', 
    name: 'Liso (Clean)', 
    desc: 'Fundo limpo, focado 100% na sua cor primária.', 
    preview: 'bg-zinc-50 dark:bg-zinc-900' 
  },
  { 
    id: 'ninho', 
    name: 'Estampa Ninho', 
    desc: 'Textura premium de micropontos (dot grid).', 
    preview: 'bg-zinc-50 dark:bg-zinc-900 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]' 
  },
  { 
    id: 'linhas', 
    name: 'Linhas Clássicas', 
    desc: 'Padrão sutil de linhas diagonais.', 
    preview: 'bg-zinc-50 dark:bg-zinc-900 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#e4e4e7_5px,#e4e4e7_6px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#27272a_5px,#27272a_6px)]' 
  },
  { 
    id: 'grade', 
    name: 'Grade Moderna', 
    desc: 'Estilo arquitetônico com grade fina e elegante.', 
    preview: 'bg-zinc-50 dark:bg-zinc-900 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] [background-size:24px_24px]' 
  }
]

export default function AppearanceSection({ state, actions }: { state: any, actions: any }) {
  const { config } = useNiche()
  const t = config.theme
  
  const { openTime, closeTime, primaryColor, theme } = state
  const { setOpenTime, setCloseTime, setPrimaryColor, setTheme } = actions

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200/60 pb-3 dark:border-white/10">
        <LayoutTemplate className="h-5 w-5 text-zinc-900 dark:text-white" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Aparência & Horários
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Abertura</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input 
              type="time" 
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fechamento</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input 
              type="time" 
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cor Principal</label>
          <div className="relative flex items-center gap-3">
            <Palette className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input 
              type="color" 
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className={`h-[46px] w-full cursor-pointer ${t.radius} border border-zinc-200/60 bg-white/50 pl-12 pr-2 py-1 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50`}
            />
          </div>
        </div>
      </div>

      {/* ESCOLHA DE TEMA PREMIUM */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <Sparkles className="h-4 w-4 text-amber-500" /> Preset Visual da Página
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`group relative flex flex-col items-start gap-2 overflow-hidden ${t.radius} border-2 p-4 text-left transition-all hover:scale-[1.02] ${
                theme === themeOption.id 
                  ? 'border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900' 
                  : 'border-zinc-200/60 bg-white/50 hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900/30 dark:hover:border-zinc-700'
              }`}
            >
              <div className={`w-full h-24 rounded-xl border mb-2 flex items-center justify-center ${themeOption.preview}`}>
                <div className="h-6 w-20 rounded-full opacity-80" style={{ backgroundColor: primaryColor }}></div>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                {themeOption.name}
                {theme === themeOption.id && <CheckCircle2 className={`h-4 w-4 ${t.textHighlight}`} />}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{themeOption.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}