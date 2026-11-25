# Spec Web 02 · Dashboard, reportes de participación, jornadas y reporte personal

Módulo central de visualización estadística y consulta de `app-web`.
Relacionado con: `RF06`, `RF14`, `RF15`, `RF-WEB-02`, `RF-WEB-03`, `RF-WEB-04`, `RF-WEB-05`, `RF-WEB-08`, `RNF02`, `RNF03`, `RNF04`, `RNF05`, `RNF-WEB-03`.

---

## Regla de cálculo compartida (Fuente única: `app-movil/docs/specs/03-historial-y-reportes.md#hu15`)
Toda tasa de asistencia en `app-web` (tanto en dashboard, reporte grupal como reporte personal) **debe** respetar exactamente:
```text
ausencias = ausentes_sin_motivo + justificadas
tasa = presentes / (presentes + ausencias) * 100
```
- Se excluyen **jornadas canceladas** (`cancelada = true`) y jornadas donde no exista registro (sin fila ≠ ausente).
- Si `presentes + ausencias = 0`, mostrar `—` (nunca `NaN`, `Infinity` ni `0%` falso).
- Si el grupo/jornada tiene `control_horas = false`, ocultar métricas y columnas de horas.

---

<a id="web-02"></a>

## WEB-02 · Dashboard de estadísticas y KPIs del grupo
- **Requerimientos:** `RF02`, `RF06`, `RF15`, `RF-WEB-02`, `RNF04`, `RNF-WEB-03`
- **Actor:** Responsable del grupo
- **Prioridad:** Alta
- **Historia:** Como responsable, quiero ver un resumen visual con KPIs y gráficos del grupo por período para identificar tendencias de asistencia y brechas de horas de un vistazo.

### Criterios de aceptación
- `WEB02-CA01`: Permite filtrar por período con presets rápidos (*Últimos 7 días*, *Este mes*, *Todo*) y rango personalizado (*desde–hasta* en `America/El_Salvador`), validando que `desde <= hasta`.
- `WEB02-CA02`: Muestra tarjetas KPI consistentes con el período filtrado:
  1. **Tasa de asistencia global** del grupo (con fórmula exacta).
  2. **Total presentes** vs **Ausencias** (desglosando *sin motivo* y *justificadas*).
  3. **Jornadas contabilizadas** (excluyendo canceladas, indicando cuántas canceladas quedaron fuera).
  4. **Horas reconocidas vs registradas** (visible solo si el grupo tiene `control_horas = true` o existen jornadas con horas en el período).
- `WEB02-CA03`: Incluye al menos 2 visualizaciones interactivas con `shadcn/ui Charts` (`recharts`):
  - **Barra apilada / distribución de estados** (`presentes`, `justificadas`, `ausentes sin motivo`) cuyos totales coinciden exactamente con la tabla de reporte.
  - **Gráfico de tendencia por jornada** (asistencia y/o tasa por fecha de jornada dentro del período).
- `WEB02-CA04`: Si el período no tiene registros, muestra estado vacío limpio sin gráficos rotos ni `NaN`.

---

<a id="web-03"></a>

## WEB-03 · Reporte detallado de participación por integrante y mi reporte personal
- **Requerimientos:** `RF14`, `RF15`, `RF-WEB-03`, `RF-WEB-04`, `RNF03`, `RNF04`
- **Actores:** Responsable (vista grupal) · Participante / Cualquier usuario (vista *"Mi reporte personal"*)
- **Prioridad:** Alta
- **Historia:** Como responsable, quiero consultar una tabla detallada por integrante con búsqueda, ordenamiento y desglose de motivos; y como participante, quiero consultar mi propio reporte de asistencia y horas con el mismo nivel de claridad.

### Criterios de aceptación (Vista Responsable · Reporte de grupo)
- `WEB03-CA01`: Consume el RPC `obtener_reporte_grupo(p_grupo_id, p_desde, p_hasta)` con los mismos filtros de período del dashboard.
- `WEB03-CA02`: Muestra tabla de integrantes (incluyendo ex-integrantes con registros en el período) con: nombre, presentes, ausentes sin motivo, justificadas, tasa de asistencia y (si aplica) horas registradas y reconocidas.
- `WEB03-CA03`: Permite buscar por nombre y ordenar por tasa, presentes, ausencias u horas reconocidas (ordenamiento client-side sobre el resultado del RPC).
- `WEB03-CA04`: Al seleccionar una fila, abre un drawer/modal con el desglose de **motivos de ausencias justificadas** (fecha + motivo) y el detalle de **ajustes de horas** con `motivo_ajuste`.

