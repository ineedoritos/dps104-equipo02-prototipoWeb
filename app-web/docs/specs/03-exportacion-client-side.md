# Spec Web 03 · Exportación Client-Side (PDF y Excel)

Especificación de descargas de reportes generados **100% en el navegador**, sin backend propio.
Relacionado con: `RF14`, `RF15`, `RF-WEB-06`, `RF-WEB-07`, `RNF03`, `RNF05`, `RNF-WEB-02`, `RNF-WEB-03`, `ADR-WEB-003`.

---

## Reglas transversales de exportación
1. **Cero backend (`RNF-WEB-02`):** los archivos se construyen en memoria del navegador con los datos ya consultados por el usuario autenticado bajo RLS.
2. **Coherencia con filtros activos:** lo exportado refleja **exactamente** el grupo (o reporte personal) y el período seleccionado en pantalla.
3. **Nombre de archivo determinístico:**
   - Grupal: `reporte-<slug-grupo>-<YYYYMMDD>-<YYYYMMDD>.<pdf|xlsx>`
   - Personal: `mi-reporte-<YYYYMMDD>-<YYYYMMDD>.<pdf|xlsx>`
4. **Estado vacío bloqueado:** si el período filtrado no tiene registros, el botón de exportar queda deshabilitado con tooltip explicativo.
5. **Nota obligatoria:** todo archivo exportado incluye la aclaración: *"Las horas reconocidas son internas del grupo y no sustituyen la acreditación oficial de servicio social."* y la fecha/hora de generación en `America/El_Salvador` (UTC-6).

---

<a id="web-05"></a>

## WEB-05 · Exportación Client-Side a PDF
- **Requerimientos:** `RF15`, `RF14`, `RF-WEB-06`, `RNF05`, `RNF-WEB-02`
- **Actores:** Responsable (reporte grupal) · Participante (mi reporte personal)
- **Prioridad:** Alta
- **Librería aprobada:** `jspdf` + `jspdf-autotable` (`ADR-WEB-003`).

### Criterios de aceptación
- `WEB05-CA01`: Desde *Reportes del grupo* (responsable), genera y descarga un PDF profesional en tamaño Carta/A4 con:
  - Encabezado: título del reporte, nombre del grupo, período consultado y fecha/hora de generación (`America/El_Salvador`).
  - Bloque resumen con KPIs globales del período (tasa, presentes, ausentes sin motivo, justificadas y horas si aplican).
  - Tabla por integrante con las mismas columnas y totales visibles en pantalla (omitiendo columnas de horas si `control_horas = false`).
  - Pie de página con paginación (`Página X de Y`) y la nota obligatoria sobre horas internas.
- `WEB05-CA02`: Desde *Mi reporte personal* (participante), genera y descarga un PDF con su resumen personal (tasa y totales) y su tabla de asistencias/motivos del período filtrado.
- `WEB05-CA03`: Muestra estado de carga en el botón durante la generación y un mensaje claro si falla la descarga, sin congelar la pestaña (`RNF04`).
- `WEB05-CA04`: No expone columnas privadas ni correos de otros usuarios (`RNF05`).

---

<a id="web-06"></a>

## WEB-06 · Exportación Client-Side a Excel (`.xlsx`)
- **Requerimientos:** `RF15`, `RF14`, `RF-WEB-07`, `RNF05`, `RNF-WEB-02`
- **Actores:** Responsable (reporte grupal) · Participante (mi reporte personal)
- **Prioridad:** Alta
- **Librería aprobada:** `xlsx-style` / `xlsx-js-style` (`ADR-WEB-003`).

### Criterios de aceptación
- `WEB06-CA01`: Desde *Reportes del grupo* (responsable), genera y descarga un libro `.xlsx` con estilos (encabezados en negrita con relleno, bordes suaves, anchos de columna ajustados) compuesto por:
  1. Hoja **`Resumen`**: metadatos (grupo, período, fecha de generación UTC-6), KPIs totales y nota obligatoria sobre horas internas.
  2. Hoja **`Participacion`**: tabla por integrante con valores numéricos reales (no texto) para presentes, ausentes, justificadas, tasa (`0.0%` o `—`) y horas registradas/reconocidas si aplican.
  3. Hoja **`Justificadas_y_Ajustes`**: detalle fila por fila de ausencias justificadas (`motivo_ausencia`) y ajustes de horas (`motivo_ajuste`) del período (o fila informativa si no hay).
- `WEB06-CA02`: Desde *Mi reporte personal* (participante), genera un libro `.xlsx` con hojas **`Resumen_Personal`** y **`Detalle_Asistencias`** con sus propios registros y motivos.
- `WEB06-CA03`: El archivo abre limpiamente en Microsoft Excel, LibreOffice Calc y Google Sheets sin advertencias de archivo corrupto ni pérdida de acentos UTF-8.
- `WEB06-CA04`: Muestra indicador de progreso en el botón y manejo de error amigable (`RNF04`).
