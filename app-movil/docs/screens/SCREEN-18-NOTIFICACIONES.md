# SCREEN-18 · Notificaciones *(Prioridad Media)*

- **Wireflow:** Pantalla complementaria para `RF16` / `HU16` (no existía en los 17 wireframes de Alta)
- **Ruta Expo Router:** `app/notificaciones.tsx`
- **Rol:** Usuario autenticado · **Prioridad:** Media *(prioridad #2 dentro de Media)*
- **Spec:** `docs/specs/04-funciones-media.md#hu16` · `docs/adrs/ADR-004-notificaciones-y-push.md`
- **Tablas:** `notificaciones`, `tokens_push`

## Contenido y acciones
- Banner superior discreto si el permiso de notificaciones push en Android no está concedido:
  - *"Las notificaciones push están desactivadas. Igual verás todos tus avisos aquí."* + botón **Activar avisos en el dispositivo** (simulación con hoja de permiso en desarrollo). Nunca bloquea la bandeja (`HU16 CA04`).
- Lista cronológica (`FlatList`) de notificaciones propias (`usuario_id = sesión actual`), ordenadas de la más reciente a la más antigua:
  - Punto indicador y etiqueta *"Sin leer"* en `no leída` vs `leída` (nunca comunicado solo con color).
  - Título, mensaje, icono por tipo de evento (`asistencia_modificada`, `horas_actualizadas` o `solicitud_revision`) y fecha relativa.
  - Al tocar una notificación: la marca como `leida = true`, actualiza el indicador de la campana y navega al detalle relacionado (`SCREEN-17` para asistencia/horas o `SCREEN-08` para solicitudes de revisión). Si la jornada no existe, muestra un aviso claro.
- Acción al final de la lista: **Marcar todas como leídas** (visible cuando hay al menos una sin leer).
- Campana en el encabezado de las pestañas principales con un indicador de avisos sin leer.

## Estados obligatorios (`RNF04`)
- **Cargando:** spinner inicial + *pull-to-refresh*.
- **Vacío:** *"No tienes notificaciones todavía."*
- **Permiso push denegado:** nunca bloquea la bandeja in-app (`HU16 CA04`).
- **Error:** aviso visible con reintento sin duplicar eventos (`clave_unica`).
