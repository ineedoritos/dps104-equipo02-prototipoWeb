# ADR-WEB-002 · Integración Supabase Client-Only (sin backend propio) y RLS compartida

- **Estado:** Aprobado
- **Fecha:** 2026-11-25

## Contexto
`app-web` se conecta al mismo proyecto Supabase Cloud definido para `app-movil` (`../app-movil/docs/adrs/ADR-002-supabase-rls-y-rpcs.md` y `../app-movil/docs/database.md`). No se construirá ningún backend propio ni microservicio intermedio.

## Decisión
1. **Cero backend propio:** prohibido crear endpoints en `/api/*` o Server Actions que usen `service_role` o reimplementen reglas de negocio.
2. **Solo `anon key`:** `app-web` únicamente lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, usando `@supabase/supabase-js` y `@supabase/ssr` para persistencia segura de sesión.
3. **Autorización delegada 100% a RLS y RPCs de PostgreSQL (`RNF03`):**
   - Cualquier usuario autenticado puede iniciar sesión en `app-web`.
   - Si es `responsable` en un grupo, Supabase autoriza la ejecución de `obtener_reporte_grupo` y la lectura de `jornadas`, `asistencias`, `integrantes_grupo` y tablas Media de ese grupo.
   - Si es `participante`, RLS limita estrictamente las consultas a `participante_id = auth.uid()` y a sus propios grupos/ex-grupos con historial (`RF14`).
4. **Solo lectura:** `app-web` no invoca RPCs de mutación (`gestionar_integrante`, `registrar_asistencia_manual`, `registrar_asistencia_qr`) ni hace `INSERT`/`UPDATE`/`DELETE` sobre datos operativos.

## Consecuencias
- **Positivas:** cero costos extra de infraestructura, coherencia total entre móvil y web, y seguridad garantizada aunque alguien inspeccione el bundle del navegador.
- **Dependencias:** las issues de integración real en `app-web` dependen directamente de `#10` (`SETUP-02`) y `#24` (`HU15`) de `app-movil`.
