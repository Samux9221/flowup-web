"use client"

import { Mail, Lock, Scissors, Sparkles, Loader2, Store, Flower2, CheckCircle2 } from "lucide-react"

const NICHE_OPTIONS = [
  { id: "barbearia", label: "Barbearia", icon: Scissors },
  { id: "salao_beleza", label: "Salão", icon: Flower2 },
  { id: "manicure", label: "Nail Designer", icon: Sparkles },
]

export default function AuthForm({ state, actions }: { state: any, actions: any }) {
  const { isLogin, email, password, businessName, selectedNiche, isLoading, error } = state
  const { setEmail, setPassword, setBusinessName, setSelectedNiche, handleAuth } = actions

  return (
    <>
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
    </>
  )
}