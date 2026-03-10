# C4R Web

Base web marketing de C4R (Next.js + App Router + Tailwind CSS v4).

## Requisitos

- Node.js 20+
- npm 10+

## Desarrollo local

```bash
npm install
npm run dev
```

App local: `http://localhost:3000`

## Variables de entorno

Crear `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
DEALERS_STORE_PROVIDER=auto
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
DEALERS_STORE_SUPABASE_TABLE=dealer_store_state
DEALERS_STORE_SUPABASE_ROW_ID=primary
```

- `NEXT_PUBLIC_SITE_URL`: base URL para canonical, OpenGraph, sitemap y robots.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: habilita Google Analytics 4 y activa el envío de eventos de CTA.
- `DEALERS_STORE_PROVIDER`: `auto` (default), `supabase`, `blob` o `file`.
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`: habilitan persistencia del portal dealers en Supabase.
- `DEALERS_STORE_SUPABASE_TABLE`: tabla JSON para estado dealer (default `dealer_store_state`).
- `DEALERS_STORE_SUPABASE_ROW_ID`: clave primaria lógica del estado (default `primary`).

### Supabase (tabla mínima)

Si usas `DEALERS_STORE_PROVIDER=supabase`, crea esta tabla:

```sql
create table if not exists public.dealer_store_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
```

## Scripts

- `npm run dev`: entorno de desarrollo
- `npm run build`: build de producción
- `npm run start`: correr build de producción
- `npm run lint`: lint con reglas de Next.js

## Estructura principal

- `app/`: rutas App Router
- `components/`: componentes compartidos (header, footer, placeholders)
- `public/`: assets estáticos
