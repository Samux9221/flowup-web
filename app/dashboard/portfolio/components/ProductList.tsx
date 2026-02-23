"use client"

import { Product } from "../hooks/useProducts"
import { Edit3, Trash2 } from "lucide-react"

type Props = {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function ProductList({ products, onEdit, onDelete }: Props) {
  if (!products.length) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold">
          Nenhum produto cadastrado
        </p>
        <p className="text-sm text-zinc-500">
          Comece adicionando itens ao seu catálogo.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map(product => (
        <div
          key={product.id}
          className="flex items-center gap-4 p-4 rounded-2xl border bg-white"
        >
          <img
            src={product.image_url || "https://via.placeholder.com/150"}
            className="h-16 w-16 rounded-xl object-cover"
          />

          <div className="flex-1">
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-zinc-500">
              R$ {product.price.toFixed(2)}
            </p>

            {product.stock < 3 && (
              <span className="text-xs text-rose-500 font-semibold">
                Estoque baixo
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => onEdit(product)}>
              <Edit3 className="h-4 w-4 text-zinc-500" />
            </button>
            <button onClick={() => onDelete(product.id)}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}