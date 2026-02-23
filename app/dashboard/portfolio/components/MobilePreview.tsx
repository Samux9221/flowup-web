"use client"

import { Photo } from "../hooks/usePortfolio"
import { Product } from "../hooks/useProducts"

type Props = {
  photos: Photo[]
  products: Product[]
  title: string
}

export function MobilePreview({ photos, products, title }: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="mx-auto h-[700px] w-[340px] rounded-[3rem] border-8 border-zinc-900 overflow-hidden bg-white shadow-2xl">
        <div className="h-40 bg-zinc-900 text-white p-6">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm opacity-80">
            Confira nosso catálogo
          </p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-full">
          <div>
            <h4 className="text-xs font-bold uppercase mb-3">
              Portfólio
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(0, 4).map(photo => (
                <img
                  key={photo.id}
                  src={photo.url}
                  className="rounded-xl object-cover aspect-square"
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase mb-3">
              Produtos
            </h4>
            <div className="space-y-3">
              {products.slice(0, 3).map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-3"
                >
                  <img
                    src={product.image_url}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}