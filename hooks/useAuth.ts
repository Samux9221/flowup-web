"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

// Função utilitária para gerar o slug (URL amigável)
const generateSlug = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-")
}

export function useAuth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("barbearia")
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
        // --- FLUXO DE CADASTRO ---
        if (!businessName.trim()) {
          setError("Por favor, informe o nome do seu negócio.")
          setIsLoading(false)
          return
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        if (authData.user) {
          const slug = generateSlug(businessName)
          const { error: dbError } = await supabase
            .from('business_settings') 
            .insert({
              user_id: authData.user.id,
              business_name: businessName,
              slug: slug,
              nicho: selectedNiche,
            })

          if (dbError) {
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

      router.push("/dashboard")
      router.refresh()

    } catch (err: any) {
      console.error("ERRO DETALHADO:", err) 
      setError(err.message || "Erro desconhecido ao tentar autenticar.") 
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
  }

  return {
    state: { isLogin, email, password, businessName, selectedNiche, isLoading, error },
    actions: { setEmail, setPassword, setBusinessName, setSelectedNiche, handleAuth, toggleMode }
  }
}