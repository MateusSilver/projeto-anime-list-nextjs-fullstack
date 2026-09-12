# 🎬 My Anime List Pro

Um dashboard pessoal para gerenciamento de catálogo de animes, projetado para escalabilidade, responsividade e **velocidade extrema**. O sistema permite rastrear episódios assistidos, avaliar obras, favoritar títulos e visualizar métricas da comunidade.

## 🏗️ Arquitetura e Evolução do Sistema

Este projeto nasceu como uma aplicação robusta baseada em **Next.js (Frontend)** e **Spring Boot / Java (Backend)**. No entanto, para resolver gargalos físicos de rede (latência geográfica) e eliminar os pesados _cold starts_ da JVM em ambientes gratuitos, a arquitetura foi refatorada para um modelo **Fullstack Serverless**.

Ao unificar o frontend e o backend no **Next.js 15 (App Router)** utilizando **Server Actions**, eliminamos viagens desnecessárias de rede. A comunicação com o banco de dados passou a ser feita diretamente por rotas Serverless e Edge, reduzindo o tempo de resposta de 500ms para menos de 50ms.

### ⚡ Destaques de Performance

- **Zero Cold Starts:** Substituição da API Java pesada por Server Actions do Next.js.
- **Atualizações Otimistas (Optimistic UI):** Implementação do **TanStack React Query** para atualizações instantâneas na interface (como incrementar episódios ou favoritar), sem aguardar a resposta do servidor.
- **Otimização de Banco de Dados:** Uso de índices `pg_trgm` (Trigram) no PostgreSQL para consultas textuais (`LIKE`) ultra-rápidas em milhares de registros sem _Full Table Scans_.
- **Code Splitting & Lazy Loading:** Modais pesados e formulários são carregados dinamicamente via `next/dynamic` apenas no momento da interação do usuário.

## 🛠️ Tecnologias Utilizadas

**Frontend & Backend (Unificado)**

- Next.js 15 (App Router, Server Actions, Server Components)
- React 19
- TypeScript
- TanStack React Query (Cache e Gerenciamento de Estado)
- Bootstrap / Tailwind CSS (Estilização responsiva)

**Banco de Dados & ORM**

- PostgreSQL (Hospedado no Neon Serverless)
- Drizzle ORM (Consultas SQL tipadas e ultra-leves)

## 🚀 Como Rodar Localmente

### 1. Clonar o Repositório

```bash
git clone https://github.com/MateusSilver/anime-list-nextjs-fullstack.git
cd anime-list-fullstack

```

### 2. Instalar Dependências

```bash
npm install

```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione a URL de conexão do seu banco de dados PostgreSQL (Neon):

```env
DATABASE_URL="postgresql://usuario:senha@seu-host-neon.tech/nome_do_banco?sslmode=require"
NEXT_PUBLIC_API_URL="http://localhost:3000"

```

### 4. Executar o Servidor de Desenvolvimento

```bash
npm run dev

```

Acesse `http://localhost:3000` no seu navegador.

## 🗺️ Roadmap e Futuras Implementações

- Integração direta com o banco de dados via Drizzle ORM (Substituindo endpoints HTTP legados).
- Rate Limiting na camada de borda para proteção contra abusos.
- Dashboard de estatísticas visuais com **Chart.js** no perfil do usuário (Gêneros favoritos, progressão de horas assistidas).
- Integração com a API pública do **Jikan (MyAnimeList)** para preenchimento automático de metadados, capas em alta resolução e informações de estúdio.
