"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Wallet,
  Users,
  ImageIcon
} from "lucide-react"

// Importando o nosso Cérebro
import { NicheProvider, useNiche } from "../contexts/NicheContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NicheProvider>
      <DashboardContent>{children}</DashboardContent>
    </NicheProvider>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 🔹 PUXANDO TUDO: Configurações e Tema
  const { config, isLoadingNiche } = useNiche()
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

  // Função robusta para verificar se a rota está ativa
  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path
    return pathname.startsWith(path)
  }
  
  const PrimaryIcon = config.icons.primary

  if (isLoadingNiche) {
    return <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b]"><LayoutDashboard className="h-8 w-8 animate-pulse text-zinc-400" /></div>
  }

  // 🔹 A REGRA DOS 6 BOTÕES MESTRES 🔹
  const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Agenda", icon: Calendar, href: "/dashboard/agenda" },
    { name: "Financeiro", icon: Wallet, href: "/dashboard/financas" },
    { name: "Clientes", icon: Users, href: "/dashboard/clientes" },
    { name: "Vitrine", icon: ImageIcon, href: "/dashboard/portfolio" },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#09090b] selection:bg-primary/30">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200/60 dark:border-white/5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header da Sidebar (Logo) */}
        <div className="flex h-20 shrink-0 items-center justify-between px-8 border-b border-zinc-200/60 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.primaryBg} shadow-lg shadow-zinc-900/10`}>
              <PrimaryIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
              Flow<span className={t.textHighlight}>Up</span>
            </span>
          </div>
          
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-zinc-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navegação Operacional */}
        <nav className="flex-1 flex flex-col gap-1.5 px-4 py-8 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4 mb-3">
            Operação Diária
          </div>
          
          {menuItems.map((item) => (
             <NavItem 
               key={item.href}
               href={item.href} 
               icon={item.icon} 
               label={item.name} 
               active={isActive(item.href)} 
               onClick={() => setIsMobileMenuOpen(false)}
               t={t}
             />
          ))}
        </nav>

        {/* Footer da Sidebar (Configurações e Saída) */}
        <div className="shrink-0 p-4 border-t border-zinc-200/60 dark:border-white/5 space-y-2">
          <NavItem 
            href="/dashboard/configuracoes" 
            icon={Settings} 
            label="Ajustes" 
            active={isActive("/dashboard/configuracoes")} 
            onClick={() => setIsMobileMenuOpen(false)}
            t={t}
            isSettings
          />
          <button 
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400`}
          >
            <LogOut className="h-5 w-5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* ÁREA CENTRAL DO DASHBOARD */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER MOBILE */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/60 bg-white/50 px-4 backdrop-blur-md dark:border-white/5 dark:bg-zinc-900/50 md:hidden">
          <div className="flex items-center gap-2">
            <PrimaryIcon className={`h-6 w-6 ${t.textHighlight}`} />
            <span className="font-black text-lg text-zinc-900 dark:text-white">Flow<span className={t.textHighlight}>Up</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-white/10 dark:bg-zinc-800 dark:text-white`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* CONTEÚDO DA PÁGINA (Gráficos, Agenda, etc.) */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  )
}

// 🔹 NAV ITEM ATUALIZADO (Mais Elegante e Espaçado)
function NavItem({ href, icon: Icon, label, active, onClick, t, isSettings = false }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
        active 
          ? isSettings 
             ? "bg-zinc-100 text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800" 
             : `${t.primaryBg} text-white shadow-md scale-[1.02]`
          : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white"
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform duration-300 ${active && !isSettings ? "scale-110 text-white" : "group-hover:scale-110"}`} />
      {label}
    </Link>
  )
}