# SCREEN-05 · Configuración del grupo

- **Wireflow:** `05 Configuración`
- **Ruta Expo Router:** `app/grupos/[grupoId]/configuracion.tsx`
- **Rol:** Responsable activo · **Prioridad:** Alta *(con switches preparados para Media)*
- **Spec:** `docs/specs/01-acceso-y-grupos.md#hu04`
- **Tablas:** `grupos`

## Contenido y acciones
- Selector excluyente **¿Cómo se registra la asistencia?**:
  - **Manual:** el responsable pasa lista (`presente`, `ausente` o `justificada`).
  - **Por QR:** cada participante escanea un código temporal; el responsable puede corregir.
- Switch **Control de horas (`control_horas`)**:
  - **Regla T1 (`HU04 CA02`):** es **independiente de la modalidad** (funciona tanto en `manual` como en `qr`; concilia la nota vieja del wireflow).
- Bloque **Funciones opcionales (`MEDIA`)**:
  - `Comprobar cercanía por GPS (solo QR)` — deshabilitado automáticamente y forzado a `false` si la modalidad es `manual`.
  - `Notificaciones` (`notificaciones_habilitadas`).
  - `Permitir fotos` (`fotos_habilitadas`).
  - `Exigir validación` (`requiere_validacion`).
  - *(En `MVP · Alta`, estos switches pueden mostrarse claramente etiquetados como `Próximamente / Media` o deshabilitados hasta habilitar su issue.)*
- Nota al pie: *"Los cambios aplican a jornadas nuevas. Los registros anteriores no cambian."*
- Botón principal: **Guardar cambios** → actualiza `grupos` y vuelve a `SCREEN-04`.

## Estados obligatorios (`RNF04`)
- **Cargando / Guardando:** bloquear controles durante guardado.
- **Error:** si un no-responsable intenta guardar o falla red, mostrar error y permitir reintentar.
