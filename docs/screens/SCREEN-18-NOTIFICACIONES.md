# SCREEN-18 · Notificaciones *(Prioridad Media)*

- **Wireflow:** Pantalla complementaria para `RF16` / `HU16` (no existía en los 17 wireframes de Alta)
- **Ruta Expo Router:** `app/(tabs)/notificaciones.tsx`
- **Rol:** Usuario autenticado · **Prioridad:** Media *(prioridad #2 dentro de Media)*
- **Spec:** `docs/specs/04-funciones-media.md#hu16` · `docs/adrs/ADR-004-notificaciones-y-push.md`
- **Tablas:** `notificaciones`, `tokens_push`

## Contenido y acciones
- Banner superior discreto si el permiso de notificaciones push en Android no está concedido:
  - *"Las notificaciones push están desactivadas. Igual verás todos tus avisos aquí."* + botón **Activar avisos en el dispositivo**.
- Lista cronológica de notificaciones propias (`usuario_id = auth.uid()`):
  - Punto indicador de `no leída` vs `leída`.
  - Título, mensaje, tipo de evento (`asistencia_modificada`, `horas_actualizadas` o `solicitud_revision`) y fecha/hora.
  - Al tocar una notificación: la marca como `leida = true` y navega al detalle relacionado (`SCREEN-17` o `SCREEN-09` según el rol/evento).
- Acción en cabecera: **Marcar todas como leídas**.

## Estados obligatorios (`RNF04`)
- **Cargando:** spinner inicial + *pull-to-refresh*.
- **Vacío:** *"No tienes notificaciones todavía."*
- **Permiso push denegado:** nunca bloquea la bandeja in-app (`HU16 CA04`).
- **Error:** aviso visible con reintento sin duplicar eventos.
