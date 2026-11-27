# SCREEN-17 · Detalle del registro

- **Wireflow:** `17 Detalle del registro`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro.tsx`
- **Rol:** Participante (dueño del registro) · **Prioridad:** Alta *(Solicitud de revisión in-app es Media · `HU13`)*
- **Spec:** `docs/specs/03-historial-y-reportes.md#hu14` · `docs/specs/04-funciones-media.md#hu13`
- **Tablas:** `asistencias`, `jornadas`, `grupos` *(+ `solicitudes_revision` en Media)*

## Contenido y acciones
- Encabezado: título de la jornada, fecha, grupo, estado (`Presente`, `Ausente`, `Justificada`) y estado de validación (`Pendiente` / `Aprobado` con explicación si `requiere_validacion === true`, o texto explícito indicando que la jornada no exige validación previa).
- Si `jornada.control_horas === true` y `estado === 'presente'`:
  - `Entrada` (`HH:MM`), `Salida` (`HH:MM`), `Duración registrada` y `Tiempo reconocido`.
  - Si hubo ajuste (`minutos_reconocidos < duracion_minutos`): tarjeta destacada **"Motivo del ajuste, escrito por el responsable"** mostrando `motivo_ajuste`.
- Si `estado === 'justificada'`: tarjeta con `motivo_ausencia`.
- **[Media · `HU10`]** Bloque **Fotos de la jornada** (si `modo_fotos !== 'no_permitidas'`): galería de fotos propias con autor y fecha, aviso informativo si `modo_fotos === 'obligatorias'` y el participante aún no sube foto, botón **Agregar foto** en jornadas iniciadas y no canceladas (con simulación de permiso denegado y error de subida con **Reintentar** / **Abrir ajustes**).
- Bloque **"Revisión"**:
  - Visible para participantes activos aunque no tengan registro de asistencia, siempre que la jornada no esté cancelada (`HU13 CA01`).
  - Si no existe solicitud o la más reciente ya fue resuelta/rechazada: muestra botón **Solicitar revisión** que abre modal con campo `motivo_solicitud` obligatorio (10 a 500 caracteres).
  - Si existe solicitud: muestra tarjeta con su estado (`Pendiente`, `Resuelta`, `Rechazada`), motivo enviado, fecha y `motivo_resolucion` si aplica (`HU13 CA04`). Con una `pendiente` no se muestra el botón (`HU13 CA02`). Crear una solicitud no modifica asistencia ni horas.

## Estados obligatorios (`RNF04`)
- **Cargando / Error:** spinner inicial y reintento seguro; si intenta ver registro ajeno sin autorización, RLS devuelve vacío y muestra acceso denegado.
