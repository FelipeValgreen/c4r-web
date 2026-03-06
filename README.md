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
```

- `NEXT_PUBLIC_SITE_URL`: base URL para canonical, OpenGraph, sitemap y robots.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: habilita Google Analytics 4 y activa el envío de eventos de CTA.

## Scripts

- `npm run dev`: entorno de desarrollo
- `npm run build`: build de producción
- `npm run start`: correr build de producción
- `npm run lint`: lint con reglas de Next.js

## Estructura principal

- `app/`: rutas App Router
- `components/`: componentes compartidos (header, footer, placeholders)
- `public/`: assets estáticos
