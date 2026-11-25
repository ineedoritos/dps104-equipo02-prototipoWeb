# WEB-SCREEN-03 · Reporte de participación del grupo (`/reportes`)

- **Spec:** `docs/specs/02-dashboard-y-reportes.md#web-03` y `docs/specs/03-exportacion-client-side.md`
- **RF / RNF:** `RF15`, `RF-WEB-03`, `RF-WEB-06`, `RF-WEB-07`, `RNF03`, `RNF04`, `RNF-WEB-02`
- **Actor:** Responsable del grupo seleccionado

## Objetivo
Consultar la tabla completa por integrante obtenida desde `obtener_reporte_grupo`, inspeccionar motivos de justificadas/ajustes y exportar a PDF o Excel client-side.

## Elementos de UI
1. **Barra superior de herramientas:**
   - Selector de período (*7 días, Este mes, Todo, rango*).
   - Buscador por nombre de integrante.
   - Botones de exportación client-side: **Exportar PDF** y **Exportar Excel (.xlsx)** (deshabilitados si no hay registros).
2. **Tabla de participación (`Table` de shadcn/ui):**
   - Columnas: *Integrante*, *Presentes*, *Ausentes sin motivo*, *Justificadas*, *Tasa de asistencia* (`%` o `—`), y condicionales si aplica control de horas: *Horas registradas*, *Horas reconocidas*.
   - Ordenamiento por columna (nombre, tasa, presentes, ausencias, horas).
   - Fila de totales del grupo al pie, coincidente con la barra apilada.
3. **Drawer / Sheet lateral de detalle del integrante:**
   - Lista cronológica de ausencias justificadas con fecha y `motivo_ausencia`.
   - Lista de ajustes de horas con duración registrada, tiempo reconocido y `motivo_ajuste`.
4. **Nota al pie:** *"Las horas reconocidas son internas del grupo y no sustituyen la acreditación oficial de servicio social."*

## Estados obligatorios (`RNF04`)
- **Cargando:** skeleton de tabla + botones deshabilitados.
- **Vacío:** estado vacío diferenciado entre *"Sin registros en este período"* y *"Sin coincidencias para la búsqueda"*.
- **Error:** alerta con botón **Reintentar** y mapeo claro de `ERR_NO_AUTORIZADO`.
