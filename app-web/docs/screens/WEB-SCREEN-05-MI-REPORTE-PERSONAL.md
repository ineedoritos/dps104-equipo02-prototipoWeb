# WEB-SCREEN-05 · Mi reporte personal (`/mi-reporte`)

- **Spec:** `docs/specs/02-dashboard-y-reportes.md#web-03` y `docs/specs/03-exportacion-client-side.md`
- **RF / RNF:** `RF14`, `RF-WEB-04`, `RF-WEB-06`, `RF-WEB-07`, `RNF03`, `RNF04`, `RNF-WEB-02`
- **Actor:** Cualquier usuario autenticado (Participante o Responsable consultando su propio historial)

## Objetivo
Permitir a cualquier persona consultar sus propias estadísticas de asistencia, horas y motivos de ajuste (incluyendo grupos de los que salió o fue retirada) y descargar su propio reporte en PDF o Excel client-side.

## Elementos de UI
1. **Filtros y exportación:**
   - Selector de grupo: *Todos mis grupos* o un grupo específico (incluye ex-grupos etiquetados como *"Anterior"*).
   - Selector de período (*7 días, Este mes, Todo, rango*).
   - Botones **Exportar mi PDF** y **Exportar mi Excel (.xlsx)**.
2. **Resumen personal (tarjetas KPI):**
   - Tasa de asistencia personal (`%` o `—`).
   - Desglose: *Presentes*, *Justificadas*, *Ausentes sin motivo*.
   - Cuando aplique control de horas: separación explícita de **Duración registrada**, **Tiempo reconocido** y **Tiempo pendiente** (si existe validación previa).
3. **Tabla de registros propios:**
   - Columnas: fecha, grupo, jornada, estado, horas (si aplica) y observaciones (`motivo_ausencia` o `motivo_ajuste` resaltado cuando hubo recorte de minutos).
   - Jornadas canceladas claramente etiquetadas y excluidas de totales.

## Estados obligatorios (`RNF04`)
- **Cargando:** skeletons en resumen y tabla.
- **Vacío:** mensaje claro si aún no tiene asistencias registradas en el período.
- **Error:** alerta visible con botón **Reintentar**.
