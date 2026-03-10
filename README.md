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
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
DEALERS_STORE_SUPABASE_TABLE=dealer_store_state
DEALERS_STORE_SUPABASE_ROW_ID=primary
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
C4R_PUBLICATION_FEE_CLP=19990
C4R_SELLER_SUBSCRIPTION_DAYS=30
C4R_SELLER_SUBSCRIPTION_PLAN_CODE=publicador_mensual
```

- `NEXT_PUBLIC_SITE_URL`: base URL para canonical, OpenGraph, sitemap y robots.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: habilita Google Analytics 4 y activa el envío de eventos de CTA.
- `DEALERS_STORE_PROVIDER`: `auto` (default), `supabase`, `blob` o `file`.
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`: habilitan persistencia del portal dealers en Supabase.
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`: autenticación para `/publicar-auto` (correo + Google).
- `DEALERS_STORE_SUPABASE_TABLE`: tabla JSON para estado dealer (default `dealer_store_state`).
- `DEALERS_STORE_SUPABASE_ROW_ID`: clave primaria lógica del estado (default `primary`).
- `MERCADOPAGO_ACCESS_TOKEN`: token privado para crear checkouts y validar pagos de publicación.
- `C4R_PUBLICATION_FEE_CLP`: precio en CLP para publicar cuando no hay suscripción activa.
- `C4R_SELLER_SUBSCRIPTION_DAYS`: vigencia de la suscripción después de pago aprobado.
- `C4R_SELLER_SUBSCRIPTION_PLAN_CODE`: código de plan que se guarda en la tabla de suscripciones.

### Supabase (tabla mínima)

Si usas `DEALERS_STORE_PROVIDER=supabase`, crea esta tabla:

```sql
create table if not exists public.dealer_store_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
```

Para habilitar flujo operativo de publicación (`/publicar-auto`) ejecuta además:

```sql
-- copiar/pegar contenido de data/seller-publish-schema.sql
```

Además en Supabase Auth:

- habilita proveedor Google en `Authentication > Providers`.
- agrega URL de callback autorizada:
  - `https://TU_DOMINIO/publicar-auto`
  - `http://localhost:3000/publicar-auto`

## Scripts

- `npm run dev`: entorno de desarrollo
- `npm run build`: build de producción
- `npm run start`: correr build de producción
- `npm run lint`: lint con reglas de Next.js

## Estructura principal

- `app/`: rutas App Router
- `components/`: componentes compartidos (header, footer, placeholders)
- `public/`: assets estáticos
