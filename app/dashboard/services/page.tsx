"use client"

import { useServices } from "@/hooks/useServices"
import ServicesHeader from "@/components/services/ServicesHeader"
import ServicesList from "@/components/services/ServicesList"
import ServiceFormSheet from "@/components/services/ServiceFormSheet"

export default function ServicosPage() {
  const { state, actions } = useServices()

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Cabeçalho */}
      <ServicesHeader state={state} actions={actions} />

      {/* 2. Lista / Grade de Serviços */}
      <ServicesList state={state} actions={actions} />

      {/* 3. Gaveta (Sheet) para Novo/Editar */}
      <ServiceFormSheet state={state} actions={actions} />

    </div>
  )
}