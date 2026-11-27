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
- Selector excluyente **Modo de fotografías (`modo_fotos`)**:
  - **No se usan (`no_permitidas`):** nadie puede subir fotos en las jornadas.
  - **Opcionales (`opcionales`):** los integrantes pueden agregar fotos como evidencia.
  - **Obligatorias (`obligatorias`):** cada integrante debe subir al menos una foto para que su asistencia cuente.
- Switch **Comprobar cercanía por GPS (`gps_habilitado`)**:
  - Activo cuando `modalidad_asistencia === 'qr'`; deshabilitado automáticamente y forzado a `false` si la modalidad es `manual` (`HU11`).
- Switch **Exigir validación (`requiere_validacion`)**:
  - Activo: *"Los registros cuentan cuando un responsable los aprueba."* (`HU12`).
- Bloque **Funciones opcionales (`MEDIA`)**:
  - `Notificaciones` (`notificaciones_habilitadas`).
  - *(Los switches aún sin flujo completo muestran claramente `Próximamente` hasta habilitar su historia.)*
- Nota al pie: *"Los cambios aplican a jornadas nuevas. Los registros anteriores no cambian."*
- Cada cambio de configuración se guarda al seleccionar la opción. La pantalla permanece abierta.
- Bloque **Salir del grupo** (al final, separado de la configuración):
  - Si hay otro responsable activo: botón **Salir del grupo** con confirmación.
  - Si soy el **último responsable**: elijo entre los demás integrantes quién queda a cargo; el botón **Salir y dejar a {nombre}** asciende a esa persona a `responsable` y me retira en un solo paso. El grupo nunca queda sin responsable (`HU03 CA02`, `ERR_ULTIMO_RESPONSABLE`).
  - Si soy el **único integrante**: aviso *"Agrega a alguien desde Integrantes antes de salir"* y sin botón.
  - Al salir se vuelve a `SCREEN-02`; el historial se conserva.

## Estados obligatorios (`RNF04`)
- **Cargando / Guardando:** bloquear controles durante guardado.
- **Error:** si un no-responsable intenta guardar o falla red, mostrar error y permitir reintentar.
