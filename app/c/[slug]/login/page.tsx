"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft, Scissors, EyeOff, Eye, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function CustomerAuthPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Guardará o ID do dono da barbearia após ler a URL
  const [barbershopId, setBarbershopId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  })

  // 1. Descobrir quem é o dono da barbearia baseando-se no slug
  useEffect(() => {
    const fetchBarbershop = async () => {
      const { data } = await supabase
        .from('business_settings')
        .select('user_id')
        .eq('slug', slug)
        .single()
        
      if (data) setBarbershopId(data.user_id)
    }
    fetchBarbershop()
  }, [slug, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errorMsg) setErrorMsg(null) // Limpa o erro ao digitar
  }

  // 2. O Motor de Autenticação B2C com Fusão de Contas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barbershopId) {
      setErrorMsg("Conexão instável. Atualize a página e tente novamente.")
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    try {
      if (isLogin) {
        // FLUXO DE LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        
        if (error) throw new Error("E-mail ou senha incorretos.")
        
        router.push(`/c/${slug}`)

      } else {
        // FLUXO DE CADASTRO VIP (Com Fusão de Histórico)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (authError) throw new Error(authError.message)
        
        if (authData.user) {
          // Dispara a RPC no banco de dados para vincular o histórico antigo
          const { error: rpcError } = await supabase.rpc('merge_b2c_client', {
            p_barbershop_id: barbershopId,
            p_name: formData.name,
            p_phone: formData.phone,
            p_email: formData.email,
            p_auth_id: authData.user.id
          })

          if (rpcError) throw new Error("Sua conta foi criada, mas não pudemos sincronizar o histórico antigo.")
          
          router.push(`/c/${slug}`)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro inesperado.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Fundo Preto Absoluto (Estilo Apple OLED)
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto no-scrollbar flex flex-col text-white font-sans selection:bg-zinc-800">
      
      {/* HEADER MINIMALISTA */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto px-6">
        
        {/* TÍTULO E NICHO */}
        <div className="mt-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center mb-6">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {isLogin ? "Acessar Conta" : "Criar ID VIP"}
          </h1>
          <p className="text-[15px] text-zinc-500 font-medium leading-relaxed">
            {isLogin 
              ? "Gerencie seus agendamentos e histórico." 
              : "Acesso exclusivo ao programa de fidelidade e agendamento inteligente."}
          </p>
        </div>

        {/* SEGMENTED CONTROL (Apple Style Tabs) */}
        <div className="flex p-1 bg-[#1C1C1E] rounded-xl mb-8 animate-in fade-in duration-500 delay-100">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${isLogin ? 'bg-[#3A3A3C] text-white shadow-sm' : 'text-zinc-400'}`}
          >
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${!isLogin ? 'bg-[#3A3A3C] text-white shadow-sm' : 'text-zinc-400'}`}
          >
            Cadastrar
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-150">
          
          {/* ALERTA DE ERRO */}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 rounded-xl flex items-start gap-3 text-sm font-medium text-red-500 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-[13px] font-semibold text-zinc-400 ml-1 mb-1.5">Nome completo</label>
                <input 
                  type="text" name="name" required={!isLogin}
                  value={formData.name} onChange={handleChange}
                  className="w-full h-14 bg-[#1C1C1E] rounded-xl px-4 text-[17px] text-white placeholder:text-zinc-600 focus:bg-[#2C2C2E] transition-colors outline-none"
                  placeholder="Nome e sobrenome"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-zinc-400 ml-1 mb-1.5">WhatsApp</label>
                <div className="relative">
                  <input 
                    type="tel" name="phone" required={!isLogin}
                    value={formData.phone} onChange={handleChange}
                    className="w-full h-14 bg-[#1C1C1E] rounded-xl px-4 text-[17px] text-white placeholder:text-zinc-600 focus:bg-[#2C2C2E] transition-colors outline-none"
                    placeholder="(11) 99999-9999"
                  />
                  {formData.phone.length > 10 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                </div>
                <p className="text-[12px] text-zinc-500 font-medium ml-1 mt-2">
                  Usado para sincronizar pontos de cortes anteriores.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-zinc-400 ml-1 mb-1.5">E-mail</label>
            <input 
              type="email" name="email" required
              value={formData.email} onChange={handleChange}
              className="w-full h-14 bg-[#1C1C1E] rounded-xl px-4 text-[17px] text-white placeholder:text-zinc-600 focus:bg-[#2C2C2E] transition-colors outline-none"
              placeholder="exemplo@email.com"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-zinc-400 ml-1 mb-1.5">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} name="password" required
                value={formData.password} onChange={handleChange}
                className="w-full h-14 bg-[#1C1C1E] rounded-xl px-4 pr-12 text-[17px] text-white placeholder:text-zinc-600 focus:bg-[#2C2C2E] transition-colors outline-none"
                placeholder="Obrigatório"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end pt-1">
              <button type="button" className="text-[14px] text-zinc-400 font-medium hover:text-white transition-colors">
                Esqueceu a senha?
              </button>
            </div>
          )}

          {/* BOTÃO PRINCIPAL */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isLoading || !barbershopId}
              className="w-full h-14 bg-white text-black text-[17px] font-semibold rounded-xl flex items-center justify-center hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? "Aguarde..." : "Continuar"}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}