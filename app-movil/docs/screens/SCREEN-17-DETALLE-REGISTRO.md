# SCREEN-17 · Detalle del registro

- **Wireflow:** `17 Detalle del registro`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro.tsx`
- **Rol:** Participante (dueño del registro) · **Prioridad:** Alta *(Solicitud de revisión in-app es Media · `HU13`)*
- **Spec:** `docs/specs/03-historial-y-reportes.md#hu14` · `docs/specs/04-funciones-media.md#hu13`
- **Tablas:** `asistencias`, `jornadas`, `grupos` *(+ `solicitudes_revision` en Media)*

## Contenido y acciones
- Encabezado: título de la jornada, fecha, grupo y estado (`Presente`, `Ausente`, `Justificada`).
- Si `jornada.control_horas === true` y `estado === 'presente'`:
  - `Entrada` (`HH:MM`), `Salida` (`HH:MM`), `Duración registrada` y `Tiempo reconocido`.
  - Si hubo ajuste (`minutos_reconocidos < duracion_minutos`): tarjeta destacada **"Motivo del ajuste, escrito por el responsable"** mostrando `motivo_ajuste`.
- Si `estado === 'justificada'`: tarjeta con `motivo_ausencia`.
- Bloque **"¿Algo no cuadra?"** *(centro de la detección de inconsistencias de la hipótesis)*:
  - En `MVP · Alta`: texto *"Avísale hoy al responsable mientras todos lo recuerdan"* mostrando el nombre del responsable del grupo (el responsable corrige en `SCREEN-09`).
  - **[Media · `HU13`]** Botón **Solicitar revisión en la app** → modal con campo `motivo_solicitud` obligatorio (solo 1 pendiente por jornada). Si ya existe solicitud, muestra su estado (`Pendiente`, `Resuelta`, `Rechazada`) y `motivo_resolucion`.

## Estados obligatorios (`RNF04`)
- **Cargando / Error:** spinner inicial y reintento seguro; si intenta ver registro ajeno sin autorización, RLS devuelve vacío y muestra acceso denegado.
