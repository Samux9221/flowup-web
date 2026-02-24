"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useNiche } from "../app/contexts/NicheContext"

export function useServices() {
  const router = useRouter()
  const { config } = useNiche()
  const ServiceIcon = config.icons.service
  const t = config.theme

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("30")
  const [type, setType] = useState<"service" | "product">("service")
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase, router])

  const fetchServices = async () => {
    if (!userId) return
    setIsLoadingData(true)
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", userId)
      .order("type", { ascending: false }) 
      .order("title")
    
    if (data) setServices(data)
    setIsLoadingData(false)
  }

  useEffect(() => {
    if (userId) fetchServices()
  }, [userId])

  const handleSaveService = async () => {
    if (!title || !price || (type === "service" && !duration)) {
      toast.error("Preencha todos os campos obrigatórios!")
      return
    }
    if (!userId) return

    setIsSaving(true)
    const formattedPrice = parseFloat(price.replace(",", "."))
    const durationMinutes = type === "product" ? 0 : parseInt(duration)

    const payload = { 
      user_id: userId,
      title, 
      price: formattedPrice, 
      duration_minutes: durationMinutes,
      type: type 
    }

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", userId)

      if (error) toast.error("Erro ao atualizar: " + error.message)
      else toast.success("Item atualizado com sucesso! ✨")
    } else {
      const { error } = await supabase
        .from("services")
        .insert([payload])

      if (error) toast.error("Erro ao salvar: " + error.message)
      else toast.success("Novo item adicionado! 🎉")
    }

    setIsSaving(false)
    setIsSheetOpen(false)
    resetForm()
    fetchServices()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) return
    const { error } = await supabase.from("services").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      toast.error("Erro ao excluir: " + error.message)
    } else {
      toast.success("Item excluído com sucesso!")
      fetchServices()
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setPrice("")
    setDuration("30")
    setType("service")
  }

  const openEditPanel = (service: any) => {
    setEditingId(service.id)
    setTitle(service.title)
    setPrice(service.price.toString())
    setDuration(service.duration_minutes?.toString() || "30")
    setType(service.type || "service") 
    setActiveDropdown(null)
    setIsSheetOpen(true)
  }

  const openNewPanel = () => {
    resetForm()
    setIsSheetOpen(true)
  }

  return {
    state: { config, t, ServiceIcon, services, isLoadingData, isSheetOpen, isSaving, editingId, title, price, duration, type, activeDropdown },
    actions: { setIsSheetOpen, setTitle, setPrice, setDuration, setType, setActiveDropdown, handleSaveService, handleDelete, openEditPanel, openNewPanel, resetForm }
  }
}