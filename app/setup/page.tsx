'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js' // Importação direta
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Configuração do Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('') // O link (ex: barbeariadoze)
  const [loading, setLoading] = useState(false)

  // Função que transforma "Barbearia do Zé" em "barbearia-do-ze" automaticamente
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    // Cria o slug automático (tira acentos, espaços e põe minúsculas)
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Você precisa estar logado!")
      router.push('/login')
      return
    }

    // 2. Insere na tabela 'establishments'
    const { error } = await supabase
      .from('establishments')
      .insert([
        {
          owner_id: user.id,
          name: name,
          slug: slug,
        }
      ])

    if (error) {
      // Se der erro (ex: slug já existe), avisa
      alert('Erro: ' + error.message)
      setLoading(false)
    } else {
      // Sucesso! Vai para o Painel (que vamos criar depois)
      alert('Negócio criado com sucesso! 🚀')
      router.push('/dashboard') 
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Bem-vindo ao FlowUp!</CardTitle>
          <CardDescription>Vamos configurar seu espaço. Isso leva 30 segundos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            
            <div className="space-y-2">
              <Label>Nome do Negócio</Label>
              <Input 
                placeholder="Ex: Barbearia do Zé" 
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Seu Link Personalizado</Label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm">flowup.com.br/</span>
                <Input 
                  placeholder="barbearia-do-ze" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  required
                  className="font-mono bg-zinc-100"
                />
              </div>
              <p className="text-xs text-zinc-500">
                É este link que você vai enviar para seus clientes agendarem.
              </p>
            </div>

            <Button type="submit" className="w-full bg-black" disabled={loading}>
              {loading ? 'Criando...' : 'Finalizar Cadastro'}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}