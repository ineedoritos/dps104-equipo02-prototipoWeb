# SCREEN-12 · Reportes de participación

- **Wireflow:** `12 Reportes`
- **Ruta Expo Router:** `app/grupos/[grupoId]/reportes.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta
- **Spec:** `docs/specs/03-historial-y-reportes.md#hu15`
- **Tablas / RPC:** RPC `obtener_reporte_grupo`

## Contenido y acciones
- Selector de **Período** (chips rápidos): *Últimos 7 días* | *Este mes* | *Todo* | *Personalizado (desde–hasta)*.
- Tabla / lista de **solo lectura** (sin botones de exportar a PDF/Excel) por integrante:
  - Columnas: `Integrante` | `Pres.` | `Aus.` | `Tasa` *(+ `Horas reg. / rec.` si el grupo usa horas)*.
  - Al tocar la fila de un integrante, se despliega el detalle de sus ausencias justificadas y motivos (*ej. "2 justificadas: examen en el colegio, enfermedad · 2 sin motivo"*).
- Nota explicativa al pie: *"Tasa = presentes ÷ (presentes + ausencias) × 100. Las justificadas cuentan como ausencia, pero se ve su motivo. Se excluyen jornadas canceladas y asistencias sin registrar. Solo lectura."*

## Estados obligatorios (`RNF04`)
- **Cargando:** indicador al cambiar de período o cargar reporte.
- **Vacío:** *"No hay registros de asistencia en el período seleccionado"*. Si un integrante tiene `0` presentes y `0` ausencias, mostrar `—` en tasa (nunca `NaN`).
- **Error:** aviso visible con botón **Reintentar**.
