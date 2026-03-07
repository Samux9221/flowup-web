"use client"

import { useState } from "react"
import { useNiche } from "@/app/contexts/NicheContext"
import { Smartphone, QrCode, CheckCircle2, MessageCircle, Clock, RefreshCcw, Zap, AlertCircle, Star, RotateCcw, Lock, Check, Loader2, Radar, Target, User, Send, Calendar, Bot } from "lucide-react"
import { useWhatsApp } from "@/hooks/useWhatsApp"

export default function WhatsAppAutomation() {
  const { config } = useNiche()
  const t = config.theme

  // Navegação Interna
  const [activeTab, setActiveTab] = useState<'device' | 'automations' | 'radar'>('device')
  const [expandedList, setExpandedList] = useState<'recovery' | 'return' | null>(null)

  // Estados de simulação do Gateway (Até termos a API real da Evolution)
  const [isConnected, setIsConnected] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // O motor real de dados do Supabase
  const { isLoading, isSaving, automations, setAutomations, saveAutomations, radarData } = useWhatsApp()

  const templateCards = [
    { key: 'reminder', dbText: 'reminder_text', dbActive: 'reminder_active', title: "Lembrete Anti-Falta", icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { key: 'review', dbText: 'review_text', dbActive: 'review_active', title: "Máquina de Google (NPS)", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { key: 'return', dbText: 'return_text', dbActive: 'return_active', title: "Loop de Fidelização (20 dias)", icon: RotateCcw, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { key: 'recovery', dbText: 'recovery_text', dbActive: 'recovery_active', title: "Recuperação de Churn (45 dias)", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" }
  ]

  const handleSave = async () => {
    const sucesso = await saveAutomations(automations)
    if (sucesso) alert("Regras de WhatsApp atualizadas com sucesso!")
  }

  const handleConnect = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setIsConnected(true)
      setActiveTab('radar') // O Onboarding perfeito: joga-o direto para ver o dinheiro no Radar
    }, 2500)
  }

  const handleManualSend = (client: any, type: 'recovery' | 'return') => {
    let rawText = type === 'recovery' ? automations.recovery_text : automations.return_text
    const textReplaced = rawText.replace(/\[Nome\]/g, client.name.split(' ')[0]).replace(/\[Profissional\]/g, client.barber)
    const encodedText = encodeURIComponent(textReplaced)
    window.open(`https://wa.me/55${client.phone}?text=${encodedText}`, '_blank')
  }

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${active ? t.primaryBg : 'bg-zinc-200 dark:bg-zinc-800'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${active ? 'transform translate-x-6' : ''}`} />
    </div>
  )

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
      
      {/* 🔹 CABEÇALHO HERO 🔹 */}
      <div className="flex flex-col gap-4 border-b border-zinc-200/60 dark:border-white/5 pb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none"><Zap className="w-64 h-64 -mt-10 -mr-10" /></div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 text-xs font-black uppercase tracking-widest w-max mb-2 border border-zinc-200 dark:border-white/5">
          <MessageCircle className="w-4 h-4" /> Inteligência Omnichannel
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">Central do WhatsApp</h1>
        <p className="text-zinc-500 font-medium text-lg max-w-2xl mt-2">
          Transforme o seu número oficial num vendedor 24 horas. Reduza as faltas, aumente as avaliações e recupere clientes.
        </p>
      </div>

      {/* 🔹 TABS DE NAVEGAÇÃO 🔹 */}
      <div className="flex overflow-x-auto no-scrollbar p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl w-max border border-zinc-200/50 dark:border-white/5">
        <button onClick={() => setActiveTab('device')} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'device' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
          <Smartphone className="w-4 h-4" /> 1. O Aparelho
        </button>
        <button onClick={() => isConnected ? setActiveTab('automations') : null} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'automations' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'} ${!isConnected && 'opacity-50 cursor-not-allowed'}`}>
          {!isConnected ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />} 2. Regras do Robô
        </button>
        <button onClick={() => isConnected ? setActiveTab('radar') : null} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'radar' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'} ${!isConnected && 'opacity-50 cursor-not-allowed'}`}>
          {!isConnected ? <Lock className="w-4 h-4" /> : <Radar className="w-4 h-4" />} 3. Radar de Vendas
        </button>
      </div>

      {/* 🔹 ÁREA 1: O APARELHO (Gateway Visual) 🔹 */}
      {activeTab === 'device' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 md:p-12 rounded-[2rem] bg-white dark:bg-[#09090b] border border-zinc-200/60 dark:border-white/5 shadow-sm flex flex-col items-center text-center max-w-2xl mx-auto relative overflow-hidden">
            {!isConnected ? (
              <>
                <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-zinc-600 dark:to-zinc-800" />
                <div className="w-32 h-32 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-white/5 flex items-center justify-center mb-8 shadow-inner relative">
                  {isGenerating ? <RefreshCcw className="w-12 h-12 text-zinc-400 animate-spin" /> : <QrCode className="w-16 h-16 text-zinc-800 dark:text-zinc-200" />}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">Conecte o seu Servidor</h3>
                <p className="text-zinc-500 mb-8 max-w-sm">Gere o código e leia com a câmara do seu telemóvel para autorizar os disparos do FlowUp.</p>
                <button onClick={handleConnect} disabled={isGenerating} className={`px-10 py-4 rounded-2xl font-black text-white text-lg transition-all active:scale-95 shadow-lg ${isGenerating ? 'bg-zinc-400 shadow-none' : t.primaryBg}`}>
                  {isGenerating ? "A gerar criptografia..." : "Gerar QR Code Seguro"}
                </button>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center animate-in zoom-in-95 w-full">
                <div className="absolute top-0 w-full h-2 bg-emerald-500" />
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-500/5">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Gateway Online</h3>
                <p className="text-zinc-500 mb-8 font-medium">Conexão estabelecida com a Evolution API.</p>
                <div className="w-full max-w-md p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-white/5 flex items-center gap-5 text-left mb-6">
                  <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center shrink-0"><Smartphone className="w-6 h-6 text-zinc-500" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Aparelho Conectado</p>
                    <p className="text-xl font-black text-zinc-900 dark:text-white">+55 (35) 99999-****</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-200/50 dark:border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ativo
                  </div>
                </div>
                <button onClick={() => {setIsConnected(false); setActiveTab('device')}} className="text-sm font-bold text-red-500 hover:text-red-600 mt-6 px-6 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Desconectar Servidor</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔹 ÁREA 2: AS AUTOMAÇÕES (Cofre de Regras) 🔹 */}
      {activeTab === 'automations' && isConnected && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Regras de Disparo</h2>
              <p className="text-sm text-zinc-500">Escreva o texto e o sistema usará este padrão no robô e no radar.</p>
            </div>
            <button onClick={handleSave} disabled={isLoading || isSaving} className={`px-8 py-3 rounded-2xl font-black text-white shadow-lg flex items-center gap-2 transition-transform active:scale-95 ${isLoading || isSaving ? 'opacity-70' : ''} ${t.primaryBg}`}>
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} {isSaving ? "Salvando..." : "Salvar Regras"}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className={`w-8 h-8 animate-spin ${t.textHighlight}`} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templateCards.map((tpl) => {
                const Icon = tpl.icon
                const isActive = automations[tpl.dbActive as keyof typeof automations] as boolean
                const textValue = automations[tpl.dbText as keyof typeof automations] as string
                return (
                  <div key={tpl.key} className={`p-6 rounded-[2rem] bg-white dark:bg-[#09090b] border transition-all duration-300 ${isActive ? `border-zinc-300 dark:border-zinc-700 shadow-xl shadow-zinc-200/20 dark:shadow-none` : 'border-zinc-200/50 dark:border-white/5 opacity-80'}`}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3"><div className={`p-3 rounded-2xl ${tpl.bg} ${tpl.color}`}><Icon className="w-6 h-6" /></div><h3 className="font-bold text-zinc-900 dark:text-white text-lg">{tpl.title}</h3></div>
                      <Toggle active={isActive} onClick={() => setAutomations(p => ({ ...p, [tpl.dbActive]: !isActive }))} />
                    </div>
                    <textarea value={textValue || ""} onChange={(e) => setAutomations(p => ({ ...p, [tpl.dbText]: e.target.value }))} className={`w-full p-4 rounded-2xl text-sm border focus:ring-2 outline-none resize-none h-32 leading-relaxed transition-all ${isActive ? 'bg-zinc-50 border-zinc-200 focus:border-zinc-400 text-zinc-900 font-medium dark:bg-zinc-900 dark:border-zinc-800 dark:text-white' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-900/30 dark:border-zinc-800/50'}`} disabled={!isActive} />
                    {isActive && (
                      <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-1.5 rounded-lg">+ [Nome]</span>
                        {tpl.key === 'reminder' && <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-1.5 rounded-lg">+ [Horario]</span>}
                        {tpl.key === 'review' && <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1.5 rounded-lg">+ [Link_Google]</span>}
                        <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-1.5 rounded-lg">+ [Profissional]</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 🔹 ÁREA 3: O RADAR DE VENDAS 🔹 */}
      {activeTab === 'radar' && isConnected && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2"><Target className="w-6 h-6 text-zinc-400" /> Radar de Oportunidades</h2>
            <p className="text-sm text-zinc-500">
              Clientes filtrados diretamente da sua base. {automations.recovery_active || automations.return_active ? 'O seu robô está ativo e assumindo algumas destas listas.' : 'Faça disparos manuais usando o texto pré-configurado.'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20"><Loader2 className={`w-8 h-8 animate-spin ${t.textHighlight} mb-4`} /><p className="text-zinc-500 font-bold">A analisar a sua agenda real...</p></div>
          ) : (
            <div className="space-y-6">
              
              {/* Bloco 1: Churn (45+ Dias) */}
              <div className={`rounded-[2rem] border overflow-hidden transition-all bg-white dark:bg-[#09090b] ${expandedList === 'recovery' ? 'border-rose-300 dark:border-rose-500/50 shadow-xl shadow-rose-500/10' : 'border-zinc-200/60 dark:border-white/5 hover:border-zinc-300 cursor-pointer'}`}>
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4" onClick={() => setExpandedList(expandedList === 'recovery' ? null : 'recovery')}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center relative">
                      <AlertCircle className="w-7 h-7" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-xs font-black rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#09090b]">{radarData.recovery.length}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        Clientes em Risco 
                        {automations.recovery_active && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] rounded-lg uppercase tracking-widest flex items-center gap-1"><Bot className="w-3 h-3"/> Robô Assumiu</span>}
                      </h3>
                      <p className="text-sm text-zinc-500 font-medium mt-1">Mais de 45 dias sem cortar o cabelo. Risco alto de perda.</p>
                    </div>
                  </div>
                  <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${expandedList === 'recovery' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'}`}>
                    {expandedList === 'recovery' ? 'Fechar Lista' : 'Ver Clientes'}
                  </button>
                </div>

                {expandedList === 'recovery' && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                            <th className="pb-3 px-4">Cliente</th>
                            <th className="pb-3 px-4 text-center">Última Visita</th>
                            <th className="pb-3 px-4 text-center">Dias Ausente</th>
                            <th className="pb-3 px-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {radarData.recovery.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-zinc-400 font-medium">Nenhum cliente em risco no momento. Excelente!</td></tr> : radarData.recovery.map(client => (
                            <tr key={client.id} className="hover:bg-white dark:hover:bg-zinc-800/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500">{client.name.charAt(0)}</div>
                                  <div><p className="font-bold text-zinc-900 dark:text-white">{client.name}</p><p className="text-xs text-zinc-500 flex items-center gap-1"><User className="w-3 h-3"/> {client.barber}</p></div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400"><span className="flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-400"/> {client.lastVisit}</span></td>
                              <td className="py-4 px-4 text-center"><span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 font-black rounded-lg text-sm">{client.daysAway} dias</span></td>
                              <td className="py-4 px-4 text-right">
                                {automations.recovery_active ? (
                                  <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4" /> Automático
                                  </span>
                                ) : (
                                  <button onClick={() => handleManualSend(client, 'recovery')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:bg-[#1ebe57] transition-colors shadow-lg shadow-[#25D366]/20">
                                    <Send className="w-4 h-4" /> Enviar Oferta
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Bloco 2: Fidelização (20+ Dias) */}
              <div className={`rounded-[2rem] border overflow-hidden transition-all bg-white dark:bg-[#09090b] ${expandedList === 'return' ? 'border-indigo-300 dark:border-indigo-500/50 shadow-xl shadow-indigo-500/10' : 'border-zinc-200/60 dark:border-white/5 hover:border-zinc-300 cursor-pointer'}`}>
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4" onClick={() => setExpandedList(expandedList === 'return' ? null : 'return')}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center relative">
                      <RotateCcw className="w-7 h-7" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 text-white text-xs font-black rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#09090b]">{radarData.returnList.length}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        Loop de Fidelização
                        {automations.return_active && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] rounded-lg uppercase tracking-widest flex items-center gap-1"><Bot className="w-3 h-3"/> Robô Assumiu</span>}
                      </h3>
                      <p className="text-sm text-zinc-500 font-medium mt-1">O cabelo já cresceu. Tempo perfeito para convidar para um novo corte.</p>
                    </div>
                  </div>
                  <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${expandedList === 'return' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'}`}>
                    {expandedList === 'return' ? 'Fechar Lista' : 'Ver Clientes'}
                  </button>
                </div>

                {expandedList === 'return' && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                            <th className="pb-3 px-4">Cliente</th>
                            <th className="pb-3 px-4 text-center">Última Visita</th>
                            <th className="pb-3 px-4 text-center">Ciclo</th>
                            <th className="pb-3 px-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {radarData.returnList.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-zinc-400 font-medium">Nenhum cliente neste ciclo de retorno no momento.</td></tr> : radarData.returnList.map(client => (
                            <tr key={client.id} className="hover:bg-white dark:hover:bg-zinc-800/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500">{client.name.charAt(0)}</div>
                                  <div><p className="font-bold text-zinc-900 dark:text-white">{client.name}</p><p className="text-xs text-zinc-500 flex items-center gap-1"><User className="w-3 h-3"/> {client.barber}</p></div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400"><span className="flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-400"/> {client.lastVisit}</span></td>
                              <td className="py-4 px-4 text-center"><span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 font-black rounded-lg text-sm">{client.daysAway} dias</span></td>
                              <td className="py-4 px-4 text-right">
                                {automations.return_active ? (
                                  <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4" /> Automático
                                  </span>
                                ) : (
                                  <button onClick={() => handleManualSend(client, 'return')} className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:bg-[#1ebe57] transition-colors shadow-lg shadow-[#25D366]/20">
                                    <Send className="w-4 h-4" /> Enviar Convite
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  )
}