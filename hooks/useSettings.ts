"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function useSettings() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingSettings, setHasExistingSettings] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  // Estados do Formulário
  const [businessName, setBusinessName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("18:00")
  const [primaryColor, setPrimaryColor] = useState("#09090b")
  const [slug, setSlug] = useState("")
  const [whatsappMessage, setWhatsappMessage] = useState("Olá {cliente}, seu agendamento para {servico} no dia {data} às {hora} está confirmado! Obrigado pela preferência.")
  const [theme, setTheme] = useState("liso")

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

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) return

      setIsLoading(true)
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (data) {
        setSettingsId(data.id)
        setBusinessName(data.business_name || "")
        setWhatsappNumber(data.whatsapp_number || "")
        setOpenTime(data.open_time || "08:00")
        setCloseTime(data.close_time || "18:00")
        setPrimaryColor(data.primary_color || "#09090b")
        setSlug(data.slug || "")
        setWhatsappMessage(data.whatsapp_message || "Olá {cliente}, seu agendamento para {servico} no dia {data} às {hora} está confirmado!")
        setTheme(data.theme || "liso")
        setHasExistingSettings(true)
      }
      setIsLoading(false)
    }

    fetchSettings()
  }, [userId, supabase])

  const handleSaveSettings = async () => {
    if (!businessName || !whatsappNumber) {
      toast.error("O Nome e o WhatsApp são obrigatórios!")
      return
    }

    if (!userId) return
    setIsSaving(true)

    const payload = {
      user_id: userId,
      business_name: businessName,
      whatsapp_number: whatsappNumber,
      open_time: openTime,
      close_time: closeTime,
      primary_color: primaryColor,
      slug: slug || null,
      whatsapp_message: whatsappMessage,
      theme: theme
    }

    let error;

    if (hasExistingSettings && settingsId) {
      const { error: updateError } = await supabase
        .from("business_settings")
        .update(payload)
        .eq("id", settingsId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("business_settings")
        .insert([payload])
      error = insertError
      if (!error) setHasExistingSettings(true)
    }

    if (error) {
      if (error.code === '23505' && error.message.includes('slug')) {
        toast.error("Esse link (slug) já está em uso por outro negócio!")
      } else {
        toast.error("Erro ao salvar: " + error.message)
      }
    } else {
      toast.success("Configurações salvas com sucesso! 🚀")
    }

    setIsSaving(false)
  }

  const insertTag = (tag: string) => {
    setWhatsappMessage((prev) => prev + ` {${tag}}`)
    toast.success(`Variável {${tag}} adicionada!`)
  }

  const copyLink = () => {
    if (!slug) {
      toast.error("Salve as configurações primeiro para gerar seu link!")
      return
    }
    const url = `${window.location.origin}/agendar/${slug}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado! Agora é só mandar para os clientes.")
  }

  return {
    state: { isLoading, isSaving, businessName, whatsappNumber, openTime, closeTime, primaryColor, slug, whatsappMessage, theme },
    actions: { setBusinessName, setWhatsappNumber, setOpenTime, setCloseTime, setPrimaryColor, setSlug, setWhatsappMessage, setTheme, handleSaveSettings, insertTag, copyLink }
  }
}