"use client"

import { useState } from "react"
import { Product } from "../hooks/useProducts"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Product, "id">) => Promise<void>
  editingProduct?: Product | null
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct
}: Props) {
  const [name, setName] = useState(editingProduct?.name || "")
  const [price, setPrice] = useState(editingProduct?.price || 0)
  const [stock, setStock] = useState(editingProduct?.stock || 0)
  const [imageUrl, setImageUrl] = useState(editingProduct?.image_url || "")

  if (!isOpen) return null

  async function handleSubmit() {
    await onSave({
      name,
      price,
      stock,
      image_url: imageUrl
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-4">
        <h3 className="text-xl font-bold">
          {editingProduct ? "Editar Produto" : "Novo Produto"}
        </h3>

        <input
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={e => setPrice(Number(e.target.value))}
          className="w-full border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Estoque"
          value={stock}
          onChange={e => setStock(Number(e.target.value))}
          className="w-full border rounded-xl p-3"
        />

        <input
          placeholder="URL da imagem"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className="w-full border rounded-xl p-3"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-zinc-900 text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}