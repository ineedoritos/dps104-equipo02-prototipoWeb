# WEB-SCREEN-02 · Dashboard de estadísticas (`/dashboard`)

- **Spec:** `docs/specs/02-dashboard-y-reportes.md#web-02`
- **RF / RNF:** `RF02`, `RF06`, `RF15`, `RF-WEB-02`, `RNF04`, `RNF-WEB-03`
- **Actor:** Responsable del grupo seleccionado

## Objetivo
Mostrar de un vistazo la salud de participación y horas del grupo seleccionado en el período elegido.

## Elementos de UI
1. **Barra de filtros de período:** presets (*Últimos 7 días*, *Este mes*, *Todo*) + selector de rango personalizado (*Desde – Hasta* en `America/El_Salvador`).
2. **Grid de 4 tarjetas KPI:**
   - Tasa de asistencia del período (`%` o `—`).
   - Presentes vs Ausencias (con subtítulo desglosando *sin motivo* y *justificadas*).
   - Jornadas contabilizadas (indicando canceladas excluidas).
   - Horas reconocidas / Horas registradas *(visible solo si `control_horas = true` o existen horas en el período)*.
3. **Gráficos (`shadcn/ui Charts` / `recharts`):**
   - **Distribución de asistencias (barra apilada):** `Presentes`, `Justificadas`, `Ausentes sin motivo` con totales sincronizados al reporte.
   - **Tendencia por jornada:** gráfico de barras o área mostrando asistencia/tasa por cada jornada no cancelada del período.
4. **Accesos rápidos:** enlaces a *Ver reporte detallado* (`/reportes`) y *Explorar jornadas* (`/jornadas`).

## Estados obligatorios (`RNF04`)
- **Cargando:** skeletons en tarjetas KPI y contenedores de gráficos.
- **Vacío:** mensaje claro cuando el período no tiene registros de asistencia.
- **Error:** alerta con botón **Reintentar** seguro.
