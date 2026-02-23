"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Mail, Lock, Scissors, Sparkles, Loader2, Store, Flower2, CheckCircle2 } from "lucide-react"

// Função utilitária para gerar o slug (URL amigável)
const generateSlug = (text: string) => {
  return text
    .normalize("NFD") // Remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Troca espaços por hífens
}

// Definição dos nichos disponíveis para o cadastro
const NICHE_OPTIONS = [
  { id: "barbearia", label: "Barbearia", icon: Scissors },
  { id: "salao_beleza", label: "Salão", icon: Flower2 },
  { id: "manicure", label: "Nail Designer", icon: Sparkles },
]

export default function LoginPage() {
  // Estados do formulário
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("barbearia") // Estado novo para o nicho
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!isLogin) {
        // --- FLUXO DE CADASTRO (SAAS ONBOARDING) ---
        if (!businessName.trim()) {
          setError("Por favor, informe o nome do seu negócio.")
          setIsLoading(false)
          return
        }

        // 1. Cria o usuário na autenticação do Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        if (authData.user) {
          // 2. Gera o slug baseado no nome do negócio
          const slug = generateSlug(businessName)

          // 3. Salva o negócio na tabela incluindo o NICHO escolhido
          const { error: dbError } = await supabase
            .from('business_settings') 
            .insert({
              user_id: authData.user.id,
              business_name: businessName,
              slug: slug,
              nicho: selectedNiche, // <--- INSERINDO O NICHO AQUI
            })

          if (dbError) {
            console.error("Erro ao criar negócio:", dbError)
            setError("Conta criada, mas houve um erro ao configurar seu negócio.")
            setIsLoading(false)
            return
          }
        }
      } else {
        // --- FLUXO DE LOGIN NORMAL ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError
      }

      // Se deu tudo certo, vai pro Dashboard
      router.push("/dashboard")
      router.refresh()

    } catch (err: any) {
      console.error("ERRO DETALHADO:", err) 
      setError(err.message || "Erro desconhecido ao tentar autenticar.") 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b] p-4 selection:bg-primary/30">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-lg'} animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all`}>
        <div className="rounded-3xl border border-zinc-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/80 sm:p-10">
          
          {/* Logo e Cabeçalho */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-lg shadow-zinc-900/20 dark:from-zinc-100 dark:to-zinc-300">
              <Sparkles className="h-6 w-6 text-white dark:text-black" />
            </div>
            <h1 className="flex items-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              FlowUp
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {isLogin 
                ? "Entre na sua conta para gerenciar sua agenda." 
                : "Crie sua conta e tenha seu sistema de agendamentos."}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-2">
              <span className="block h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400 animate-pulse"></span>
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleAuth} className="space-y-5">
            
            {!isLogin && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Seletor de Nicho Premium */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Qual é o seu segmento?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {NICHE_OPTIONS.map((niche) => {
                      const Icon = niche.icon
                      const isSelected = selectedNiche === niche.id
                      return (
                        <button
                          key={niche.id}
                          type="button"
                          onClick={() => setSelectedNiche(niche.id)}
                          className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all duration-200 ${
                            isSelected 
                              ? "border-zinc-900 bg-zinc-50 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-900/50 dark:text-zinc-100 shadow-sm" 
                              : "border-zinc-200/60 bg-white/50 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900/30 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-zinc-900/50"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-zinc-900 dark:text-zinc-100 animate-in zoom-in duration-200" />
                          )}
                          <Icon className={`h-6 w-6 ${isSelected ? 'opacity-100' : 'opacity-70'}`} />
                          <span className="text-xs font-semibold">{niche.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Campo Nome do Negócio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Nome do Negócio</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Studio VIP" 
                      className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full rounded-2xl border border-zinc-200/60 bg-white/50 py-3.5 pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-white/10 dark:bg-zinc-900/50 dark:text-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Botão de Ação Principal */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70 dark:bg-white dark:text-zinc-950"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? "Entrar na conta" : "Criar minha conta")}
              </button>
            </div>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {isLogin 
                ? "Ainda não tem uma conta? Cadastre-se grátis" 
                : "Já tem uma conta? Faça login"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}