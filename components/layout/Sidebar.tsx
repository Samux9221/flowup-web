"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut 
} from "lucide-react"

import { useNiche } from "@/app/contexts/NicheContext"
import { toast } from "sonner"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useNiche()
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Erro ao sair da conta.")
    } else {
      router.push("/login")
    }
  }

  // A Regra de 6: Apenas o que importa para a operação
  const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Agenda", icon: Calendar, href: "/dashboard/agenda" },
    { name: "Financeiro", icon: Wallet, href: "/dashboard/financas" },
    { name: "Clientes", icon: Users, href: "/dashboard/clientes" },
    { name: "Vitrine", icon: ImageIcon, href: "/dashboard/portifolio" },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200/60 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/50">
      
      {/* Logotipo / Marca */}
      <div className="flex h-20 shrink-0 items-center px-8 border-b border-zinc-200/60 dark:border-white/5">
        <div className={`flex items-center gap-3 font-black tracking-tight text-2xl text-zinc-900 dark:text-white`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.primaryBg} text-white shadow-lg`}>
            <config.icons.primary className="h-6 w-6" />
          </div>
          Flow<span className={t.textHighlight}>Up</span>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 space-y-2 px-4 py-8 overflow-y-auto no-scrollbar">
        <div className="text-xs font-black uppercase tracking-widest text-zinc-400 px-4 mb-4">
          Operação Diária
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
                isActive
                  ? `${t.primaryBg} text-white shadow-md scale-[1.02]`
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Área Inferior (Configurações e Logout) */}
      <div className="shrink-0 border-t border-zinc-200/60 p-4 dark:border-white/5 space-y-2">
        <Link
          href="/dashboard/configuracoes"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
            pathname.includes("/dashboard/configuracoes")
              ? `bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800`
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5" />
          Ajustes
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-500 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </button>
      </div>
      
    </aside>
  )
}