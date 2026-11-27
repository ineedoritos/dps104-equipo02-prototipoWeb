# T-k4d8-1 · Bandeja de notificaciones (HU16 · SCREEN-18)

- **Spec:** [`04-funciones-media.md#hu16`](../specs/04-funciones-media.md#hu16) · **Pantalla:** [`SCREEN-18`](../screens/SCREEN-18-NOTIFICACIONES.md) · **Tabla:** `notificaciones` ([`database.md` §2.3](../database.md#tablas-media))
- **Issue:** #30 · **Rama:** `feature/30-ui-notificaciones` · Reglas comunes en el [README](README.md).

## Resultado esperado

Una pestaña **Notificaciones** con la bandeja de avisos propios. Cada aviso se marca como leído al abrirlo y lleva a la pantalla relacionada. Los demás módulos tienen una función para generar avisos sin duplicarlos.

## Datos

1. Tipo en `types/dominio.ts` (bloque `// Media · HU16`):
   ```ts
   export type TipoEventoNotificacion = 'asistencia_modificada' | 'horas_actualizadas' | 'solicitud_revision';
   export interface Notificacion {
     id: string; usuario_id: string; jornada_id: string | null;
     tipo_evento: TipoEventoNotificacion; clave_unica: string;
     titulo: string; mensaje: string; leida: boolean; creado_en: string;
   }
   ```
2. `data/notificaciones.json`: de 6 a 8 avisos para los usuarios de prueba, con los tres tipos, leídos y no leídos, y fechas de los últimos días.
3. `lib/notificacionesStore.ts`, que exporta:
   - `obtenerMisNotificaciones(): Notificacion[]`, de la sesión actual y de la más reciente a la más antigua.
   - `contarNoLeidas(): number`.
   - `marcarLeida(id)` y `marcarTodasLeidas()`.
   - `crearNotificacion(datos: Omit<Notificacion, 'id' | 'leida' | 'creado_en'>)`. Si ya existe la `clave_unica`, no crea otra (`HU16 CA04`: los reintentos no duplican).
   - `suscribirNotificaciones(listener)`.
4. Generar avisos donde ya hay acciones (opcional en este PR, obligatorio en los siguientes):
   - `guardarAsistenciasManual` y `ajustarHorasAsistencia` de `gruposStore.ts` → `asistencia_modificada` y `horas_actualizadas` para el participante. Clave sugerida: `${tipo}:${asistencia.id}:${actualizado_en}`.
   - `T-k4d8-2` genera `solicitud_revision` para el responsable.
   - **No** se avisa por cada llegada por QR.

## Pantallas y archivos

| Archivo | Cambio |
|---|---|
| `app/(tabs)/notificaciones.tsx` | **Nuevo.** La bandeja. |
| `app/(tabs)/_layout.tsx` | `<Tabs.Screen name="notificaciones" options={{ title: 'Notificaciones' }} />` entre `historial` y `cuenta`. |
| `components/ui/BarraTabs.tsx` | `notificaciones: 'notificaciones'` en `ICONO_RUTA` y un punto o número de no leídas sobre el icono, en `roseInk` o `ink`, con `accessibilityLabel` del tipo "Notificaciones, 3 sin leer". |
| `components/ui/Icono.tsx` | Nombre `notificaciones` → `Bell` de Lucide. |

### Bandeja (`notificaciones.tsx`)

- Encabezado compartido (el de las pestañas) con el título "Notificaciones" y, a la derecha, "Marcar todas como leídas" si hay alguna sin leer.
- **Banner de permiso:** si el permiso push está desactivado (estado simulado en el módulo), muestra un `Aviso` de tipo `info`: "Las notificaciones push están desactivadas. Igual verás todos tus avisos aquí." con el botón **Activar avisos en el dispositivo**. En desarrollo abre una `HojaAcciones` con "Conceder" y "Denegar". Nunca bloquea la lista.
- **Lista:** `FlatList` de filas (Forma `ListRow`), cada una con:
  - Icono en un círculo de tinte según el tipo: `asistencia_modificada` en `blue` / `blueInk` (icono `hecho`), `horas_actualizadas` en `mint` / `mintInk` (`reloj`) y `solicitud_revision` en `peach` / `peachInk` (`alerta`).
  - Título (`fuentes.fuerte`), mensaje en una línea (`muted`) y fecha relativa ("Hace 5 minutos", "Ayer"), con `lib/fecha.ts` o `dayjs`.
  - Las no leídas con fondo `superficie` y un punto `ink` a la izquierda; las leídas en `papel`. La diferencia nunca va solo por color: el punto y el texto "Sin leer" en `accessibilityLabel`.
- **Al tocar:** `marcarLeida(id)` y navegar según el tipo:
  - `asistencia_modificada` / `horas_actualizadas` → `/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro`.
  - `solicitud_revision` → el detalle de la jornada del responsable (o a la lista de solicitudes que agrega `T-k4d8-2`).
  - Si la jornada ya no existe, un `Aviso` "Esta jornada ya no está disponible."
- **Estados:** `EstadoVacio` con el icono `notificaciones`: "No tienes notificaciones todavía." y una frase de lo que aparecerá aquí. Error con **Reintentar**.

## Fuera de alcance

Push real: FCM, `expo-notifications`, `tokens_push` y la Edge Function son `SETUP-03` (#29). Correo y SMS.

## Terminado cuando

- [ ] La pestaña aparece entre Mi historial y Cuenta, y la TabBar mantiene sus 4 destinos de igual ancho.
- [ ] Solo se ven los avisos de la sesión actual, ordenados por fecha.
- [ ] Marcar uno o todos como leídos actualiza el contador de la pestaña.
- [ ] `crearNotificacion` con una `clave_unica` repetida no duplica.
- [ ] El banner de permiso no bloquea la bandeja.
- [ ] Se actualizaron `SCREEN-18` y la tabla de pantallas de `docs/screens/README.md`.

## Guion E2E sugerido (Android)

1. Iniciar sesión como participante de prueba → la pestaña Notificaciones muestra el contador de no leídas.
2. Abrir una notificación de horas → se marca como leída, baja el contador y se abre Mi registro de esa jornada.
3. "Marcar todas como leídas" → el contador desaparece.
4. Con el permiso simulado como denegado → el banner aparece y la lista sigue visible.
5. Iniciar sesión con un usuario sin avisos → estado vacío.
