# T-k4d8-2 · Solicitar revisión de un registro (HU13)

- **Spec:** [`04-funciones-media.md#hu13`](../specs/04-funciones-media.md#hu13) · **Pantallas:** [`SCREEN-17`](../screens/SCREEN-17-DETALLE-REGISTRO.md) (participante) y [`SCREEN-08`](../screens/SCREEN-08-DETALLE-JORNADA.md) (responsable) · **Tabla:** `solicitudes_revision` ([`database.md` §2.2](../database.md#tablas-media))
- **Issue:** #31 · **Rama:** `feature/31-ui-solicitar-revision` · Reglas comunes en el [README](README.md).

## Resultado esperado

El participante reclama un registro (o la falta de uno) con un motivo, y ve en qué estado está su reclamo. El responsable ve los reclamos pendientes de cada jornada, los resuelve o rechaza con un motivo, y desde ahí corrige la asistencia o las horas.

## Datos

1. Tipos en `types/dominio.ts` (bloque `// Media · HU13`):
   ```ts
   export type EstadoSolicitud = 'pendiente' | 'resuelta' | 'rechazada';
   export interface SolicitudRevision {
     id: string; jornada_id: string; participante_id: string;
     motivo_solicitud: string; estado: EstadoSolicitud;
     motivo_resolucion: string | null; resuelta_por: string | null;
     creado_en: string; resuelta_en: string | null;
   }
   ```
2. `data/solicitudesRevision.json`: de 3 a 4 solicitudes de prueba, con al menos una pendiente, una resuelta y una rechazada, en jornadas no canceladas.
3. `lib/revisionesStore.ts`, que exporta:
   - `obtenerMiSolicitud(jornadaId)`: la más reciente del participante actual en esa jornada.
   - `crearSolicitudRevision(jornadaId, motivo)`.
     - Valida que el participante esté activo, que la jornada no esté cancelada y que el motivo no esté vacío.
     - Si ya hay una `pendiente` para (`jornada_id`, `participante_id`), lanza `ErrorDominio` con un código nuevo `ERR_SOLICITUD_PENDIENTE` y el mensaje "Ya tienes una solicitud pendiente para esta jornada." Agrega ese código a `CodigoErrorDominio` y a la lista de errores de `database.md` §5.
     - **No** modifica asistencias ni horas (`HU13 CA02`).
     - Si existe `crearNotificacion` (`T-k4d8-1`), avisa al responsable con `tipo_evento: 'solicitud_revision'`.
   - `obtenerSolicitudesDeJornada(jornadaId)` y `contarPendientes(jornadaId)`.
   - `resolverSolicitud(id, estado: 'resuelta' | 'rechazada', motivo)`: exige un responsable activo del grupo y un motivo no vacío, y guarda `resuelta_por` y `resuelta_en`.
   - `suscribirRevisiones(listener)`.

## Pantallas y archivos

### Participante: `jornadas/[jornadaId]/mi-registro.tsx` (SCREEN-17)

- Nueva `Seccion` "Revisión", visible aunque el participante no tenga registro, si la jornada no está cancelada.
- **Sin solicitud:** texto corto ("¿Algo no está bien en tu registro?") y `Boton` secundario **Solicitar revisión**.
- **Al tocar:** hoja o `Modal` con un `CampoTexto` multilínea "Motivo" (obligatorio, de 10 a 500 caracteres) y los botones **Enviar solicitud** y **Cancelar**. El error se muestra debajo del campo ("Escribe qué hay que revisar.").
- **Con solicitud:** tarjeta con `Estado` (`pendiente` en `peach`, `resuelta` en `mint`, `rechazada` en `rose`; usa o extiende los tonos de `components/ui/Estado.tsx`), el motivo enviado, la fecha y, si está resuelta o rechazada, el `motivo_resolucion`. Con una pendiente no se muestra el botón; con una resuelta o rechazada se puede enviar otra.

### Responsable: detalle de la jornada (SCREEN-08)

- En `jornadas/[jornadaId]/index.tsx`, una fila **Solicitudes de revisión** con contador de pendientes (`Estado` en `peach`) que abre la lista. Si no hay ninguna, la fila no aparece.
- **Lista:** pantalla nueva `jornadas/[jornadaId]/revisiones.tsx` con el `Encabezado` compartido. Cada tarjeta muestra participante, motivo, fecha y estado.
- **Resolver:** en una pendiente, **Resolver** o **Rechazar** abre una hoja con `motivo_resolucion` obligatorio. Al confirmar, la tarjeta cambia de estado. En las resueltas o rechazadas no hay acciones.
- **Corregir:** acceso directo a **Corregir asistencia** (`asistencia.tsx`) y, con control de horas, a **Ajustar horas** (`ajustar-horas.tsx`) de ese participante.

## Fuera de alcance

Adjuntos, chat o varias rondas de mensajes. Bandeja global de reclamos fuera de la jornada.

## Terminado cuando

- [ ] El participante crea una solicitud con motivo; si ya tiene una pendiente en esa jornada, el botón no aparece y el store rechaza otra.
- [ ] Crear una solicitud no cambia la asistencia ni las horas.
- [ ] El responsable ve las pendientes en el detalle de la jornada y las resuelve o rechaza con motivo.
- [ ] El participante ve el estado y el `motivo_resolucion`.
- [ ] En jornadas canceladas no se puede solicitar.
- [ ] Se actualizaron `SCREEN-17` y `SCREEN-08` (y, si se crea `revisiones.tsx`, la tabla de `docs/screens/README.md`).

## Guion E2E sugerido (Android)

1. Como participante, abrir Mi registro de una jornada finalizada → **Solicitar revisión** → enviar sin motivo (error) → con motivo (queda pendiente).
2. Intentar otra solicitud en la misma jornada → no hay botón.
3. Como responsable, abrir esa jornada → "Solicitudes de revisión 1" → **Resolver** con motivo.
4. Volver como participante → estado "Resuelta" con el motivo del responsable.
5. En una jornada cancelada → no aparece el botón.
