# WEB-SCREEN-04 · Consulta analítica de jornadas (`/jornadas` y `/jornadas/[id]`)

- **Spec:** `docs/specs/02-dashboard-y-reportes.md#web-04`
- **RF / RNF:** `RF06`, `RF14`, `RF-WEB-05`, `RNF02`, `RNF04`, `RNF-WEB-03`
- **Actor:** Responsable del grupo seleccionado

## Objetivo
Explorar el historial de jornadas del grupo y auditar el registro de asistencias y horas de una jornada específica en modo **solo lectura**.

## Elementos de UI
### Listado (`/jornadas`)
- Filtros por rango de fechas y estado derivado (`Todas`, `Programada`, `En curso`, `Finalizada`, `Cancelada`).
- Tabla/tarjetas con: título, fecha y horario (`America/El_Salvador`), modalidad (`Manual` / `QR`), indicador de control de horas, resumen rápido de registros y badge de estado.
- Las jornadas canceladas muestran etiqueta clara *"Cancelada · excluida de totales"*.

### Detalle (`/jornadas/[id]`)
- Encabezado con metadatos de la jornada (sin botones de edición/cancelación).
- Resumen rápido: total presentes, ausentes, justificadas y total de horas reconocidas (si aplica).
- Tabla de asistencias (solo lectura): participante, estado, origen (`Manual`/`QR`), hora entrada, hora salida, duración, tiempo reconocido y motivos (`motivo_ausencia` / `motivo_ajuste`).

## Estados obligatorios (`RNF04`)
- **Cargando:** skeletons de listado y tabla.
- **Vacío:** sin jornadas en el filtro o jornada sin asistencias registradas.
- **Error / No encontrada:** alerta clara con enlace para volver a `/jornadas` y botón **Reintentar**.
