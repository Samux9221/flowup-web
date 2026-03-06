"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

export function useCommissions() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isLoading, setIsLoading] = useState(true)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [selectedPro, setSelectedPro] = useState<any>(null)
  
  // Controle de Interface
  const [isStatementOpen, setIsStatementOpen] = useState(false)
  const [descontarTaxas, setDescontarTaxas] = useState(true) // O dono decide se desconta a taxa ou não

  // No mundo real, faríamos um fetch na tabela 'professionals' e cruzaríamos com 'appointments'
  // Como estamos criando a fundação, vamos montar a inteligência com dados estruturados:
  useEffect(() => {
    const fetchDadosEquipe = async () => {
      setIsLoading(true)
      
      // 🚀 Simulando os dados processados pelo banco para a interface
      setTimeout(() => {
        setProfessionals([
          {
            id: 1,
            name: "João (Barbeiro Senior)",
            comissionRate: 0.50, // 50% de comissão
            vales: 100, // Pegou R$ 100 adiantado na semana
            producao: {
              dinheiro: 400,
              pix: 300,
              cartao: 500 // O total que ELE produziu que passou na máquina
            }
          },
          {
            id: 2,
            name: "Marcos (Assistente/Barba)",
            comissionRate: 0.40, // 40% de comissão
            vales: 0,
            producao: {
              dinheiro: 150,
              pix: 200,
              cartao: 100
            }
          }
        ])
        setIsLoading(false)
      }, 800)
    }

    fetchDadosEquipe()
  }, [])

  const openStatement = (pro: any) => {
    setSelectedPro(pro)
    setIsStatementOpen(true)
  }

  const closeStatement = () => {
    setIsStatementOpen(false)
    setTimeout(() => setSelectedPro(null), 300)
  }

  const handleLiquidar = () => {
    toast.success(`Acerto de ${selectedPro?.name} liquidado com sucesso! Saldo zerado. 💰`)
    closeStatement()
  }

  // 🔹 O MOTOR MATEMÁTICO 🔹
  const calculateStatement = (pro: any) => {
    if (!pro) return null

    const producaoTotal = pro.producao.dinheiro + pro.producao.pix + pro.producao.cartao
    const comissaoBruta = producaoTotal * pro.comissionRate
    
    // Calcula a taxa apenas sobre a parte dele do cartão (ex: se passou 500 no cartão e ele ganha 50%, a base da taxa dele é 250)
    const baseCartaoProfissional = pro.producao.cartao * pro.comissionRate
    const taxaCartaoCalculada = baseCartaoProfissional * 0.02 // 2% de taxa na máquina
    
    // Se o botão "Descontar Taxas" estiver desligado, o desconto é zero
    const descontoTaxas = descontarTaxas ? taxaCartaoCalculada : 0
    
    const liquidoAPagar = comissaoBruta - descontoTaxas - pro.vales

    return {
      producaoTotal,
      comissaoBruta,
      descontoTaxas,
      vales: pro.vales,
      liquidoAPagar
    }
  }

  return {
    state: { isLoading, professionals, selectedPro, isStatementOpen, descontarTaxas, statementMath: calculateStatement(selectedPro) },
    actions: { openStatement, closeStatement, setDescontarTaxas, handleLiquidar }
  }
}