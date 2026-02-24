"use client"

import { useAuth } from "@/hooks/useAuth"
import AuthHeader from "../../components/auth/AuthHeader"
import AuthForm from "@/components/auth/AuthForm"

export default function LoginPage() {
  const { state, actions } = useAuth()
  const { isLogin } = state
  const { toggleMode } = actions

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b] p-4 selection:bg-primary/30">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-lg'} animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all`}>
        <div className="rounded-3xl border border-zinc-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/80 sm:p-10">
          
          <AuthHeader isLogin={isLogin} />

          <AuthForm state={state} actions={actions} />

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={toggleMode}
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