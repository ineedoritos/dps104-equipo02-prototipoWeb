# SCREEN-16 · Mi historial

- **Wireflow:** `16 Mi historial`
- **Ruta Expo Router:** `app/(tabs)/historial.tsx` *(admite filtro opcional `?grupoId=...` al entrar desde `SCREEN-13`)*
- **Rol:** Integrante (actual o anterior) · **Prioridad:** Alta
- **Spec:** `docs/specs/03-historial-y-reportes.md#hu14`
- **Tablas:** `asistencias`, `jornadas`, `grupos`

## Contenido y acciones
- Filtro superior por grupo (*Todos* o un grupo específico). Incluye grupos de participación activa y aquellos de los que la persona salió o fue retirada como participante. Excluye los grupos donde actualmente es responsable.
- Tarjetas de resumen del filtro seleccionado:
  - **Asistencia:** tasa en `%` + desglose (`presentes`, `justificadas`, `ausentes`).
  - **Horas** *(visible únicamente si aplica control de horas)*: separa **Horas registradas**, **Horas reconocidas** y **Horas pendientes** *(cuando exista validación)*.
- Lista cronológica de registros propios (agrupados por mes):
  - Título de jornada, nombre del grupo, fecha, badge de estado (`Presente`, `Ausente`, `Justificada`, `Ajustada`, o `Cancelada · no cuenta`).
  - Si `justificada`: muestra el `motivo_ausencia`.
  - Si tiene horas ajustadas: muestra duración registrada vs tiempo reconocido.
  - Tocar cualquier registro → `SCREEN-17` (`Detalle del registro`).

## Estados obligatorios (`RNF04`)
- **Cargando:** skeleton + *pull-to-refresh*.
- **Vacío (`HU14 CA03`):** *"Todavía no tienes registros de participación"*.
- **Error:** aviso claro con botón **Reintentar**.
