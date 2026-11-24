# SCREEN-09 · Asistencia y correcciones (Pasar lista)

- **Wireflow:** `09 Asistencia y correcciones`
- **Ruta Expo Router:** `app/grupos/[grupoId]/jornadas/[jornadaId]/asistencia.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta *(Validación previa es Media · `HU12`)*
- **Spec:** `docs/specs/02-jornadas-y-asistencia.md#hu07` · `docs/specs/04-funciones-media.md#hu12`
- **Tablas / RPC:** `asistencias`, `integrantes_grupo`, RPC `registrar_asistencia_manual`

## Contenido y acciones
- Encabezado: título de la jornada, horario y modalidad (*ej. "Manual · con horas"* o *"Registrada por QR · corrección excepcional"*).
- Leyenda rápida: `P presente` · `A ausente` · `J justificada`.
- Lista únicamente de integrantes activos con rol actual **`participante`** (sin responsables):
  - Nombre del participante.
  - Botones de estado `P` | `A` | `J` (ninguno seleccionado = sin registro, no cuenta como ausente).
  - Si `J` está seleccionado: campo obligatorio **`Motivo de la ausencia`** (texto breve informativo, sin adjuntos).
  - Si `P` está seleccionado y `jornada.control_horas === true`: resumen de horas (*ej. "Entrada 8:02 · Salida 12:00"*) + acción **`Registrar / Ajustar horas ›`** → `SCREEN-10`.
  - Si `jornada.control_horas === false`: ocultar cualquier campo o enlace de horas (`HU09 CA05`).
  - **[Media · `HU12`]** Si `requiere_validacion === true`: badge `Pendiente` / `Aprobado` y botón **Aprobar** (deshabilitado si horas incompletas).
- Pie con resumen en vivo (*"4 presentes · 1 ausente · 1 justificada"*) + botón **Guardar cambios** → ejecuta `registrar_asistencia_manual` y regresa a `SCREEN-08`.

## Estados obligatorios (`RNF04`)
- **Validación:** bloquear guardado si hay un `J` sin motivo; advertir visualmente si cambiar de `P` a `A`/`J` limpiará horas registradas (`HU07 CA04`).
- **Cargando / Vacío / Error:** estado vacío si el grupo no tiene participantes activos; error visible con reintento seguro sin duplicar registros.
