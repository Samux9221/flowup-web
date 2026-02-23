import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Se vier um "next" na URL, usamos ele, senão mandamos para o dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // AQUI MUDOU: Agora precisamos do 'await'
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // AQUI MUDOU: Usamos getAll e setAll agora
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ocorreu um erro ao tentar definir cookies. 
              // Isso pode acontecer se estivermos num Server Component, 
              // mas numa Rota de API (route.ts) geralmente funciona bem.
            }
          },
        },
      }
    )

    // Troca o código pela sessão do usuário
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Se deu certo, redireciona para o painel
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se der erro, volta pro login com aviso
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}