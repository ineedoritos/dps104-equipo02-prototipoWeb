# Guía de prueba manual E2E · `app-web` (Human-in-the-loop · Navegador)

Protocolo de validación manual para el portal web de reportería (`Next.js + Tailwind + shadcn/ui + Supabase`), consistente con `../app-movil/docs/adrs/ADR-005-gitflow-issues-y-calidad.md` (sin tests automatizados).

---

## 1. Requisitos previos antes de validar un PR
1. Ejecutar dentro de `app-web/`:
   - `npm run typecheck` (sin errores)
   - `npm run lint` (sin errores)
   - `npm run build` (compilación de producción limpia)
2. Verificar que no exista ninguna referencia a `service_role` ni credenciales privadas en `app-web/` (`RNF03`).
3. Probar en navegador desktop (ej. `1280×800`) y vista estrecha/tablet (`768px` o `390px`) para confirmar que tablas y gráficos no rompan el layout.

---

## 2. Protocolo estándar por cada PR (`RNF04`)
En toda vista modificada verificar siempre estos 4 estados:
1. **Cargando:** activar *Slow 3G* en DevTools y confirmar skeletons sin parpadeos rotos.
2. **Vacío:** seleccionar un período sin registros (o búsqueda sin coincidencias) y confirmar mensaje claro y botones de exportación deshabilitados.
3. **Error con reintento:** activar *Offline* en DevTools → confirmar alerta visible en español (sin stack traces) → restaurar red y pulsar **Reintentar** → confirmar recuperación limpia.
4. **Autorización / Sesión (`RNF03`):** cerrar sesión e intentar abrir una ruta protegida por URL directa → debe redirigir a `/login`.

---

## 3. Flujos maestros de verificación E2E

### Flujo Web 1 · Acceso multi-rol (Responsable y Participante)
1. Iniciar sesión con una cuenta demo que sea **responsable** en Grupo A y **participante** en Grupo B.
2. Confirmar que el selector de contexto muestra ambos grupos con su badge de rol correcto y el acceso a **Mi reporte personal**.
3. En Grupo A (`responsable`), verificar acceso a *Dashboard*, *Reportes* y *Jornadas*.
4. Cambiar a Grupo B (`participante`), confirmar que solo se muestra su reporte personal y que navegar por URL directa a `/reportes` del Grupo B bloquea el acceso (`RNF03`).
5. Cerrar sesión y comprobar redirección a `/login`.

### Flujo Web 2 · Coherencia de estadísticas y fórmula `RF15`
1. Como responsable en un grupo con asistencias, abrir `/dashboard` y `/reportes` en el mismo período (*Este mes* y *Todo*).
2. Comparar los totales de la barra apilada con la fila de totales de la tabla: **Presentes**, **Justificadas** y **Ausentes sin motivo** deben coincidir exactamente.
3. Verificar un integrante con `presentes + ausencias = 0`: debe mostrar `—` (nunca `NaN`).
4. Verificar que una jornada marcada como `cancelada = true` no sume en los totales y aparezca etiquetada en `/jornadas`.
5. Abrir el detalle de un integrante con ausencia justificada y ajuste de horas: confirmar que se muestran `motivo_ausencia` y `motivo_ajuste`.

### Flujo Web 3 · Mi reporte personal (`RF14`)
1. Iniciar sesión como participante (incluyendo historial de un ex-grupo si aplica).
2. Abrir `/mi-reporte`, filtrar por grupo y período.
3. Comprobar que separa **duración registrada**, **tiempo reconocido** y **tiempo pendiente** (cuando aplica control de horas), y que muestra `motivo_ajuste` destacado.
4. Comprobar en DevTools Network que Supabase nunca devuelve filas de otros participantes (`RNF03`).

### Flujo Web 4 · Exportación 100% Client-Side (PDF y Excel)
1. En `/reportes` (responsable) y en `/mi-reporte` (participante), abrir DevTools → pestaña **Network**.
2. Pulsar **Exportar PDF**: confirmar que se descarga el `.pdf` **sin ninguna petición de red a backend externo**, que incluye encabezado, período, tabla legible, totales, fecha en `America/El_Salvador` y nota de horas internas.
3. Pulsar **Exportar Excel (.xlsx)**: confirmar descarga sin red externa; abrir el archivo en Excel / LibreOffice / Google Sheets y verificar hojas separadas, estilos aplicados, acentos UTF-8 intactos y números como valores numéricos reales.