### Criterios de aceptación (Vista Participante · Mi reporte personal)
- `WEB03-CA05`: Muestra las estadísticas personales del usuario autenticado (con filtro de grupo —incluyendo ex-grupos— y filtro de período): tasa personal, presentes, justificadas, ausentes sin motivo y, cuando aplique, separación explícita entre **duración registrada**, **tiempo reconocido** y **tiempo pendiente**.
- `WEB03-CA06`: Lista cada registro propio con fecha, grupo, título de jornada, estado, horas (si aplican), `motivo_ausencia` y `motivo_ajuste` destacado cuando `minutos_reconocidos < duracion_minutos`. Las jornadas canceladas se etiquetan claramente y se excluyen de totales.
- `WEB03-CA07`: Protegido por RLS: un participante jamás puede consultar registros de otros integrantes.

---

<a id="web-04"></a>

## WEB-04 · Consulta analítica de jornadas y detalle de asistencias (solo lectura)
- **Requerimientos:** `RF06`, `RF14`, `RF-WEB-05`, `RNF02`, `RNF04`, `RNF-WEB-03`
- **Actor:** Responsable del grupo
- **Prioridad:** Alta
- **Historia:** Como responsable, quiero explorar las jornadas del grupo y ver quién asistió, cómo se registró (manual/QR) y qué horas o ajustes tuvo cada persona, sin riesgo de modificar datos accidentalmente.

### Criterios de aceptación
- `WEB04-CA01`: Lista las jornadas del grupo ordenadas por fecha descendente, filtrables por rango de fechas y estado derivado (`programada`, `en_curso`, `finalizada`, `cancelada`) calculado en `America/El_Salvador`.
- `WEB04-CA02`: Cada fila muestra título, fecha/horario, modalidad (`manual` / `qr`), indicador de control de horas, conteo rápido de registros y badge de `Cancelada` si aplica.
- `WEB04-CA03`: Al entrar al detalle de una jornada, muestra su tabla de asistencias en **solo lectura**: participante, estado (`presente`/`ausente`/`justificada`), origen (`manual`/`qr`), entrada/salida, duración, minutos reconocidos, `motivo_ausencia` y `motivo_ajuste`.
- `WEB04-CA04`: No incluye botones de edición, eliminación ni toma de asistencia; se mantiene estrictamente como vista de consulta y auditoría.

---

<a id="web-07"></a>

## WEB-07 · Panel de auditoría Media (validaciones, solicitudes y evidencias)
- **Requerimientos:** `RF10`, `RF12`, `RF13`, `RF-WEB-08`, `RNF03`, `RNF05`
- **Actor:** Responsable del grupo
- **Prioridad:** Media
- **Historia:** Como responsable, quiero revisar en la web qué registros tienen validación pendiente, qué solicitudes de revisión existen y consultar las fotos de evidencia activas de cada jornada.

### Criterios de aceptación
- `WEB07-CA01`: Pestaña/sección **Validaciones pendientes**: lista asistencias con `estado_validacion = 'pendiente'` del grupo seleccionado (solo lectura, con filtro por jornada).
- `WEB07-CA02`: Pestaña/sección **Solicitudes de revisión**: lista `solicitudes_revision` del grupo filtrables por estado (`pendiente`, `resuelta`, `rechazada`), mostrando participante, jornada, `motivo_solicitud` y `motivo_resolucion`.
- `WEB07-CA03`: Pestaña/sección **Evidencias fotográficas**: muestra galería de `fotos_jornada` activas (`retirada_en IS NULL`) mediante URLs firmadas o políticas de Storage autorizadas por RLS, indicando jornada, autor y fecha (`RNF05`).
- `WEB07-CA04`: Si el grupo no tiene habilitadas estas funciones o no existen registros, muestra estados vacíos informativos sin errores.
