"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const getLocalToday = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().split("T")[0]
}

export function useCashClosing() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1) 
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([])
  const [totals, setTotals] = useState({ dinheiro: 0, pix: 0, cartao: 0, taxasEstimadas: 0, totalLiquido: 0 })
  const [closureData, setClosureData] = useState<any>(null)

  const [expenses, setExpenses] = useState<{ id: string, description: string, amount: number }[]>([])
  const [saldoInicial, setSaldoInicial] = useState("")
  const [countedCash, setCountedCash] = useState("")

  const fetchTodayData = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = getLocalToday()

    const { data: existingClosure } = await supabase.from("daily_closures").select("*").eq("user_id", user.id).eq("date", today).maybeSingle()
    if (existingClosure) {
      setClosureData(existingClosure)
      setStep(4) 
      setIsLoading(false)
      return
    }

    const { data: allAppointments } = await supabase.from("appointments").select("*").eq("user_id", user.id).eq("date", today).neq("status", "Cancelado")

    if (allAppointments) {
      // Tipagem explícita adicionada aqui (a: any)
      const pendentes = allAppointments.filter((a: any) => a.status === "Confirmado" || a.status === "Em Andamento")
      setPendingAppointments(pendentes)

      const finalizados = allAppointments.filter((a: any) => a.status === "Finalizado" && a.payment_status === "PAGO")
      let dinheiro = 0, pix = 0, cartao = 0
      
      // Tipagem explícita adicionada aqui (appt: any)
      finalizados.forEach((appt: any) => {
        const valor = Number(appt.total_price) || 0
        if (appt.payment_method === 'DINHEIRO') dinheiro += valor
        if (appt.payment_method === 'PIX') pix += valor
        if (appt.payment_method === 'CARTAO') cartao += valor
      })

      const taxasEstimadas = cartao * 0.05
      setTotals({ dinheiro, pix, cartao, taxasEstimadas, totalLiquido: dinheiro + pix + (cartao - taxasEstimadas) })
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    if (isOpen) fetchTodayData()
  }, [isOpen, fetchTodayData])

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))
  const closeWizard = () => { setIsOpen(false); setTimeout(() => setStep(1), 300) }

  const addExpense = (description: string, amount: number) => {
    if (!description || !amount) return
    setExpenses(prev => [...prev, { id: Math.random().toString(), description, amount }])
  }
  
  // Tipagem explícita adicionada aqui (e: any)
  const removeExpense = (id: string) => setExpenses(prev => prev.filter((e: any) => e.id !== id))
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)

  const handleMarkAsNoShow = async (id: number) => {
    await supabase.from("appointments").update({ status: 'Cancelado' }).eq("id", id)
    toast.success("Marcado como 'Faltou'.")
    fetchTodayData() 
  }

  const handleFinishClosing = async () => {
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = getLocalToday()
    const valInicial = parseFloat(saldoInicial || '0')
    const valContado = parseFloat(countedCash || '0')

    const expectedDinheiro = (valInicial + totals.dinheiro) - totalExpenses
    const diferencaGaveta = valContado - expectedDinheiro

    const payload = {
      user_id: user.id,
      date: today,
      expected_dinheiro: expectedDinheiro,
      expected_pix: totals.pix,
      expected_cartao: totals.cartao - totals.taxasEstimadas,
      expected_total: totals.totalLiquido - totalExpenses, 
      actual_dinheiro: valContado,
      actual_pix: totals.pix, 
      actual_cartao: totals.cartao - totals.taxasEstimadas,
      difference: diferencaGaveta,
    }

    for (const exp of expenses) {
      await supabase.from("transactions").insert([{
        user_id: user.id, type: 'EXPENSE', amount: exp.amount, description: exp.description, payment_method: 'DINHEIRO', status: 'PAGO', date: today
      }])
    }

    const { data, error } = await supabase.from("daily_closures").insert([payload]).select().single()

    if (error) toast.error("Erro ao registrar fechamento.")
    else {
      toast.success("Caixa trancado com sucesso! 🔒")
      setClosureData(data)
      setStep(4)
    }
    setIsSaving(false)
  }

  return {
    state: { isOpen, step, totals, pendingAppointments, expenses, totalExpenses, saldoInicial, countedCash, isLoading, isSaving, closureData },
    actions: { setIsOpen, nextStep, prevStep, closeWizard, handleFinishClosing, addExpense, removeExpense, setSaldoInicial, setCountedCash, handleMarkAsNoShow }
  }
}