// app/api/whatsapp/instance/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// URL e Chave Global da sua futura Evolution API (Colocaremos no .env)
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://api.seuservidor.com"
const EVOLUTION_GLOBAL_API_KEY = process.env.EVOLUTION_GLOBAL_API_KEY || "sua_chave_secreta"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    // 1. Verifica quem está logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // O nome da sessão será único para cada barbearia (ex: flowup_uuid)
    const sessionName = `flowup_${user.id.replace(/-/g, '')}`

    /* ===================================================================
      AQUI ENTRA A COMUNICAÇÃO REAL COM A EVOLUTION API (Quando em Produção)
      ===================================================================
      
      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_GLOBAL_API_KEY
        },
        body: JSON.stringify({
          instanceName: sessionName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });
      const evolutionData = await response.json();
      const base64QR = evolutionData.qrcode.base64;
      
      ===================================================================
    */

    // MOCK TEMPORÁRIO PARA DESENVOLVIMENTO (Até subirmos o servidor Evolution):
    // Vamos simular a devolução de um QR Code em Base64 válido e registrar no banco
    const mockQrCodeBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" // Pixel transparente como placeholder

    // 2. Salva/Atualiza o status no Supabase indicando que a instância foi criada
    const { error: dbError } = await supabase
      .from('whatsapp_sessions')
      .upsert({ 
        user_id: user.id, 
        session_name: sessionName, 
        status: 'QRCODE_READY',
        qr_code: mockQrCodeBase64
      }, { onConflict: 'user_id' })

    if (dbError) throw dbError

    // Devolve o QR Code para o Front-end mostrar na tela
    return NextResponse.json({ success: true, sessionName, qrCode: mockQrCodeBase64 })

  } catch (error: any) {
    console.error("Erro ao criar instância de WhatsApp:", error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}