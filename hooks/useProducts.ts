"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export type Product = {
  id: string
  name: string
  price: number
  stock: number
  image_url: string
}

export function useProducts(userId: string | null) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function fetchProducts() {
      setLoading(true)

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setProducts(data || [])
      setLoading(false)
    }

    fetchProducts()
  }, [userId])

  return {
    products,
    loading,
    setProducts
  }
}