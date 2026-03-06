"use client"

import React, { useState } from "react"
import { useNiche } from "../../contexts/NicheContext"
import { useClients } from "@/hooks/useClients" // 🔹 O nosso motor de IA importado aqui
import { toast } from "sonner"
import { 
  Users, Star, AlertTriangle, MessageCircle, DollarSign, 
  TrendingUp, CalendarDays, Plus, Gift, Wallet, ChevronRight, X
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ClientesPage() {
  const { config } = useNiche()
  const t = config.theme
  
  // 🧠 O CÉREBRO: Puxando tudo do nosso Hook
  const { state: { isLoading, metrics, lists }, actions: { addClient } } = useClients()

  // Estados da Interface
  const [activeTab, setActiveTab] = useState<'VENCIDOS' | 'FIADOS' | 'QUASE_LA' | 'VIPS'>('VENCIDOS')
  
  // Estados dos Modais
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", birthday: "", notes: "" })
  const [isSaving, setIsSaving] = useState(false)

  // Ação de Salvar Cliente Manual
  const handleSaveClient = async () => {
    if (!formData.name) return toast.error("O nome é obrigatório.")
    setIsSaving(true)
    const success = await addClient(formData)
    if (success) {
      setIsNewClientOpen(false)
      setFormData({ name: "", phone: "", birthday: "", notes: "" })
    }
    setIsSaving(false)
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  // 💬 GERADORES DE MENSAGENS DE VENDAS (COPYWRITING)
  const getWhatsAppLink = (client: any, type: string) => {
    if (!client.phone) return "#"
    const phone = client.phone.replace(/\D/g, '')
    const firstName = client.name.split(' ')[0]
    let msg = ""

    switch (type) {
      case 'VENCIDOS':
        msg = `Fala ${firstName}, tudo bem? Vi aqui que já faz uns dias desde o seu último talento no visual. Bora agendar um horário pra essa semana?`
        break
      case 'FIADOS':
        msg = `Fala ${firstName}, mestre! Tudo na paz? Passando só pra deixar a chave Pix (SUA-CHAVE-AQUI) daquele último atendimento de R$ ${client.total_debt},00 que ficou pendente. Tamo junto!`
        break
      case 'QUASE_LA':
        msg = `E aí ${firstName}! Você está a apenas ${client.visits_to_reward} corte(s) de ganhar o seu brinde de fidelidade aqui na ${config.title}! Tem horário livre amanhã, bora fechar essa cartela?`
        break
      case 'VIPS':
        msg = `Fala ${firstName}, você é um dos nossos melhores clientes! Manda o nosso link de agendamento pra um amigo, se ele vier, o seu próximo corte sai com 20% de desconto!`
        break
    }
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className={`h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-${t.primaryBg.replace('bg-', '')}`} />
        <p className="animate-pulse text-zinc-500 font-medium text-sm">Calculando inteligência do CRM...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-4">
      
      {/* 🔹 HEADER E AÇÃO PRINCIPAL 🔹 */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">CRM & Retenção</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Transforme dados em agendamentos e recupere receita.</p>
        </div>
        <button 
          onClick={() => setIsNewClientOpen(true)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${t.bgPrimary} ${t.textOnPrimary}`}
        >
          <Plus className="w-5 h-5" /> Adicionar Cliente
        </button>
      </header>

      {/* 🔹 O CHOQUE DE REALIDADE (Métricas do Topo) 🔹 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        <MetricCard title="Base de Clientes" value={metrics.total} icon={Users} color="text-zinc-600 dark:text-zinc-400" bg="bg-zinc-100 dark:bg-zinc-800" t={t} />
        <MetricCard title="Ativos (45 dias)" value={metrics.ativos} icon={CalendarDays} color={t.textHighlight} bg={t.secondaryBg} t={t} />
        <MetricCard title="Retenção" value={`${metrics.retencao}%`} icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-900/30" t={t} />
        <MetricCard title="Dinheiro na Rua" value={`R$ ${metrics.totalFiado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="text-rose-600 dark:text-rose-400" bg="bg-rose-100 dark:bg-rose-900/30" t={t} />
      </div>

      {/* 🔹 AS GAVETAS DE AÇÃO (O Painel Tático) 🔹 */}
      <div className={`overflow-hidden ${t.radius} border border-zinc-200/60 bg-white/50 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30`}>
        
        {/* Navegação das Gavetas */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/50 p-2 gap-2">
          <TabButton active={activeTab === 'VENCIDOS'} onClick={() => setActiveTab('VENCIDOS')} icon={AlertTriangle} label="Cortes Vencidos" count={lists.vencidos.length} color="text-amber-500" t={t} />
          <TabButton active={activeTab === 'FIADOS'} onClick={() => setActiveTab('FIADOS')} icon={Wallet} label="Caderneta (Fiado)" count={lists.fiados.length} color="text-rose-500" t={t} />
          <TabButton active={activeTab === 'QUASE_LA'} onClick={() => setActiveTab('QUASE_LA')} icon={Gift} label="Fidelidade" count={lists.quaseLa.length} color="text-emerald-500" t={t} />
          <TabButton active={activeTab === 'VIPS'} onClick={() => setActiveTab('VIPS')} icon={Star} label="Reis da Cadeira" count={lists.vips.length} color="text-amber-400" t={t} />
        </div>

        {/* Conteúdo da Gaveta Ativa */}
        <div className="p-0">
          
          {/* GAVETA 1: CORTES VENCIDOS */}
          {activeTab === 'VENCIDOS' && (
            <ListContainer emptyMsg="Sua retenção está perfeita! Ninguém sumido." emptyIcon={TrendingUp}>
              {lists.vencidos.map(client => (
                <ClientRow 
                  key={client.id} client={client} t={t}
                  onClick={() => setSelectedClient(client)}
                  mainMetric={`${client.days_away} dias sem vir`}
                  subMetric="Risco de perda"
                  metricColor="text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
                  whatsappLink={getWhatsAppLink(client, 'VENCIDOS')}
                />
              ))}
            </ListContainer>
          )}

          {/* GAVETA 2: FIADOS */}
          {activeTab === 'FIADOS' && (
            <ListContainer emptyMsg="Nenhum pagamento pendente. Fluxo de caixa limpo!" emptyIcon={DollarSign}>
              {lists.fiados.map(client => (
                <ClientRow 
                  key={client.id} client={client} t={t}
                  onClick={() => setSelectedClient(client)}
                  mainMetric={`R$ ${client.total_debt.toFixed(2)}`}
                  subMetric={`${client.pending_count} serviço(s) pendente(s)`}
                  metricColor="text-rose-600 bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
                  whatsappLink={getWhatsAppLink(client, 'FIADOS')}
                />
              ))}
            </ListContainer>
          )}

          {/* GAVETA 3: FIDELIDADE */}
          {activeTab === 'QUASE_LA' && (
            <ListContainer emptyMsg="Nenhum cliente perto de fechar a cartela no momento." emptyIcon={Gift}>
              {lists.quaseLa.map(client => (
                <ClientRow 
                  key={client.id} client={client} t={t}
                  onClick={() => setSelectedClient(client)}
                  mainMetric={`Falta ${client.visits_to_reward} corte(s)`}
                  subMetric={`${client.total_visits % 10}/10 preenchidos`}
                  metricColor="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                  whatsappLink={getWhatsAppLink(client, 'QUASE_LA')}
                />
              ))}
            </ListContainer>
          )}

          {/* GAVETA 4: VIPS */}
          {activeTab === 'VIPS' && (
            <ListContainer emptyMsg="Comece a atender para formar seus VIPs." emptyIcon={Star}>
              {lists.vips.map((client, idx) => (
                <ClientRow 
                  key={client.id} client={client} t={t}
                  onClick={() => setSelectedClient(client)}
                  mainMetric={`Top #${idx + 1}`}
                  subMetric={`LTV: R$ ${Number(client.total_spent).toFixed(2)}`}
                  metricColor="text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
                  whatsappLink={getWhatsAppLink(client, 'VIPS')}
                />
              ))}
            </ListContainer>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: NOVO CLIENTE MANUL */}
      {/* ========================================================= */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-[2rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">Adicionar Manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Nome Completo</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 font-medium outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800" placeholder="Ex: Carlos Eduardo" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">WhatsApp</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 font-medium outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Aniversário</label>
                <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm font-medium outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800" />
              </div>
            </div>
          </div>
          <button disabled={isSaving} onClick={handleSaveClient} className={`w-full mt-8 py-4 rounded-2xl ${t.primaryBg} text-white font-black shadow-lg hover:brightness-110 transition-all`}>
            {isSaving ? "Salvando..." : "Salvar Cliente"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==========================================
// COMPONENTES AUXILIARES DE INTERFACE
// ==========================================

function MetricCard({ title, value, icon: Icon, color, bg, t }: any) {
  return (
    <div className={`p-5 rounded-[2rem] border border-zinc-200/60 bg-white/50 backdrop-blur-xl shadow-sm dark:border-white/5 dark:bg-zinc-900/30 flex flex-col gap-3`}>
      <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white leading-none mt-1">{value}</p>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label, count, color, t }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
        active 
          ? `bg-white dark:bg-zinc-800 shadow-md text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700` 
          : `text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white border border-transparent`
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? color : ""}`} /> {label}
      <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'bg-zinc-200/50 dark:bg-zinc-800'}`}>
        {count}
      </span>
    </button>
  )
}

function ListContainer({ children, emptyMsg, emptyIcon: Icon }: any) {
  const childrenArray = React.Children.toArray(children)
  if (childrenArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <Icon className="h-12 w-12 mb-4 opacity-20" />
        <p className="font-bold text-zinc-600 dark:text-zinc-300">{emptyMsg}</p>
      </div>
    )
  }
  return <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">{children}</div>
}

function ClientRow({ client, mainMetric, subMetric, metricColor, whatsappLink, onClick, t }: any) {
  const initials = client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors gap-4">
      
      {/* Info Principal */}
      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={onClick}>
        <div className={`h-12 w-12 rounded-[1rem] flex flex-shrink-0 items-center justify-center font-black text-sm text-white shadow-sm ${t.primaryBg}`}>
          {initials}
        </div>
        <div>
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">{client.name}</h4>
          <p className="text-xs text-zinc-500 mt-0.5">{client.phone || 'Sem contato'}</p>
        </div>
      </div>

      {/* Métricas e Botões */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <div className="text-left sm:text-right">
          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${metricColor}`}>
            {mainMetric}
          </span>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{subMetric}</p>
        </div>

        <div className="flex items-center gap-2">
          {client.phone && (
            <a 
              href={whatsappLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all font-bold text-xs dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/50"
              title="Disparar Mensagem"
            >
              <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">Cobrar</span>
            </a>
          )}
        </div>
      </div>

    </div>
  )
}