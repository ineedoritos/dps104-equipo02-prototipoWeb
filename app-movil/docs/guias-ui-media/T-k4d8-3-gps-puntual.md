# T-k4d8-3 · GPS puntual: referencia en la jornada y aviso al escanear (HU11)

- **Spec:** [`04-funciones-media.md#hu11`](../specs/04-funciones-media.md#hu11) · **Pantallas:** [`SCREEN-05`](../screens/SCREEN-05-CONFIGURACION.md), [`SCREEN-07`](../screens/SCREEN-07-CREAR-JORNADA.md), [`SCREEN-14`](../screens/SCREEN-14-ESCANEAR-QR.md) · **Columnas:** `jornadas.ref_latitud`, `ref_longitud`, `ref_ubicacion_en` ([`database.md` §1.4](../database.md#tablas-alta)) y [`registrar_asistencia_qr`](../database.md#rpc-registrar-asistencia-qr) (§4.3)
- **Issue:** #25 · **Rama:** `feature/25-ui-gps-puntual` · Reglas comunes en el [README](README.md).

## Resultado esperado

Con GPS activado en el grupo (solo modalidad QR), el responsable fija una ubicación de referencia al crear la jornada. Al escanear, el participante comparte su ubicación puntual y solo se confirma el registro si está a 100 m o menos con una precisión de 50 m o mejor. **Sin mapas** ni ubicación continua (`HU11 CA04`).

## Datos

1. En `types/dominio.ts`, `Jornada` suma `ref_latitud: number | null`, `ref_longitud: number | null` y `ref_ubicacion_en: string | null`. Actualiza `data/jornadas.json`: al menos una jornada QR con GPS y su referencia (por ejemplo, un punto de San Salvador) y las demás en `null`.
2. En `lib/gruposStore.ts` (esta tarea sí lo toca):
   - `crearJornada` y `editarJornada` aceptan y guardan la referencia. Con `gps_habilitado = true` sin referencia, lanzan `ErrorDominio` "Captura la ubicación de la jornada antes de guardar."
   - `registrarAsistenciaQR` recibe `ubicacion?: { latitud, longitud, precision_metros }` y, si la jornada tiene GPS, valida como el RPC:
     - Precisión mayor a 50 → `ERR_GPS_SIN_PRECISION`.
     - Distancia Haversine mayor a 100 m → `ERR_GPS_FUERA_DE_RADIO`.
     - Ambos códigos ya existen en `database.md` §5; agrégalos a `CodigoErrorDominio` si faltan. La distancia se calcula en una función pura `distanciaMetros(a, b)` en `lib/`.
3. **Ubicación simulada** en `lib/ubicacionSimulada.ts`: `obtenerUbicacionActual(): Promise<{ latitud, longitud, precision_metros } | 'sin_permiso'>`. En desarrollo, una `HojaAcciones` deja elegir el caso: "Dentro del radio", "Fuera del radio (350 m)", "Poca precisión (120 m)" y "Sin permiso". No instales `expo-location` sin una `DUDA` aprobada.

## Pantallas y archivos

| Archivo | Cambio |
|---|---|
| `app/grupos/[grupoId]/configuracion.tsx` | El interruptor **Comprobar cercanía por GPS** se habilita con modalidad QR (con manual sigue deshabilitado, con su explicación). Sale de "Funciones opcionales · Próximamente" y la fila entera es tocable con `accessibilityRole="switch"`. |
| `app/grupos/[grupoId]/jornadas/crear.tsx` | Si la jornada tiene GPS, bloque **Ubicación de la jornada** dentro de la tarjeta del formulario: botón **Capturar ubicación actual** → muestra "Ubicación fijada · precisión 12 m · 10:42" y **Volver a capturar**. Sin coordenadas en crudo ni mapa. Con permiso denegado, `Aviso` con **Reintentar**. |
| `app/grupos/[grupoId]/jornadas/[jornadaId]/escanear-qr.tsx` | Con GPS, después de leer el código: paso "Comprobando tu ubicación…" y luego confirmar, o el error. |
| `app/grupos/[grupoId]/jornadas/[jornadaId]/index.tsx` | En el detalle, una línea "Ubicación de referencia fijada" o un `Aviso` si falta. |

### Mensajes de error al escanear (tuteo)

| Código | Título | Texto |
|---|---|---|
| `ERR_GPS_FUERA_DE_RADIO` | Estás lejos del lugar de la jornada. | Acércate al punto de encuentro e intenta de nuevo. |
| `ERR_GPS_SIN_PRECISION` | No pudimos ubicarte con precisión. | Sal a un lugar abierto y vuelve a intentar. |
| sin permiso | Necesitamos tu ubicación para registrar tu asistencia. | Actívala en los ajustes del teléfono. |

Cada uno con **Reintentar** y la nota "Si no puedes, pide al responsable que registre tu asistencia." (`HU11 CA03`, `HU07 CA05`).

## Fuera de alcance

Mapas, rastreo continuo y geocercas. Validación en servidor.

## Terminado cuando

- [ ] El GPS solo se activa con modalidad QR.
- [ ] No se puede guardar una jornada con GPS sin referencia.
- [ ] Al escanear con GPS, los cuatro casos simulados muestran el resultado correcto y solo "dentro del radio" registra.
- [ ] `distanciaMetros` está separada y su resultado es correcto para dos puntos conocidos (anota el caso en el PR).
- [ ] Se actualizaron `SCREEN-05`, `SCREEN-07` y `SCREEN-14`.

## Guion E2E sugerido (Android)

1. Configuración de un grupo QR → activar GPS → guardar.
2. Nueva jornada → intentar guardar sin ubicación (error) → **Capturar ubicación actual** → guardar.
3. Como participante, escanear el QR de esa jornada → elegir "Fuera del radio" → error con **Reintentar** → elegir "Dentro del radio" → queda registrado.
4. Repetir con "Poca precisión" y "Sin permiso".
