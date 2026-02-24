"use client"

import { useRef, useState } from "react"
import { UploadCloud, Loader2 } from "lucide-react"

type Props = {
  onUpload: (file: File) => Promise<void>
}

export function PortfolioUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    await onUpload(file)
    setUploading(false)
  }

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Fotos</h2>

      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white font-semibold hover:opacity-90 transition"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        Adicionar
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}