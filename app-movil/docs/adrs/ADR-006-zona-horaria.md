# ADR-006 · Zona horaria única `America/El_Salvador` en app y Supabase

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
Las jornadas duran un solo día calendario (`ADR-003`) y su estado (`programada`, `en_curso`, `finalizada`) depende de la hora actual (`HU06 CA01`). Si la app y la BD usan zonas distintas, una jornada puede aparecer en otro día o con un estado incorrecto.

## Decisión
1. **Zona oficial:** `America/El_Salvador` (UTC-6, sin horario de verano) en todo el proyecto.
2. **Supabase:** la BD se configura con `ALTER DATABASE postgres SET timezone TO 'America/El_Salvador';`. Las columnas siguen siendo `timestamptz`, y las validaciones de "mismo día" usan `AT TIME ZONE 'America/El_Salvador'`.
3. **Frontend (Expo):** todas las fechas se muestran y se construyen en `America/El_Salvador` con un único helper (`lib/fecha.ts`), sin depender de la zona del teléfono. Al enviar a Supabase se usa ISO 8601 con offset (`-06:00`).
4. **Estado de la jornada:** se calcula en el cliente con ese helper. Las reglas críticas (QR vigente, jornada iniciada, horas no futuras) se vuelven a validar en los RPCs con `now()` del servidor.

## Consecuencias
- **Positivas:** una sola regla de fecha para todos; sin desfases por la configuración del teléfono.
- **Riesgo:** si el reloj del teléfono está mal, el estado mostrado puede variar unos minutos; los RPCs siguen siendo la autoridad.
