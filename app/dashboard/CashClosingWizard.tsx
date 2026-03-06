"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Banknote, QrCode, CreditCard, CheckCircle, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react"
import { useNiche } from "@/app/contexts/NicheContext"

export default function CashClosingWizard({ state, actions }: any) {
  const { config } = useNiche()
  const t = config.theme
  const { isOpen, step, totals, counted, saldoInicial, isLoading } = state
  const { setIsOpen, nextStep, prevStep, closeWizard, handleFinishClosing, handleCountChange, handleSaldoInicialChange } = actions

  if (isLoading) return null

  // Lógica de Diferença Visual
  const renderDifference = (expected: number, actualStr: string) => {
    if (!actualStr && expected > 0) return <div className="text-red-500 text-sm font-medium mt-3">Faltam R$ {expected.toFixed(2)}</div>
    if (!actualStr) return null
    
    const actual = parseFloat(actualStr)
    const diff = actual - expected

    if (Math.abs(diff) < 0.01) {
      return <div className="text-emerald-500 text-sm font-medium flex items-center justify-center gap-1 mt-3"><CheckCircle className="w-4 h-4" /> Bateu Exatamente</div>
    } else if (diff > 0) {
      return <div className="text-emerald-500 text-sm font-medium flex items-center justify-center gap-1 mt-3">Sobra: + R$ {diff.toFixed(2)}</div>
    } else {
      return <div className="text-red-500 text-sm font-medium flex items-center justify-center gap-1 mt-3"><AlertTriangle className="w-4 h-4" /> Quebra (Falta): - R$ {Math.abs(diff).toFixed(2)}</div>
    }
  }

  // 🔹 CÁLCULOS DINÂMICOS POR ETAPA
  const valInicialDinheiro = parseFloat(saldoInicial.dinheiro || '0')
  const valEsperadoDinheiro = totals.dinheiro + valInicialDinheiro

  const valInicialPix = parseFloat(saldoInicial.pix || '0')
  const valEsperadoPix = totals.pix + valInicialPix

  const valInicialCartao = parseFloat(saldoInicial.cartao || '0')
  const valEsperadoCartao = (totals.cartao - totals.taxasEstimadas) + valInicialCartao

  // 🔹 CÁLCULOS PARA O RESUMO GERAL
  const lucroRealContado = 
    (parseFloat(counted.dinheiro || '0') - valInicialDinheiro) +
    (parseFloat(counted.pix || '0') - valInicialPix) +
    (parseFloat(counted.cartao || '0') - valInicialCartao)
    
  const diferencaGeral = lucroRealContado - totals.totalLiquido

  // Componente reutilizável para o Saldo Inicial para manter o código limpo
  const SaldoInicialInput = ({ type, value, onChange, label, hint }: any) => (
    <div className="mb-4 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">{label}</span>
          <span className="text-xs text-zinc-500">{hint}</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <span className="text-zinc-400 text-sm font-medium">R$</span>
          <Input 
            type="number" 
            value={value}
            onChange={(e) => onChange(type, e.target.value)}
            className="w-24 text-right h-8 border-0 focus-visible:ring-0 p-0 text-base font-semibold"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 p-0 overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-[#09090b]">
        
        {/* HEADER */}
        <div className={`p-6 bg-zinc-50 border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-white/5`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${t.textHighlight}`} />
              Auditoria de Caixa
            </h2>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${s <= step ? t.bgPrimary : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-zinc-500">Conte e audite seus recebimentos reais do dia.</p>
        </div>

        {/* CORPO */}
        <div className="p-6 sm:p-8 relative min-h-[420px] overflow-y-auto">
          
          {/* STEP 1: DINHEIRO */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-full ${t.secondaryBg} ${t.textHighlight}`}><Banknote className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Gaveta Física</h3>
                  <p className="text-sm text-zinc-500">Auditoria de notas e moedas.</p>
                </div>
              </div>

              <SaldoInicialInput 
                type="dinheiro" 
                value={saldoInicial.dinheiro} 
                onChange={handleSaldoInicialChange}
                label="Saldo Inicial (Manhã)"
                hint="Troco que já estava na gaveta."
              />

              <div className="flex justify-between items-center text-sm px-2 text-zinc-500">
                <span>Vendas de hoje (Sistema):</span>
                <span>+ R$ {totals.dinheiro.toFixed(2)}</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-white/5 relative mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-2 text-center">Valor Total Contado na Gaveta</p>
                <Input 
                  type="number" 
                  value={counted.dinheiro}
                  onChange={(e) => handleCountChange('dinheiro', e.target.value)}
                  className="text-center text-4xl h-14 font-light tracking-tighter border-0 border-b-2 border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-0 focus-visible:border-zinc-900 bg-transparent px-0 transition-colors"
                  placeholder="0.00"
                />
                {renderDifference(valEsperadoDinheiro, counted.dinheiro)}
              </div>
            </div>
          )}

          {/* STEP 2: PIX */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-full ${t.secondaryBg} ${t.textHighlight}`}><QrCode className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Conta Bancária (Pix)</h3>
                  <p className="text-sm text-zinc-500">Audite o extrato do seu banco.</p>
                </div>
              </div>

              <SaldoInicialInput 
                type="pix" 
                value={saldoInicial.pix} 
                onChange={handleSaldoInicialChange}
                label="Saldo Inicial (Manhã)"
                hint="O que já tinha na conta antes de abrir."
              />

              <div className="flex justify-between items-center text-sm px-2 text-zinc-500">
                <span>Pix recebidos hoje (Sistema):</span>
                <span>+ R$ {totals.pix.toFixed(2)}</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-white/5 relative mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3 text-center">Saldo Final no Extrato (R$)</p>
                <Input 
                  type="number" 
                  value={counted.pix}
                  onChange={(e) => handleCountChange('pix', e.target.value)}
                  className="text-center text-4xl h-14 font-light tracking-tighter border-0 border-b-2 border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-0 focus-visible:border-zinc-900 bg-transparent px-0 transition-colors"
                  placeholder="0.00"
                />
                {renderDifference(valEsperadoPix, counted.pix)}
              </div>
            </div>
          )}

          {/* STEP 3: CARTÃO */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-full ${t.secondaryBg} ${t.textHighlight}`}><CreditCard className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Maquininha (Cartões)</h3>
                  <p className="text-sm text-zinc-500">Confira o saldo do App da maquininha.</p>
                </div>
              </div>

              <SaldoInicialInput 
                type="cartao" 
                value={saldoInicial.cartao} 
                onChange={handleSaldoInicialChange}
                label="Saldo Inicial (Manhã)"
                hint="Saldo que já constava no App da maquininha."
              />

              <div className="flex flex-col gap-1 text-sm px-2 text-zinc-500">
                <div className="flex justify-between items-center">
                  <span>Passado bruto hoje:</span>
                  <span>R$ {totals.cartao.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-red-400/80">
                  <span>Taxas estimadas:</span>
                  <span>- R$ {totals.taxasEstimadas.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-white/5 relative mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3 text-center">Saldo Final no App (R$)</p>
                <Input 
                  type="number" 
                  value={counted.cartao}
                  onChange={(e) => handleCountChange('cartao', e.target.value)}
                  className="text-center text-4xl h-14 font-light tracking-tighter border-0 border-b-2 border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-0 focus-visible:border-zinc-900 bg-transparent px-0 transition-colors"
                  placeholder="0.00"
                />
                {renderDifference(valEsperadoCartao, counted.cartao)}
              </div>
            </div>
          )}

          {/* STEP 4: RESUMO GERAL */}
          {step === 4 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-2">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${Math.abs(diferencaGeral) < 0.01 ? t.primaryBg : (diferencaGeral < 0 ? 'bg-red-500' : 'bg-emerald-500')}`}>
                {Math.abs(diferencaGeral) < 0.01 ? <CheckCircle className="w-8 h-8 text-white" /> : <AlertTriangle className="w-8 h-8 text-white" />}
              </div>
              
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {Math.abs(diferencaGeral) < 0.01 ? "Auditoria Perfeita!" : "Atenção ao Caixa"}
              </h3>
              <p className="text-zinc-500 mb-6 text-sm">
                {Math.abs(diferencaGeral) < 0.01 
                  ? "Seus valores bateram exatamente com o sistema." 
                  : "Houve divergência entre o sistema e o mundo real."}
              </p>
              
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-white/5 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-zinc-500">Lucro Esperado Hoje</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">R$ {totals.totalLiquido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-zinc-500">Lucro Real (Sem Saldos Iniciais)</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">R$ {lucroRealContado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-sm uppercase tracking-wider text-zinc-500">Quebra de Caixa</span>
                  <span className={`text-xl font-bold ${Math.abs(diferencaGeral) < 0.01 ? 'text-emerald-500' : (diferencaGeral < 0 ? 'text-red-500' : 'text-emerald-500')}`}>
                    {Math.abs(diferencaGeral) < 0.01 ? "R$ 0,00" : `${diferencaGeral > 0 ? '+' : ''} R$ ${diferencaGeral.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BOTÕES */}
        <div className="p-6 border-t border-zinc-100 dark:border-white/5 flex justify-between gap-4 bg-white dark:bg-zinc-950">
          {step > 1 && step < 4 ? (
            <button onClick={prevStep} className="px-6 py-2.5 rounded-xl font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              Voltar
            </button>
          ) : <div />}

          {step < 4 ? (
            <button 
              onClick={nextStep} 
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium text-white shadow-md transition-transform active:scale-95 ${t.primaryBg}`}
            >
              Avançar <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleFinishClosing} 
              className={`w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${Math.abs(diferencaGeral) < 0.01 ? t.primaryBg : (diferencaGeral < 0 ? 'bg-red-500 shadow-red-500/20' : 'bg-emerald-500 shadow-emerald-500/20')}`}
            >
              Registrar Auditoria
            </button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}