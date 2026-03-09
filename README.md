# DescubrePR

Aplicacion web de descubrimiento local para Puerto Rico construida con Next.js 16, Supabase y Tailwind CSS 4.

## Stack actual

- Next.js 16 con App Router
- React 19
- Supabase Auth, Postgres y Storage
- Tailwind CSS 4
- Leaflet para mapa
- `next-pwa` para registro de service worker en produccion

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Proyecto Supabase configurado

## Variables de entorno

Crea `app_build/.env.local` con estas variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:soporte@descubrepr.com
NEXT_PUBLIC_ENABLE_PWA_DEV=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Notas:

- `NEXT_PUBLIC_SITE_URL` se usa para `metadataBase`, `robots` y `sitemap`.
- `SUPABASE_SERVICE_ROLE_KEY` se usa para persistir webhooks de Stripe desde servidor.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` activan Turnstile en login, registro y formularios publicos.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT` activan Web Push para la PWA.
- `NEXT_PUBLIC_ENABLE_PWA_DEV=1` permite probar service worker y push en `development`.
- `STRIPE_SECRET_KEY` se usa para crear Checkout Sessions y Billing Portal Sessions.
- `STRIPE_WEBHOOK_SECRET` se usa para verificar la firma del webhook de Stripe.

## Dependencias externas reales

### Supabase

El proyecto depende de:

- Auth para sesiones
- Base de datos PostgreSQL
- Storage bucket publico `media`

El contrato versionado esta en `supabase/schema.sql`.

### Stripe

Estado actual:

- Checkout Sessions en servidor
- Billing Portal en servidor
- webhook para sincronizar suscripciones contra Supabase
- sincronizacion adicional del plan al regresar desde Checkout usando `session_id`
- tabla `subscriptions` como fuente de verdad del plan activo

### PWA

La configuracion esta en `next.config.ts`.

- `next-pwa` se activa en produccion
- en `development` queda desactivado salvo que `NEXT_PUBLIC_ENABLE_PWA_DEV=1`
- el build de produccion usa `next build --webpack` para que `next-pwa` pueda generar el service worker
- existe fallback offline de documento en `src/app/_offline/page.tsx`
- existe custom worker en `worker/index.ts` para manejar eventos `push` y `notificationclick`
- el usuario puede activar o desactivar push desde `src/components/ui/PushNotificationCard.tsx`
- las suscripciones quedan en `push_subscriptions` y las notificaciones push salen desde servidor usando VAPID

Para generar claves VAPID:

```bash
npx web-push generate-vapid-keys
```

### Seguridad

Estado actual:

- login, registro y formularios publicos pasan por rutas server
- rate limiting basico en auth y submits
- CAPTCHA real con Cloudflare Turnstile cuando se configuran las claves
- honeypot y control de tiempo minimo de llenado como capa anti-bot adicional
- audit log persistente para acciones admin principales
- `/admin` se bloquea desde `src/proxy.ts`
- `schema.sql` endurece rol de perfiles, alta de usuarios y estados sensibles

### Iconos

La interfaz usa Material Symbols via hoja de estilo remota de Google en `src/app/layout.tsx`.

- esto no bloquea `next build`
- si el navegador no puede cargar Google Fonts, los iconos de texto no se veran correctamente
- reemplazarlo por SVGs locales sigue pendiente

## Desarrollo

Instala dependencias:

```bash
npm install
```

Levanta el entorno local:

```bash
npm run dev
```

Si necesitas depurar PWA localmente:

```bash
npx web-push generate-vapid-keys
npm run dev:webpack
```

Y activa en `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_PWA_DEV=1
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:soporte@descubrepr.com
```

Abre `http://localhost:3000`.

## Build y validacion

Lint:

```bash
npm run lint
```

Tests:

```bash
npm run test:run
```

Build de produccion:

```bash
npm run build
```

Notas operativas:

- El build ya no depende de `next/font/google`; la tipografia principal usa un stack local del sistema.
- ESLint ignora artefactos generados en `tmp/descubrepr-next`.
- La base de tests usa Vitest con configuracion en `vitest.config.ts`.
- La PWA genera `public/sw.js` y `public/workbox-*.js` durante `npm run build`.
- La PWA genera tambien `public/worker-*.js` cuando existe worker custom.
- `npm run lint`, `npm run test:run` y `npm run build` pasan con la configuracion actual.

## CI

El repo incluye workflow propio en `.github/workflows/ci.yml`.

Ese workflow ejecuta:
- `npm ci`
- `npm run lint`
- `npm run test:run`
- `npm run build`

Para que el build y la CI sean reproducibles, el workflow inyecta valores placeholder para variables publicas y de VAPID que solo se necesitan para compilar.

## Middleware de Supabase

Next 16 depreca `middleware.ts` a favor de `proxy.ts`.

Estado actual:

- la entrada ya fue migrada a `src/proxy.ts`
- la logica de sesion sigue en `src/lib/supabase/middleware.ts`

## Arranque reproducible desde cero

1. Instalar dependencias con `npm install`.
2. Crear `app_build/.env.local`.
3. Aplicar `supabase/schema.sql` en un proyecto Supabase nuevo.
4. Confirmar que existe el bucket `media`.
5. Si quieres probar push, generar claves VAPID y completar las variables correspondientes.
6. Ejecutar `npm run dev`.

## Riesgos abiertos

- Los iconos siguen dependiendo de Google Fonts en runtime.
- Turnstile requiere configurar las claves reales para que el CAPTCHA quede activo en produccion.
- Web Push requiere desplegar `schema.sql` actualizado y configurar claves VAPID reales.
- Stripe requiere configurar en Dashboard el webhook apuntando a `/api/stripe/webhook`.
- Falta probar end-to-end el flujo de Stripe en entorno real con eventos de webhook.
