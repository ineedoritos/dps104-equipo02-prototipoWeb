# ADR-WEB-001 · Stack web: Next.js (App Router) + Tailwind CSS + shadcn/ui + Recharts

- **Estado:** Aprobado
- **Fecha:** 2026-11-25

## Contexto
Se necesita un portal web administrativo enfocado en estadísticas, reportería y exportación client-side para el proyecto **Registro de actividades**, independiente del cliente móvil Expo (`app-movil`) pero en el mismo repositorio bajo `app-web/`.

## Decisión
1. **Next.js (App Router + TypeScript estricto):** estructura moderna de rutas por carpetas (`(auth)` y `(portal)`), soporte nativo para layout persistente (sidebar/topbar) y fácil despliegue estático o en Vercel.
2. **Tailwind CSS + `shadcn/ui`:** componentes accesibles, componibles y sin vendor lock-in (`Table`, `Card`, `Sheet`, `Tabs`, `Select`, `Skeleton`, `Badge`), ideales para paneles administrativos y tablas de reportería.
3. **Gráficas con `recharts` (`shadcn/ui Charts`):** integración directa con los tokens de tema de shadcn/ui, tooltips interactivos y soporte responsivo para barras apiladas y series de tiempo.
4. **Sin tests automatizados:** al igual que en `app-movil` (`ADR-005`), la calidad se verifica mediante `typecheck`, `lint`, `build` y prueba manual E2E en navegador (`app-web/docs/e2e-manual-guide.md`).

## Consecuencias
- **Positivas:** alta velocidad de desarrollo agéntico con patrones estándar y UI consistente.
- **Restricciones:** evitar lógica pesada de backend en Route Handlers; Next.js actúa exclusivamente como frontend/UI consumiendo Supabase.
