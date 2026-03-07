import DashboardIntelligence from "../DashboardIntelligence"
import { PieChart } from "lucide-react"

export default function RelatoriosPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* CABEÇALHO PREMIUM DA PÁGINA */}
      <div className="flex flex-col gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-inner border border-zinc-200/50 dark:border-white/5">
            <PieChart className="w-7 h-7 text-zinc-700 dark:text-zinc-300" />
          </div>
          Inteligência do Negócio
        </h1>
        <p className="text-zinc-500 font-medium ml-1">
          Visão estratégica, faturamento detalhado e oportunidades de crescimento.
        </p>
      </div>

      {/* O COMPONENTE MÁGICO QUE CRIAMOS */}
      <DashboardIntelligence />
      
    </div>
  )
}