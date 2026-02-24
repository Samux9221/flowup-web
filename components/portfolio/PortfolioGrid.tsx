"use client"

import { Trash2 } from "lucide-react"
import { Photo } from "../hooks/usePortfolio"

type Props = {
  photos: Photo[]
  loading: boolean
  onDelete: (id: string) => void
}

export function PortfolioGrid({ photos, loading, onDelete }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-3xl bg-zinc-200 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!photos.length) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold">
          Sua galeria está vazia
        </p>
        <p className="text-sm text-zinc-500">
          Comece adicionando fotos.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map(photo => (
        <div
          key={photo.id}
          className="group relative aspect-square rounded-3xl overflow-hidden"
        >
          <img
            src={photo.url}
            className="h-full w-full object-cover"
          />

          <button
            onClick={() => onDelete(photo.id)}
            className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}