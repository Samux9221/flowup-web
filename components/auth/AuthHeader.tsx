"use client"

import { Sparkles } from "lucide-react"

export default function AuthHeader({ isLogin }: { isLogin: boolean }) {
  return (
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
  )
}