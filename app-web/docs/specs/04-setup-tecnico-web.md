# Spec Web 04 · Setup técnico de `app-web`

Especificación técnica para inicializar el proyecto Next.js en `app-web/` cuando se implemente `WEB-SETUP-01` y `WEB-UI-01`.
**Nota:** esta carpeta inicia solo con documentación y configuración agéntica; el código fuente se crea en la issue `[WEB-SETUP-01]`.

---

<a id="stack"></a>

## 1. Stack oficial de `app-web`
- **Framework:** Next.js (App Router, TypeScript estricto) — `ADR-WEB-001`.
- **Estilos y componentes:** Tailwind CSS + `shadcn/ui` (con `lucide-react` para iconos).
- **Gráficas:** `recharts` (integrado vía `shadcn/ui Charts`).
- **Cliente Supabase:** `@supabase/supabase-js` + `@supabase/ssr` (solo `anon key`) — `ADR-WEB-002`.
- **Exportación Client-Side:** `jspdf` + `jspdf-autotable` (PDF) y `xlsx-js-style` (fork compatible con bundlers modernos de `xlsx-style` para Excel con estilos) — `ADR-WEB-003`.
- **Zona horaria:** helper `src/lib/fecha.ts` fijado a `America/El_Salvador` (UTC-6).

---

<a id="web-setup-01"></a>

## 2. `WEB-SETUP-01` · Base Next.js + Tailwind + shadcn/ui
### Criterios de aceptación
- `WEBSETUP01-CA01`: Proyecto Next.js (App Router + TypeScript) inicializado en `app-web/` sin afectar `app-movil/` ni `prototipo-web/`.
- `WEBSETUP01-CA02`: Tailwind CSS y `shadcn/ui` configurados con componentes base (`Button`, `Card`, `Table`, `Badge`, `Select`, `Input`, `Skeleton`, `Dialog`/`Sheet`, `Tabs`, `Tooltip`).
- `WEBSETUP01-CA03`: Layout administrativo responsive (sidebar colapsable + barra superior con selector de grupo/modo personal y menú de usuario) funcionando en desktop y móvil.
- `WEBSETUP01-CA04`: Archivo `.env.example` documentando únicamente `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sin secretos).
- `WEBSETUP01-CA05`: Helper `src/lib/fecha.ts` para formateo y rangos en `America/El_Salvador`, y scripts `npm run typecheck`, `npm run lint` y `npm run build` pasando sin errores (sin tests automatizados).

---

<a id="web-ui-01"></a>

## 3. `WEB-UI-01` · UI Mock de vistas principales
### Criterios de aceptación
- `WEBUI01-CA01`: Maquetación navegable con datos mock tipados (espejo de los tipos de `../app-movil/docs/database.md`) para `/login`, `/dashboard`, `/reportes`, `/jornadas` y `/mi-reporte`.
- `WEBUI01-CA02`: Incluye gráficos interactivos con `recharts` (`shadcn/ui Charts`) y selector de período funcional sobre los datos mock.
- `WEBUI01-CA03`: Cada vista soporta visualmente los estados obligatorios de `RNF04` (`cargando`, `vacío`, `error con reintento`) verificables mediante un switch o parámetros de prueba en desarrollo (sin exponer texto técnico ni la palabra *"mock"* en el copy final de usuario).

---

<a id="estructura"></a>

## 4. Estructura objetivo cuando se implemente código
```text
app-web/
├── AGENTS.md
├── docs/
├── .env.example
├── package.json
└── src/
    ├── app/
    │   ├── (auth)/login/page.tsx
    │   └── (portal)/
    │       ├── layout.tsx
    │       ├── dashboard/page.tsx
    │       ├── reportes/page.tsx
    │       ├── jornadas/page.tsx
    │       ├── jornadas/[id]/page.tsx
    │       ├── mi-reporte/page.tsx
    │       └── auditoria/page.tsx
    ├── components/
    │   ├── ui/               # shadcn/ui
    │   ├── layout/           # Sidebar, Topbar, GroupRoleSwitcher
    │   ├── charts/           # Gráficas Recharts
    │   └── reportes/         # Tablas, drawers de motivos y botones export
    ├── lib/
    │   ├── supabase/         # client.ts, server.ts, middleware.ts
    │   ├── export/           # pdf.ts (jspdf), excel.ts (xlsx-js-style)
    │   ├── fecha.ts          # America/El_Salvador
    │   └── errores.ts        # Mapeo ERR_* -> español claro
    └── types/
        └── dominio.ts        # Tipos alineados a app-movil/docs/database.md
```
