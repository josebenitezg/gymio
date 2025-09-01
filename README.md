## Gymio

Minimal app para plan de entrenamiento con Next.js App Router + Clerk.

### Stack
- Next.js (App Router, RSC) + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk para auth (sessions, user buttons)

### Rutas
- `/` Landing minimal con CTA:
  - Si no hay sesión: botones “Iniciar sesión” y “Crear cuenta” (modales Clerk)
  - Si hay sesión: botón “Ir a tu perfil”
- `/profile` Perfil protegido que muestra tu plan semanal por defecto desde CSV

---

## Configuración

### Requisitos
- Node 18+ y pnpm

### Instalación
```bash
pnpm install
```

### Variables de entorno
Crear `.env.local` en la raíz con claves desde Clerk Dashboard (placeholders):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```
No comitear `.env.local`.

### CSV por defecto
El plan semanal se carga de `rutina_planificada.csv` en la raíz usando `loadWeekFromCsv()`.

---

## Desarrollo
```bash
pnpm dev
```
Abrir `http://localhost:3000`.

Flujo:
1. En la landing, iniciar sesión o crear cuenta (Clerk).
2. Ir a `/profile` (o usar el botón “Ir a tu perfil”).
3. Ver la rutina diaria/semanal con interacción cliente (`DailyView`).

---

## Detalles de implementación
- `middleware.ts`: usa `clerkMiddleware()` para proteger rutas según matcher recomendado.
- `app/layout.tsx`: envuelve con `<ClerkProvider>` y agrega header con `<SignedIn>/<SignedOut>` y `<UserButton>`.
- `app/profile/page.tsx`: Server Component que verifica sesión con `auth()` y carga el plan desde CSV.
- `components/workout/daily-view.tsx`: Client Component interactivo para navegar días, marcar sets y usar temporizador.

---

## Personalización
- Reemplazar `rutina_planificada.csv` para cambiar el plan por defecto.
- Próximo paso: persistir planes por usuario (por `userId`) y priorizarlos sobre el CSV.

---

## Deploy
- Vercel recomendado. Configurar las mismas variables de entorno en el proyecto remoto.
