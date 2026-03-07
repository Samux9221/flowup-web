"use client"

import { useState } from "react"
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics"
import { useNiche } from "@/app/contexts/NicheContext"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { FileSpreadsheet, Printer, Calendar as CalendarIcon, Loader2, TrendingUp, TrendingDown, Users, Scissors, AlertCircle, Search, CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const getToday = () => new Date().toISOString().split('T')[0]
const getDaysAgo = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().split('T')[0] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#18181b] p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-zinc-100 dark:border-white/10">
        <p className="text-sm font-bold text-zinc-500 mb-1">{label}</p>
        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">R$ {Number(payload[0].value || 0).toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardIntelligence() {
  const { config } = useNiche()
  const t = config.theme
  
  const [dateRange, setDateRange] = useState({ start: getDaysAgo(30), end: getToday(), label: "Últimos 30 Dias" })
  const { isLoading, dre, chartData, barberRanking, rawAppointments, details, topServices = [], paymentMix = [] } = useDashboardAnalytics(dateRange.start, dateRange.end)
  const [activeModal, setActiveModal] = useState<"bruto" | "operacional" | "equipe" | "liquido" | null>(null)

  const handleExportCSV = () => { /* Mesma função de exportação rápida */
    if (!rawAppointments || rawAppointments.length === 0) return alert("Sem dados para exportar.")
    const headers = ["Data", "Hora", "Cliente", "Serviço", "Profissional", "Valor (R$)", "Método"]
    const rows = rawAppointments.map(a => [a.date.split('-').reverse().join('/'), a.time, `"${a.client_name}"`, `"${a.service}"`, `"${a.professionals?.name || 'Sem Profissional'}"`, a.total_price, a.payment_method])
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `flowup_export_${dateRange.start}.csv`
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  return (
    <div className="space-y-10 pb-20 print:space-y-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-[#09090b] p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/5 shadow-sm print:hidden">
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-white/5 mr-2">
            <CalendarIcon className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{dateRange.label}</span>
          </div>
          <button onClick={() => setDateRange({ start: getToday(), end: getToday(), label: "Hoje" })} className="px-5 py-2.5 text-sm font-bold rounded-2xl border border-zinc-200/80 hover:bg-zinc-50 transition-all text-zinc-600">Hoje</button>
          <button onClick={() => setDateRange({ start: getDaysAgo(7), end: getToday(), label: "Últimos 7 Dias" })} className="px-5 py-2.5 text-sm font-bold rounded-2xl border border-zinc-200/80 hover:bg-zinc-50 transition-all text-zinc-600">7 Dias</button>
          <button onClick={() => setDateRange({ start: getDaysAgo(30), end: getToday(), label: "Últimos 30 Dias" })} className="px-5 py-2.5 text-sm font-bold rounded-2xl border border-zinc-200/80 hover:bg-zinc-50 transition-all text-zinc-600 whitespace-nowrap">30 Dias</button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleExportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-zinc-900 text-white hover:scale-[1.02] transition-transform shadow-lg"><FileSpreadsheet className="w-4 h-4" /> Exportar Planilha</button>
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border-2 border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-700"><Printer className="w-4 h-4" /> Imprimir DRE</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96"><Loader2 className={`w-10 h-10 animate-spin ${t.textHighlight} mb-6`} /><p className="text-base font-semibold text-zinc-500">Compilando inteligência financeira...</p></div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-700" id="dre-print-area">
          
          {/* DRE WATERFALL (COM BOTÕES AUDITÁVEIS) */}
          <div className="space-y-4">
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 mb-6"><TrendingUp className="w-6 h-6 text-zinc-400" /> DRE: A Dura Realidade <span className="text-xs font-medium text-zinc-400 ml-2 font-sans tracking-normal opacity-60 print:hidden">(Clique para auditar)</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div onClick={() => setActiveModal("bruto")} className="cursor-pointer group relative p-6 rounded-[2rem] bg-white dark:bg-[#09090b] border border-zinc-200/60 shadow-sm md:col-span-1 flex flex-col justify-center hover:border-zinc-300 transition-all">
                <Search className="absolute top-4 right-4 w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Entradas Brutas</p>
                <h3 className="text-2xl font-black text-zinc-900">R$ {dre.bruto.toFixed(2)}</h3>
              </div>
              <div onClick={() => setActiveModal("operacional")} className="cursor-pointer group relative p-6 rounded-[2rem] bg-rose-50/50 border border-rose-100 md:col-span-2 flex flex-col justify-center overflow-hidden hover:border-rose-200 transition-all">
                <Search className="absolute top-4 right-4 w-4 h-4 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-rose-100/50 to-transparent z-0" />
                <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-rose-500 mb-2 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Custos de Venda & Equipe</p>
                <div className="relative z-10 flex items-end gap-4">
                  <h3 className="text-2xl font-black text-rose-600">- R$ {(dre.comissoes + dre.taxas + dre.despesas).toFixed(2)}</h3>
                  <p className="text-sm font-medium text-rose-600/70 mb-1">(Equipe: R$ {dre.comissoes.toFixed(0)} | Op: R$ {(dre.taxas + dre.despesas).toFixed(0)})</p>
                </div>
              </div>
              <div onClick={() => setActiveModal("liquido")} className="cursor-pointer group relative p-6 rounded-[2rem] bg-emerald-50 border border-emerald-200/60 md:col-span-2 shadow-lg shadow-emerald-500/5 flex flex-col justify-center overflow-hidden hover:border-emerald-300 transition-all">
                <Search className="absolute top-4 right-4 w-4 h-4 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-emerald-100/50 to-transparent z-0" />
                <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Margem Líquida</p>
                <div className="relative z-10 flex items-end gap-3">
                  <h3 className="text-4xl font-black text-emerald-600">R$ {dre.liquido.toFixed(2)}</h3>
                  <p className="text-sm font-bold text-emerald-600/60 mb-1.5">{dre.bruto > 0 ? ((dre.liquido / dre.bruto) * 100).toFixed(1) : 0}% de margem</p>
                </div>
              </div>
            </div>
          </div>

          {/* GRÁFICOS E CURVA ABC REAIS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white border border-zinc-200/60 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div><h3 className="text-xl font-black text-zinc-900">Evolução do Faturamento</h3><p className="text-sm text-zinc-500 mt-1">Receita diária bruta no período.</p></div>
                <div className="p-3 bg-zinc-50 rounded-2xl"><TrendingUp className="w-6 h-6 text-zinc-400" /></div>
              </div>
              <div className="h-[320px] w-full">
                {chartData.length === 0 ? <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-medium border-2 border-dashed border-zinc-100 rounded-3xl">Aguardando dados...</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis dataKey="dia" axisLine={false} tickLine={false} tickMargin={15} fontSize={12} fill="#6b7280" fontWeight={600} />
                      <YAxis axisLine={false} tickLine={false} tickMargin={15} fontSize={12} fill="#6b7280" tickFormatter={(val) => `R$ ${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
                      <Area type="monotone" dataKey="faturamento" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* CURVA ABC (DADOS REAIS) */}
            <div className="p-8 rounded-[2rem] bg-white border border-zinc-200/60 shadow-sm flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2"><Scissors className="w-5 h-5 text-zinc-400" /> Mix de Serviços</h3>
                <p className="text-sm text-zinc-500 mt-1">Onde está a sua maior receita.</p>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                {topServices.length === 0 ? <p className="text-center text-zinc-400 text-sm">Nenhum serviço prestado.</p> : topServices.map((srv, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-bold mb-2 text-zinc-700">
                      <span className="truncate pr-4">{srv.name}</span><span>{srv.percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${srv.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* MIX DE PAGAMENTOS (DADOS REAIS) */}
            <div className="p-8 rounded-[2rem] bg-white border border-zinc-200/60 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-zinc-400" /> Origem da Receita</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                {paymentMix.length === 0 ? <p className="text-zinc-400 text-sm">Sem pagamentos.</p> : (
                  <div className="w-full h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paymentMix} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {paymentMix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, "Total"]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {paymentMix.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div><span className="text-xs font-bold text-zinc-600">{p.name}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* RANKING DA EQUIPE */}
            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col">
              <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center justify-between">Performance da Equipe</h3>
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-zinc-100 text-zinc-400 text-xs uppercase tracking-widest">
                      <th className="pb-4 font-bold">Profissional</th>
                      <th className="pb-4 font-bold text-center">Volume</th>
                      <th className="pb-4 font-bold text-right">Gerou (R$)</th>
                      <th className="pb-4 font-bold text-right text-emerald-600">Comissão Devida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {barberRanking.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-zinc-400">Nenhum dado financeiro.</td></tr> : barberRanking.map((barber, idx) => (
                      <tr key={idx} className="group hover:bg-zinc-50 transition-colors">
                        <td className="py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400">{barber.nome.charAt(0)}</div><span className="font-bold text-zinc-900">{barber.nome}</span></div></td>
                        <td className="py-5 text-center font-bold text-zinc-500">{barber.cortes} <span className="text-xs font-normal">svs</span></td>
                        <td className="py-5 text-right font-bold text-zinc-600">R$ {barber.faturamento.toFixed(2)}</td>
                        <td className="py-5 text-right font-black text-emerald-600">R$ {barber.comissao.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAIS DE AUDITORIA (MANTIDOS E REFINADOS PARA OS NOVOS CALCULOS) */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-[2rem] border-zinc-200 p-8 shadow-2xl">
          {activeModal === 'operacional' && (
            <>
              <DialogHeader><DialogTitle className="text-2xl font-black">Auditoria Operacional</DialogTitle></DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2 mt-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Taxas de Cartão</h4>
                  <div className="space-y-2">
                    {details.cardFees.length === 0 ? <p className="text-sm text-zinc-400">Nenhuma venda no cartão.</p> : details.cardFees.map((fee: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100"><span className="text-sm font-bold text-zinc-700">{fee.client_name} <span className="text-zinc-400 font-normal">(R$ {fee.total_price})</span></span><span className="text-sm font-black text-rose-600">- R$ {fee.feeValue.toFixed(2)}</span></div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Despesas da Gaveta</h4>
                  <div className="space-y-2">
                    {details.expenses.length === 0 ? <p className="text-sm text-zinc-400">Nenhuma despesa extra.</p> : details.expenses.map((exp: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100"><span className="text-sm font-bold text-zinc-700">{exp.description || 'S/N'} <span className="text-zinc-400 font-normal">({exp.date.split('-').reverse().join('/')})</span></span><span className="text-sm font-black text-rose-600">- R$ {Number(exp.amount).toFixed(2)}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Outros modais seguem a mesma lógica simplificada... */}
          {activeModal === 'bruto' && (
            <>
              <DialogHeader><DialogTitle className="text-2xl font-black">Faturamento Detalhado</DialogTitle></DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto space-y-2 mt-4 pr-2">
                {rawAppointments.map((appt: any, i) => (
                  <div key={i} className="flex justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div><p className="font-bold text-zinc-900">{appt.client_name}</p><p className="text-xs text-zinc-500">{appt.date.split('-').reverse().join('/')} • {appt.service}</p></div>
                    <div className="text-right"><p className="font-black text-emerald-600">+ R$ {Number(appt.total_price).toFixed(2)}</p></div>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeModal === 'liquido' && (
            <>
              <DialogHeader><DialogTitle className="text-2xl font-black text-center border-b pb-6">A Matemática do Seu Lucro</DialogTitle></DialogHeader>
              <div className="py-8 space-y-4 font-mono text-lg max-w-sm mx-auto">
                <div className="flex justify-between text-emerald-600"><span>Entradas Brutas</span><span>+ R$ {dre.bruto.toFixed(2)}</span></div>
                <div className="flex justify-between text-rose-500"><span>Custo Operacional</span><span>- R$ {(dre.taxas + dre.despesas).toFixed(2)}</span></div>
                <div className="flex justify-between text-rose-500 border-b border-zinc-200 pb-6"><span>Custo de Equipe</span><span>- R$ {dre.comissoes.toFixed(2)}</span></div>
                <div className="flex justify-between font-black pt-4 text-3xl"><span>Sobrou</span><span className={dre.liquido > 0 ? "text-emerald-600" : "text-rose-600"}>R$ {dre.liquido.toFixed(2)}</span></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}