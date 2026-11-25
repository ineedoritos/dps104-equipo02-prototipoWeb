---
name: web-reporting-patterns
description: Patrones operativos para desarrollar vistas de reportería, gráficos shadcn/ui (Recharts), consultas Supabase RLS client-only y exportación client-side a PDF (jspdf) y Excel (xlsx-js-style / xlsx-style) en app-web.
---

# Web Reporting Patterns (`app-web`)

Usa esta skill al implementar cualquier issue `[WEB-*]` dentro de `app-web/`.

## 1. Arquitectura Client-Only con Supabase (cero backend propio)
- Usa exclusivamente `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Nunca instales ni referencies `service_role`, ni crees `/api/*` para lógica de negocio o exportación.
- Toda autorización vive en RLS y RPCs de `../app-movil/docs/database.md`:
  - Responsable de grupo: `obtener_reporte_grupo(p_grupo_id, p_desde, p_hasta)` + lecturas `SELECT` protegidas por `es_responsable`.
  - Participante / Mi reporte personal: lecturas `SELECT` propias protegidas por `participante_id = auth.uid()`.

## 2. Reglas de cálculo y zona horaria
- Toda fecha y filtro de período usa `America/El_Salvador` (UTC-6) mediante `src/lib/fecha.ts`.
- Fórmula exacta de tasa (`RF15`):
  ```ts
  const ausencias = ausentesSinMotivo + justificadas;
  const denominador = presentes + ausencias;
  const tasa = denominador === 0 ? null : (presentes / denominador) * 100;
  ```
- Cuando `tasa === null`, renderizar `—` (nunca `NaN` ni `0%`).
- Excluir siempre `jornada.cancelada === true` de totales y gráficos.

## 3. Gráficas con `shadcn/ui Charts` (`recharts`)
- Envuelve cada gráfico en `ChartContainer` de shadcn/ui con `ChartTooltip` y `ChartTooltipContent`.
- Verifica que las sumas mostradas en gráficos coincidan exactamente con las filas de totales de las tablas.
- Ante `registros.length === 0`, muestra un componente de estado vacío limpio en lugar de un gráfico vacío.

## 4. Exportación 100% Client-Side (`ADR-WEB-003`)
- Marca los handlers/botones como `'use client'`.
- Usa **importación dinámica** (`await import('jspdf')`, `await import('jspdf-autotable')`, `await import('xlsx-js-style')`) dentro del evento `onClick` para evitar errores SSR (`window is not defined`) y mantener liviano el bundle inicial.
- Incluye siempre en PDF y Excel:
  1. Nombre del grupo (o *"Reporte Personal"*), período filtrado y sello de generación en `America/El_Salvador`.
  2. Nota al pie: *"Las horas reconocidas son internas del grupo y no sustituyen la acreditación oficial de servicio social."*
- En Excel (`xlsx-js-style`), guarda conteos, horas y porcentajes como celdas numéricas (`t: 'n'`) con `numFmt` apropiado y aplica estilos a encabezados (negrita, fondo suave, bordes).

## 5. Checklist antes de cerrar una issue `[WEB-*]`
1. Sin tests automatizados (no instalar Jest/Vitest/Playwright).
2. `npm run typecheck`, `npm run lint` y `npm run build` en verde.
3. Estados `cargando` (skeleton), `vacío`, `error + reintento` y copy user-friendly (sin claves `WEB-XX` ni `RFxx` en la UI).
4. Entregar guion E2E manual de navegador al usuario.
