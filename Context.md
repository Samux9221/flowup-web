# 🛠️ Contexto do Projeto: FlowUp

## 1. Visão Geral e Objetivo
O **FlowUp** é um SaaS (Software as a Service) de gestão focado em profissionais de serviços (inicialmente barbeiros). O objetivo é substituir a agenda de papel e o WhatsApp por um sistema automatizado com design de alto padrão (Premium/SaaS Moderno). Oferece um painel de controle (Dashboard) para o dono do negócio e, futuramente, um link de agendamento self-service para o cliente final.

## 2. Stack Tecnológica (Tech Stack)
- **Framework:** Next.js 15 (App Router) + React 19
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Foco em paleta Zinc, Glassmorphism, e animações fluidas)
- **Componentes UI:** Shadcn/UI (Sheet, Cards, Inputs, Buttons)
- **Ícones:** Lucide React
- **Backend as a Service (BaaS):** Supabase (PostgreSQL + Auth)
- **Gerenciamento de Sessão:** `@supabase/ssr` (Padrão oficial mais recente para Next.js App Router)

## 3. Estrutura do Banco de Dados (Supabase)
O banco usa PostgreSQL. (Nota: RLS será configurado rigorosamente para produção).

**Tabela: `establishments`** (A Barbearia/Negócio)
- `id` (uuid, PK)
- `owner_id` (uuid, FK referenciando `auth.users`)
- `name` (text)
- `created_at` (timestamp)

**Tabela: `services`** (O Cardápio de Serviços)
- `id` (uuid, PK)
- `establishment_id` (uuid, FK referenciando `establishments.id`)
- `title` (text)
- `price` (numeric)
- `duration_minutes` (integer)
- `created_at` (timestamp)

**Tabela: `appointments`** (Agenda de Horários - Recém-criada)
- `id` (bigint, PK)
- `client_name` (text)
- `service` (text)
- `time` (text)
- `status` (text, default 'Confirmado')
- `created_at` (timestamp)

## 4. Estrutura de Rotas e Pastas (Next.js App Router)
- `/login`: Tela de entrada Premium. **Estratégia atual:** Email + Senha (confirmação de email desativada no Supabase para facilitar o ambiente de desenvolvimento).
- `/dashboard`: Área restrita do usuário logado.
  - `layout.tsx`: Sidebar Premium com efeito Backdrop Blur (Glassmorphism), ícones dinâmicos e destaque da rota ativa.
  - `page.tsx`: Visão geral com métricas.
  - `/services/page.tsx`: Tela de CRUD de serviços.
  - `/agenda/page.tsx`: Linha do tempo interativa da agenda. Utiliza o componente `<Sheet>` do Shadcn para abrir um formulário lateral deslizante (Slide-over) de "Novo Agendamento" sem perder o contexto da página.

## 5. Estado Atual do Projeto e Onde Paramos
- **Autenticação Refatorada:** Abandonamos o Magic Link temporariamente devido a limites de envio de e-mail do Supabase na camada gratuita. Migramos para Email e Senha usando o pacote moderno `@supabase/ssr` (`createBrowserClient`).
- **Design System Aplicado:** O projeto assumiu uma identidade visual de SaaS de alto nível (estilo Stripe/Vercel/Apple), com muito *white space*, bordas sutis, paleta `zinc` e feedback visual em botões (`active:scale`).
- **Feature Atual:** A interface visual da `/dashboard/agenda` está 100% pronta e premium. A tabela `appointments` foi criada no banco de dados (com RLS temporariamente desativado para testes).

## 6. Próximos Passos
1. Conectar o formulário do `<Sheet>` (Novo Agendamento) na `/dashboard/agenda` para realizar o `INSERT` real na tabela `appointments` do Supabase.
2. Fazer a linha do tempo (Timeline) da Agenda buscar (`SELECT`) os dados reais do Supabase em vez de usar os dados falsos (mock).