"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { NicheType, NicheConfig, getNicheConfig } from "@/lib/nicheConfig"

interface NicheContextType {
  niche: NicheType
  config: NicheConfig
  isLoadingNiche: boolean
}

const NicheContext = createContext<NicheContextType | undefined>(undefined)

export function NicheProvider({ children }: { children: React.ReactNode }) {
  const [niche, setNiche] = useState<NicheType>("padrao")
  const [isLoadingNiche, setIsLoadingNiche] = useState(true)

  useEffect(() => {
    const fetchNiche = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .from('business_settings')
            .select('nicho')
            .eq('user_id', user.id)
            .single()

          if (data?.nicho) {
            setNiche(data.nicho as NicheType)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nicho:", error)
      } finally {
        setIsLoadingNiche(false)
      }
    }

    fetchNiche()
  }, [])

  const config = getNicheConfig(niche)

  return (
    <NicheContext.Provider value={{ niche, config, isLoadingNiche }}>
      {children}
    </NicheContext.Provider>
  )
}

export function useNiche() {
  const context = useContext(NicheContext)
  if (context === undefined) {
    throw new Error("useNiche deve ser usado dentro de um NicheProvider")
  }
  return context
}