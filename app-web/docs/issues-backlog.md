# Backlog de GitHub Issues · `app-web` (verticales y agent-ready)

Catálogo de issues del portal web de reportería (`Next.js + Tailwind CSS + shadcn/ui + Supabase`, sin backend propio).
> **Regla:** nunca copies los Criterios de Aceptación completos en el cuerpo de una issue; enlaza siempre a `app-web/docs/specs/...#web-XX` y `app-movil/docs/database.md#...` usando URLs absolutas a `main`.

---

## 1. Convenciones diferenciadas de `app-movil`

- **Milestone dedicado:** `Web · Reportería`
- **Label identificador obligatorio:** `plataforma:web`
- **Labels complementarios:** `tipo:setup`, `tipo:historia`, `tipo:bug`, `prioridad:alta`, `prioridad:media`, `area:ui`, `area:db`, `area:reportes`
- **Prefijos de título:**
  - `[WEB-SETUP-XX]` · Configuración base del proyecto web.
  - `[WEB-UI-XX]` · Maquetación con datos mock tipados.
  - `[WEB-XX]` · Historias funcionales conectadas a Supabase o exportación client-side.

---

## 2. Plantilla estándar de Issue (`app-web`)

```markdown
## Plataforma y Trazabilidad
- **Plataforma:** Web (`app-web/` · Next.js + Tailwind CSS + shadcn/ui · sin backend propio)
- **RF / RNF relacionados:** `RFxx`, `RF-WEB-XX`, `RNFxx`, `RNF-WEB-XX`
- **Spec:** `app-web/docs/specs/<archivo>.md#<ancla>`
- **Base de datos (fuente única):** `app-movil/docs/database.md#<seccion>`
- **Pantalla(s):** `app-web/docs/screens/WEB-SCREEN-XX.md`
- **ADR aplicable:** `app-web/docs/adrs/ADR-WEB-00X.md`
- **Bloqueada por:** #N (`CLAVE`)

## Alcance de esta rebanada vertical
**Incluye:**
- <resumen concreto de 2–4 viñetas>

**Fuera de alcance (no implementar aquí):**
- Flujos operativos de captura (crear jornadas, pasar lista, QR) — exclusivos de `app-movil`.
- Backend propio o uso de `service_role`.

## Plan técnico (tareas de implementación)
- [ ] <paso de datos / RPC / RLS o librería client-side>
- [ ] <paso UI shadcn/ui + estados cargando / vacío / error>
- [ ] <navegación, filtros y validaciones de cliente>

## Guía de prueba manual E2E (Human-in-the-loop · Navegador)
1. **Caso feliz:** <pasos concretos en desktop y responsive>
2. **Caso borde:** <validación clave de los CA>
3. **Estados RNF04:** probar Slow 3G (skeleton), vacío y Offline + Reintentar en DevTools.
4. Protocolo general: `app-web/docs/e2e-manual-guide.md`

## Definition of Done (DoD)
- [ ] Cumple los CA referenciados sin romper otras vistas.
- [ ] `typecheck`, `lint` y `build` pasan sin errores (sin agregar tests automatizados).
- [ ] Cero backend propio y cero `service_role`; autorización en Supabase RLS/RPC (`RNF03`).
- [ ] PR pequeño hacia `main` + captura en navegador + prueba manual E2E aprobada.
```

---

## 3. Catálogo de 9 Issues Verticales (`Web · Reportería`)

| Clave | Título | Prioridad | RF / RNF | Bloqueada por | Docs clave |
|---|---|---|---|---|---|
| `WEB-SETUP-01` | `[WEB-SETUP-01] Base Next.js + Tailwind CSS + shadcn/ui + estructura app-web` | Alta | `RNF-WEB-01`, `RNF04`, `RNF-WEB-03` | — | `04-setup-tecnico-web.md#web-setup-01`, `ADR-WEB-001`, `screens/README.md` |
| `WEB-UI-01` | `[WEB-UI-01] UI mock: login, dashboard KPIs, reportes, jornadas y mi reporte` | Alta | `RF14`, `RF15`, `RF-WEB-01..04`, `RNF04`, `RNF-WEB-01` | `WEB-SETUP-01` | `04-setup-tecnico-web.md#web-ui-01`, `WEB-SCREEN-01`..`05` |
| `WEB-01` | `[WEB-01] Autenticación Supabase en web y contexto por rol de grupo` | Alta | `RF01`, `RF02`, `RF-WEB-01`, `RNF02`, `RNF03`, `RNF04` | `WEB-SETUP-01`, `SETUP-02` (#10), `HU01` (#11) | `01-acceso-y-shell.md#web-01`, `ADR-WEB-002`, `WEB-SCREEN-01` |
| `WEB-02` | `[WEB-02] Dashboard de estadísticas y KPIs del grupo seleccionado` | Alta | `RF02`, `RF06`, `RF15`, `RF-WEB-02`, `RNF02`, `RNF04`, `RNF-WEB-03` | `WEB-01`, `WEB-UI-01`, `HU15` (#24) | `02-dashboard-y-reportes.md#web-02`, `WEB-SCREEN-02`, `database.md#rpc-obtener-reporte-grupo` |
| `WEB-03` | `[WEB-03] Reporte de participación del grupo y vista Mi reporte personal` | Alta | `RF14`, `RF15`, `RF-WEB-03`, `RF-WEB-04`, `RNF02`, `RNF03`, `RNF04` | `WEB-01`, `WEB-UI-01`, `HU14` (#23), `HU15` (#24) | `02-dashboard-y-reportes.md#web-03`, `WEB-SCREEN-03`, `WEB-SCREEN-05` |
| `WEB-04` | `[WEB-04] Consulta analítica de jornadas y detalle de asistencias (solo lectura)` | Alta | `RF06`, `RF14`, `RF-WEB-05`, `RNF02`, `RNF04`, `RNF-WEB-03` | `WEB-01`, `HU05` (#15), `HU07a` (#17), `HU09b` (#22) | `02-dashboard-y-reportes.md#web-04`, `WEB-SCREEN-04` |
| `WEB-05` | `[WEB-05] Exportación client-side de reportes a PDF` | Alta | `RF14`, `RF15`, `RF-WEB-06`, `RNF03`, `RNF05`, `RNF-WEB-02` | `WEB-03` | `03-exportacion-client-side.md#web-05`, `ADR-WEB-003`, `WEB-SCREEN-03`, `WEB-SCREEN-05` |
| `WEB-06` | `[WEB-06] Exportación client-side de reportes a Excel (.xlsx)` | Alta | `RF14`, `RF15`, `RF-WEB-07`, `RNF03`, `RNF05`, `RNF-WEB-02` | `WEB-03` | `03-exportacion-client-side.md#web-06`, `ADR-WEB-003`, `WEB-SCREEN-03`, `WEB-SCREEN-05` |
| `WEB-07` | `[WEB-07] Panel de auditoría Media: validaciones, solicitudes y evidencias` | Media | `RF10`, `RF12`, `RF13`, `RF-WEB-08`, `RNF03`, `RNF05` | `WEB-04`, `HU10` (#26), `HU12` (#28), `HU13` (#31) | `02-dashboard-y-reportes.md#web-07`, `WEB-SCREEN-06`, `database.md#tablas-media` |
