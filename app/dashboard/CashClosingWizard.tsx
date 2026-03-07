"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Banknote, CheckCircle, ArrowRight, ShieldCheck, AlertTriangle, Receipt, Download, Share2, Loader2, ListTodo, Wallet, Plus, Trash2, Scissors } from "lucide-react"
import { useNiche } from "@/app/contexts/NicheContext"

export default function CashClosingWizard({ state, actions }: any) {
  const { config } = useNiche()
  const t = config.theme
  
  const { isOpen, step, totals, pendingAppointments, expenses, totalExpenses, saldoInicial, countedCash, isLoading, isSaving, closureData } = state
  const { setIsOpen, nextStep, prevStep, handleFinishClosing, addExpense, removeExpense, setSaldoInicial, setCountedCash, handleMarkAsNoShow } = actions

  const [expDesc, setExpDesc] = useState("")
  const [expAmt, setExpAmt] = useState("")

  const handleAddExpense = () => {
    addExpense(expDesc, parseFloat(expAmt))
    setExpDesc("")
    setExpAmt("")
  }

  const handleShare = async () => {
    if (!closureData) return
    const text = `📊 *Fechamento de Caixa*\nData: ${closureData.date.split('-').reverse().join('/')}\n\n💵 *Total Faturado:* R$ ${Number(totals.totalLiquido).toFixed(2)}\n📉 *Saídas do Caixa:* R$ ${Number(totalExpenses).toFixed(2)}\n💰 *Lucro Final:* R$ ${Number(closureData.expected_total).toFixed(2)}\n\n⚠️ *Auditoria da Gaveta:* ${Number(closureData.difference) === 0 ? "Bateu Exatamente ✅" : (Number(closureData.difference) > 0 ? `Sobrou R$ ${Number(closureData.difference).toFixed(2)}` : `Faltou R$ ${Math.abs(Number(closureData.difference)).toFixed(2)} ❌`)}\n\n_Gerado por FlowUp._`
    if (navigator.share) { 
      try { await navigator.share({ title: 'Leitura Z', text }); } catch (err) {} 
    } else { 
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank') 
    }
  }

  const handlePrint = () => window.print()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 p-0 overflow-hidden rounded-[2rem] shadow-2xl bg-white dark:bg-[#09090b] print:shadow-none print:border-none">
        <DialogTitle className="sr-only">Fechamento de Caixa</DialogTitle>
        <DialogDescription className="sr-only">Assistente de fim de dia</DialogDescription>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className={`w-10 h-10 animate-spin ${t.textHighlight} mb-4`} />
            <p className="text-sm font-semibold text-zinc-500">A fazer o Raio-X do dia...</p>
          </div>
        ) : (
          <>
            {step < 4 && (
              <div className="p-6 bg-zinc-50 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-white/5 print:hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${t.textHighlight}`} /> Fechar o Dia
                  </h2>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s: number) => (<div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${s <= step ? t.bgPrimary : 'bg-zinc-200 dark:bg-zinc-800'}`} />))}
                  </div>
                </div>
              </div>
            )}

            <div className={`p-6 sm:p-8 relative ${step < 4 ? 'min-h-[420px] overflow-y-auto print:hidden' : 'print:p-0'}`}>

              {/* PASSO 1: O PENTE FINO */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
                  <div className="text-center mb-6">
                    <div className={`mx-auto w-14 h-14 rounded-2xl ${t.secondaryBg} ${t.textHighlight} flex items-center justify-center mb-3`}><ListTodo className="w-7 h-7" /></div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Pente Fino da Agenda</h3>
                    <p className="text-sm text-zinc-500 mt-1">Vamos limpar os esquecidos antes de fechar.</p>
                  </div>

                  {pendingAppointments.length === 0 ? (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 text-center flex flex-col items-center">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">Tudo limpo e recebido!</p>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-500 mt-1">Nenhuma pendência na agenda de hoje.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {pendingAppointments.length} Pendências de Hoje</p>
                      {pendingAppointments.map((appt: any) => (
                        <div key={appt.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white text-sm">{appt.client_name}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><Scissors className="w-3 h-3" /> {appt.service} • {appt.time}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleMarkAsNoShow(appt.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold transition-colors hover:bg-red-100">Faltou</button>
                            <button disabled className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-400 text-xs font-bold opacity-50 cursor-not-allowed">Cobrar (Agenda)</button>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-center text-zinc-400 mt-4">Dica: Vá à aba Agenda para realizar o Checkout dos clientes atendidos.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PASSO 2: AS SAÍDAS */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
                  <div className="text-center mb-6">
                    <div className={`mx-auto w-14 h-14 rounded-2xl ${t.secondaryBg} ${t.textHighlight} flex items-center justify-center mb-3`}><Wallet className="w-7 h-7" /></div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Saídas da Gaveta</h3>
                    <p className="text-sm text-zinc-500 mt-1">Tirou algum dinheiro do caixa hoje?</p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div>
                      <Label className="text-xs text-zinc-500">Motivo (Ex: Água, Lanche, Vale)</Label>
                      <Input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Descrição" className="mt-1 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">R$</span>
                        <Input type="number" value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="0.00" className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                      </div>
                      <Button onClick={handleAddExpense} disabled={!expDesc || !expAmt} className={`rounded-xl ${t.bgPrimary} ${t.textOnPrimary}`}><Plus className="w-5 h-5" /></Button>
                    </div>
                  </div>

                  {expenses.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Lista de Saídas</p>
                      {expenses.map((exp: any) => (
                        <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5">
                          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{exp.description}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-red-500">- R$ {exp.amount.toFixed(2)}</span>
                            <button onClick={() => removeExpense(exp.id)} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PASSO 3: A CONTAGEM CEGA */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
                  <div className="text-center mb-6">
                    <div className={`mx-auto w-14 h-14 rounded-2xl ${t.secondaryBg} ${t.textHighlight} flex items-center justify-center mb-3`}><Banknote className="w-7 h-7" /></div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Auditoria da Gaveta</h3>
                    <p className="text-sm text-zinc-500 mt-1">Conta às cegas para garantir exatidão.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <Label className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mb-1">Fundo de Caixa (Troco Inicial)</Label>
                      <p className="text-xs text-zinc-500 mb-3">Quanto dinheiro já estava na gaveta quando abriu?</p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">R$</span>
                        <Input type="number" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} className="pl-12 text-2xl h-14 font-semibold border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-900 bg-white dark:bg-zinc-950" placeholder="0.00" />
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <Label className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mb-1">Dinheiro em Caixa Agora</Label>
                      <p className="text-xs text-zinc-500 mb-3">Some todas as notas e moedas que estão na gaveta.</p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">R$</span>
                        <Input type="number" value={countedCash} onChange={e => setCountedCash(e.target.value)} className="pl-12 text-2xl h-14 font-semibold border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-900 bg-white dark:bg-zinc-950" placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 4: O ESPETÁCULO (Z-READ APPLE STYLE) */}
              {step === 4 && closureData && (
                <div className="animate-in zoom-in-95 fade-in duration-500" id="receipt-print-area">
                  <div className="text-center mb-6 print:mb-2">
                    <Receipt className={`w-12 h-12 mx-auto mb-3 ${t.textHighlight}`} />
                    <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-900 dark:text-white">Leitura Z</h2>
                    <p className="text-zinc-500 font-medium">{closureData.date.split('-').reverse().join('/')}</p>
                    <div className="mt-2 inline-block bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-500 uppercase tracking-widest print:hidden">Dia Encerrado</div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 relative font-mono text-sm print:border-none print:bg-transparent print:p-0 shadow-inner">
                    
                    <div className="space-y-2 pb-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-2 font-sans text-xs uppercase tracking-wider">Entradas Faturadas</p>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Dinheiro Esperado</span><span>R$ {Number(totals.dinheiro).toFixed(2)}</span></div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Pix</span><span>R$ {Number(closureData.actual_pix).toFixed(2)}</span></div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Cartões (Líquido)</span><span>R$ {Number(closureData.actual_cartao).toFixed(2)}</span></div>
                    </div>

                    <div className="py-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                       <div className="flex justify-between text-red-500 font-medium"><span>Saídas da Gaveta</span><span>- R$ {Number(totalExpenses).toFixed(2)}</span></div>
                    </div>
                    
                    <div className="py-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-zinc-900 dark:text-white font-sans uppercase">Lucro do Dia</span>
                        <span className="text-xl font-black text-zinc-900 dark:text-white">R$ {Number(closureData.expected_total).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-4 bg-white dark:bg-zinc-900 mt-4 -mx-2 px-4 py-3 rounded-2xl border border-zinc-100 dark:border-white/5">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1 font-sans text-xs uppercase tracking-wider text-center">Auditoria Física da Gaveta</p>
                      <div className="flex justify-between items-center text-sm font-sans mt-2">
                        <span className="text-zinc-500 font-medium">Situação Real:</span>
                        <span className={`font-black text-base ${Number(closureData.difference) === 0 ? 'text-emerald-500' : (Number(closureData.difference) > 0 ? 'text-emerald-500' : 'text-red-500')}`}>
                          {Number(closureData.difference) === 0 ? "Bateu Exatamente ✅" : (Number(closureData.difference) > 0 ? `Sobra: + R$ ${Number(closureData.difference).toFixed(2)}` : `Quebra: R$ ${Math.abs(Number(closureData.difference)).toFixed(2)}`)}
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 flex gap-3 print:hidden">
                    <Button onClick={handlePrint} variant="outline" className="flex-1 rounded-2xl h-14 text-base font-bold border-zinc-200 dark:border-zinc-800">
                      <Download className="w-5 h-5 mr-2" /> PDF
                    </Button>
                    <Button onClick={handleShare} className={`flex-[2] rounded-2xl h-14 text-base font-bold shadow-lg active:scale-95 transition-all ${t.bgPrimary} ${t.textOnPrimary}`}>
                      <Share2 className="w-5 h-5 mr-2" /> Partilhar Z-Read
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER NAVEGAÇÃO */}
            {step < 4 && (
              <div className="p-6 border-t border-zinc-100 dark:border-white/5 flex justify-between gap-4 bg-white dark:bg-zinc-950">
                {step > 1 ? <button onClick={prevStep} className="px-6 py-2.5 rounded-xl font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Voltar</button> : <div />}

                {step === 1 && (
                  <button onClick={nextStep} disabled={pendingAppointments.length > 0} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${pendingAppointments.length > 0 ? 'bg-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed' : t.primaryBg}`}>Avançar <ArrowRight className="w-4 h-4" /></button>
                )}
                {step === 2 && (
                  <button onClick={nextStep} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${t.primaryBg}`}>Avançar <ArrowRight className="w-4 h-4" /></button>
                )}
                {step === 3 && (
                  <button onClick={handleFinishClosing} disabled={isSaving || !saldoInicial || !countedCash} className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${(!saldoInicial || !countedCash) ? 'bg-zinc-300 cursor-not-allowed text-zinc-500' : t.primaryBg}`}>
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Trancar o Dia"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}