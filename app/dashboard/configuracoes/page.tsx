"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Store, 
  Phone, 
  Clock, 
  Save, 
  Loader2,
  Link as LinkIcon,
  Palette,
  MessageSquare,
  LayoutTemplate,
  CheckCircle2,
  Sparkles
} from "lucide-react"

// 🔹 IMPORTANDO O NOSSO CÉREBRO
import { useNiche } from "../../contexts/NicheContext"

export default function ConfiguracoesPage() {
  const router = useRouter()
  
  // 🔹 PUXANDO A INTELIGÊNCIA E O DESIGN SYSTEM
  const { config } = useNiche()
  const t = config.theme // 🎨 A mágica visual mora aqui

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingSettings, setHasExistingSettings] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  // 🔹 ESTADOS DO FORMULÁRIO
  const [businessName, setBusinessName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("18:00")
  const [primaryColor, setPrimaryColor] = useState("#09090b")
  const [slug, setSlug] = useState("")
  
  // 🆕 NOVOS ESTADOS PREMIUM
  const [whatsappMessage, setWhatsappMessage] = useState("Olá {cliente}, seu agendamento para {servico} no dia {data} às {hora} está confirmado! Obrigado pela preferência.")
  const [theme, setTheme] = useState("liso")

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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase, router])

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return

      setIsLoading(true)
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (data) {
        setSettingsId(data.id)
        setBusinessName(data.business_name || "")
        setWhatsappNumber(data.whatsapp_number || "")
        setOpenTime(data.open_time || "08:00")
        setCloseTime(data.close_time || "18:00")
        setPrimaryColor(data.primary_color || "#09090b")
        setSlug(data.slug || "")
        setWhatsappMessage(data.whatsapp_message || "Olá {cliente}, seu agendamento para {servico} no dia {data} às {hora} está confirmado!")
        setTheme(data.theme || "minimalista")
        setHasExistingSettings(true)
      }
      setIsLoading(false)
    }

    fetchSettings()
  }, [userId, supabase])

  const handleSaveSettings = async () => {
    if (!businessName || !whatsappNumber) {
      toast.error("O Nome e o WhatsApp são obrigatórios!")
      return
    }

    if (!userId) return
    setIsSaving(true)

    const payload = {
      user_id: userId,
      business_name: businessName,
      whatsapp_number: whatsappNumber,
      open_time: openTime,
      close_time: closeTime,
      primary_color: primaryColor,
      slug: slug || null,
      whatsapp_message: whatsappMessage,
      theme: theme
    }

    let error;

    if (hasExistingSettings && settingsId) {
      const { error: updateError } = await supabase
        .from("business_settings")
        .update(payload)
        .eq("id", settingsId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("business_settings")
        .insert([payload])
      error = insertError
      if (!error) setHasExistingSettings(true)
    }

    if (error) {
      if (error.code === '23505' && error.message.includes('slug')) {
        toast.error(`Esse link (slug) já está em uso por outro(a) ${config.title.toLowerCase()}!`)
      } else {
        toast.error("Erro ao salvar: " + error.message)
      }
    } else {
      toast.success("Configurações salvas com sucesso! 🚀")
    }

    setIsSaving(false)
  }

  // Função para inserir a tag no texto onde o cursor estiver
  const insertTag = (tag: string) => {
    setWhatsappMessage((prev) => prev + ` {${tag}}`)
    toast.success(`Variável {${tag}} adicionada!`)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-400">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${t.textHighlight}`} />
        <p>A carregar configurações...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Configurações</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
          Personalize a página pública, horários e estilo do(a) seu(ua) <span className={`font-bold ${t.textHighlight}`}>{config.title.toLowerCase()}</span>.
        </p>
      </header>

      <div className="rounded-3xl border border-zinc-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/30 sm:p-10 space-y-12">
        
        {/* SEÇÃO: DADOS DO ESTABELECIMENTO */}
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
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder={`ex: ${config.title.toLowerCase()}-do-joao`}
                  className={`w-full ${t.radius} border border-zinc-200/60 bg-white/50 py-3 pl-12 pr-4 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-colors`}
                />
              </div>
              <p className="text-xs text-zinc-500">O teu link será: app.com/<strong>{slug || "..."}</strong></p>
            </div>
          </div>
        </div>

        {/* SEÇÃO: HORÁRIOS & ESTILO (AGORA COM PRESETS) */}
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

        {/* SEÇÃO: MENSAGEM DO WHATSAPP */}
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

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-6 border-t border-zinc-200/60 dark:border-white/10">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 ${t.radius} ${t.primaryBg} ${t.primaryHover} px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-${t.primaryBg}/20 transition-all active:scale-[0.98] disabled:opacity-70`}
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSaving ? "A guardar..." : "Guardar Configurações"}
          </button>
        </div>

      </div>
    </div>
  )
}