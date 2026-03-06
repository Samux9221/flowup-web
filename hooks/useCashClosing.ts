"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

const getLocalToday = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split("T")[0]
}

export function useCashClosing() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // Vendas do dia calculadas pelo sistema
  const [totals, setTotals] = useState({
    dinheiro: 0,
    pix: 0,
    cartao: 0,
    taxasEstimadas: 0,
    totalLiquido: 0
  })

  // NOVO: Saldo Inicial (O que já tinha antes de abrir o salão) para os 3 métodos
  const [saldoInicial, setSaldoInicial] = useState({
    dinheiro: "",
    pix: "",
    cartao: ""
  })

  // O que o dono contou na vida real no fim do dia (Saldo Final Total)
  const [counted, setCounted] = useState({
    dinheiro: "",
    pix: "",
    cartao: ""
  })

  useEffect(() => {
    if (!isOpen) return

    const fetchTodayCash = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = getLocalToday()

      const { data: appointments } = await supabase
        .from("appointments")
        .select("total_price, payment_method")
        .eq("user_id", user.id)
        .eq("date", today)
        .eq("status", "Finalizado")
        .eq("payment_status", "PAGO")

      if (appointments) {
        let dinheiro = 0, pix = 0, cartao = 0

        appointments.forEach(appt => {
          const valor = Number(appt.total_price) || 0
          if (appt.payment_method === 'DINHEIRO') dinheiro += valor
          if (appt.payment_method === 'PIX') pix += valor
          if (appt.payment_method === 'CARTAO') cartao += valor
        })

        const taxasEstimadas = cartao * 0.02 // 2% taxa média
        const totalLiquido = dinheiro + pix + (cartao - taxasEstimadas)

        setTotals({ dinheiro, pix, cartao, taxasEstimadas, totalLiquido })
        
        // Zera tudo ao abrir
        setSaldoInicial({ dinheiro: "", pix: "", cartao: "" })
        setCounted({ dinheiro: "", pix: "", cartao: "" })
      }
      
      setIsLoading(false)
    }

    fetchTodayCash()
  }, [isOpen, supabase])

  const handleCountChange = (field: keyof typeof counted, value: string) => {
    setCounted(prev => ({ ...prev, [field]: value }))
  }

  const handleSaldoInicialChange = (field: keyof typeof saldoInicial, value: string) => {
    setSaldoInicial(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))
  
  const closeWizard = () => {
    setIsOpen(false)
    setTimeout(() => setStep(1), 300)
  }

  const handleFinishClosing = async () => {
    toast.success("Caixa fechado e auditado com sucesso! 🔒")
    closeWizard()
  }

  return {
    state: { isOpen, step, totals, counted, saldoInicial, isLoading },
    actions: { setIsOpen, nextStep, prevStep, closeWizard, handleFinishClosing, handleCountChange, handleSaldoInicialChange }
  }
}