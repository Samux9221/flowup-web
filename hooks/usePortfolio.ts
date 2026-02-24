"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export type Photo = {
  id: string
  url: string
  category: string
}

export function usePortfolio(userId: string | null) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function fetchPhotos() {
      setLoading(true)

      const { data } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setPhotos(data || [])
      setLoading(false)
    }

    fetchPhotos()
  }, [userId])

  return {
    photos,
    loading,
    setPhotos
  }
}