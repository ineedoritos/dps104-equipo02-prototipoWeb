# ADR-002 · Backend y BD: Supabase Cloud (PostgreSQL), nombres en español, RLS y 4 RPCs

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
Se requiere autenticación (`RF01`), API en la nube (`RNF02`), autorización y validación en servidor sin duplicados (`RNF03`), almacenamiento de fotos opcional (`RF10`) y reportes con tasas y horas (`RF15`), todo en tier gratuito sin tarjeta de crédito.

## Decisión
1. **Supabase Cloud (tier gratuito):** provee Auth, PostgreSQL, API REST/RPC automática, RLS y Storage en un solo servicio sin tarjeta (a diferencia de Firebase, donde Cloud Functions exige plan Blaze con tarjeta, o Neon, que solo provee BD sin Auth/API/Storage).
2. **Esquema en español (`snake_case`, sin tildes ni `ñ`):** todas las tablas, columnas y funciones SQL del esquema `public` se nombran en español (`usuarios`, `grupos`, `integrantes_grupo`, `jornadas`, `codigos_qr`, `asistencias`, `fotos_jornada`, `solicitudes_revision`, `notificaciones`, `tokens_push`).
3. **Seguridad desde el cliente móvil:**
   - La app solo usa `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` (llave pública).
   - **Prohibido** incluir `service_role` en la app o en el repositorio.
   - Todas las tablas de `public` tienen **RLS habilitado** validando `auth.uid()` contra `integrantes_grupo`.
4. **4 funciones de servidor (RPCs SQL):** las operaciones críticas con invariantes de negocio corren atómicamente en PostgreSQL (`gestionar_integrante`, `registrar_asistencia_manual`, `registrar_asistencia_qr`, `obtener_reporte_grupo`).

## Consecuencias
- **Positivas:** SQL nativo para tasas/reportes, cero servidor Node adicional que desplegar, alta trazabilidad académica.
- **Restricciones:** el tier gratuito pausa proyectos tras 7 días sin actividad (sin impacto durante las 4 semanas activas) y permite 2 proyectos activos.
