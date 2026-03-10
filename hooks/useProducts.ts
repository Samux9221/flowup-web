"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function useProducts(userId: string | null) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([]) // 🔹 ADICIONE ESTA LINHA

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      
      // Busca limpa: pega todos os produtos do usuário, sem filtros inventados
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true })

      if (error) {
        console.error("🔴 Erro ao buscar produtos no Supabase:", error.message)
        setProducts([])
      } else if (data) {
        console.log("🟢 Produtos encontrados:", data) // Vai aparecer no console do seu navegador!
        setProducts(data)
      }

      setLoading(false)
    }

    fetchProducts()
  }, [userId, supabase])

  return { products, loading }
}