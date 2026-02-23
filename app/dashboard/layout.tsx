"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, LayoutDashboard, Settings, LogOut, Sparkles, Menu, X } from "lucide-react"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 🔹 PUXANDO TUDO: Configurações e Tema
  const { config, isLoadingNiche } = useNiche()
  const t = config.theme // Atalho para o nosso design system

  const isActive = (path: string) => pathname === path
  
  const PrimaryIcon = config.icons.primary
  const ServiceIcon = config.icons.service

  // Se o contexto ainda estiver buscando o nicho, podemos mostrar um loading (opcional)
  if (isLoadingNiche) {
    return <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b]"><Sparkles className="h-8 w-8 animate-pulse text-zinc-400" /></div>
  }

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
        <div className="flex h-20 items-center justify-between px-8 border-b border-zinc-200/60 dark:border-white/5">
          <div className="flex items-center gap-3">
            {/* 🔹 LOGO COM COR DINÂMICA DO NICHO */}
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.primaryBg} shadow-lg shadow-zinc-900/10`}>
              <PrimaryIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
              FlowUp
            </span>
            <Sparkles className="h-3 w-3 text-yellow-500 ml-1" />
          </div>
          
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-zinc-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
          <NavItem 
            href="/dashboard" 
            icon={LayoutDashboard} 
            label="Visão Geral" 
            active={isActive("/dashboard")} 
            onClick={() => setIsMobileMenuOpen(false)}
            t={t}
          />
          <NavItem 
            href="/dashboard/agenda" 
            icon={Calendar} 
            label="Agenda" 
            active={isActive("/dashboard/agenda")} 
            onClick={() => setIsMobileMenuOpen(false)}
            t={t}
          />
          <NavItem 
            href="/dashboard/services" 
            icon={ServiceIcon}
            label="Serviços" 
            active={isActive("/dashboard/services")} 
            onClick={() => setIsMobileMenuOpen(false)}
            t={t}
          />
          
          {/* 🔹 FEATURE TOGGLING */}
          {config.features.hasGallery && (
             <NavItem 
               href="/dashboard/portfolio" 
               icon={Sparkles}
               label="Portfólio" 
               active={isActive("/dashboard/portfolio")} 
               onClick={() => setIsMobileMenuOpen(false)}
               t={t}
             />
          )}

        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-zinc-200/60 dark:border-white/5">
          <NavItem 
            href="/dashboard/configuracoes" 
            icon={Settings} 
            label="Configurações" 
            active={isActive("/dashboard/configuracoes")} 
            onClick={() => setIsMobileMenuOpen(false)}
            t={t}
          />
          <button className={`mt-2 flex w-full items-center gap-3 ${t.radius} px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400`}>
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER MOBILE */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200/60 bg-white/50 px-4 backdrop-blur-md dark:border-white/5 dark:bg-zinc-900/50 md:hidden">
          <div className="flex items-center gap-2">
            <PrimaryIcon className={`h-5 w-5 ${t.textHighlight}`} />
            <span className="font-bold text-zinc-900 dark:text-white">FlowUp</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex h-10 w-10 items-center justify-center ${t.radius} border border-zinc-200 bg-white text-zinc-900 dark:border-white/10 dark:bg-zinc-800 dark:text-white`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 sm:p-8 lg:p-12">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  )
}

// 🔹 NAV ITEM ATUALIZADO PARA RECEBER O TEMA
function NavItem({ href, icon: Icon, label, active, onClick, t }: { href: string; icon: any; label: string; active: boolean; onClick?: () => void; t: any }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`group flex items-center gap-3 ${t.radius} px-4 py-3 text-sm font-medium transition-all duration-300 ${
        active 
          ? `${t.primaryBg} text-white shadow-md` 
          : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      <Icon className={`h-4 w-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
      {label}
    </Link>
  )
}