# ADR-004 · Notificaciones in-app siempre + Push Android (Expo Push / FCM v1)

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
`RF16` / `HU16` (prioridad Media) requiere notificar en la app y por push en exactamente 3 eventos (modificación de asistencia, aprobación/modificación de horas, y nueva solicitud de revisión), garantizando que sin permiso push el aviso igual se vea en la app y sin duplicados en reintentos.

## Decisión
1. **Dos tablas separadas:**
   - `notificaciones`: bandeja persistente in-app (siempre se inserta aquí, con `clave_unica` para idempotencia).
   - `tokens_push`: tokens Expo (`ExponentPushToken[...]`) por dispositivo Android activo del usuario.
2. **Canal de entrega Android:** al crear el Development Build Android (`ADR-001`), se configura un proyecto gratuito de Firebase Console **únicamente** para credenciales FCM v1 (`google-services.json`), y una **Supabase Edge Function** (disparada por webhook de inserción en `notificaciones`) envía el payload al API de Expo Push (`https://exp.host/--/api/v2/push/send`).
3. **Eventos permitidos (estricto):**
   - `asistencia_modificada` → al participante afectado.
   - `horas_actualizadas` → al participante afectado.
   - `solicitud_revision` → a los responsables activos del grupo.
   - **Prohibido:** push por cada llegada por QR, correo o SMS.
4. **Respeto a configuración del grupo:** solo se generan notificaciones si `jornada.notificaciones_habilitadas = true` (o `grupo.notificaciones_habilitadas = true`).

## Consecuencias
- **Positivas:** la bandeja in-app funciona incluso en Expo Go o si el usuario deniega permisos, evitando bloqueos en la defensa; push real funciona gratis en Android.
- **Costo operativo:** requiere configurar credenciales FCM v1 una sola vez al entrar a la oleada Media.
