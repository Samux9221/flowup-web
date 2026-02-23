"use client"

import { Smartphone } from "lucide-react"

type Props = {
  activeTab: "portfolio" | "catalogo"
  setActiveTab: (v: "portfolio" | "catalogo") => void
  showPreview: boolean
  setShowPreview: (v: boolean) => void
  title: string
}

export function PortfolioHeader({
  activeTab,
  setActiveTab,
  showPreview,
  setShowPreview,
  title
}: Props) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-tight">
          Vitrine Digital
        </h1>
        <p className="text-zinc-500 mt-1">
          Gerencie seu portfólio e estoque.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex p-1 bg-zinc-100 rounded-2xl">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              activeTab === "portfolio" && "bg-white shadow"
            }`}
          >
            Portfólio
          </button>

          <button
            onClick={() => setActiveTab("catalogo")}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              activeTab === "catalogo" && "bg-white shadow"
            }`}
          >
            Produtos
          </button>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-2.5 rounded-xl border"
        >
          <Smartphone
            className={`h-5 w-5 ${
              showPreview ? "text-zinc-900" : "text-zinc-400"
            }`}
          />
        </button>
      </div>
    </header>
  )
}