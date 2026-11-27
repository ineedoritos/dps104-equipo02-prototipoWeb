# T-k4d8-4 · Fotos de evidencia en la jornada (HU10)

- **Spec:** [`04-funciones-media.md#hu10`](../specs/04-funciones-media.md#hu10) · **Pantallas:** [`SCREEN-08`](../screens/SCREEN-08-DETALLE-JORNADA.md) (responsable) y [`SCREEN-17`](../screens/SCREEN-17-DETALLE-REGISTRO.md) (participante) · **Tabla:** `fotos_jornada` ([`database.md` §2.1](../database.md#tablas-media))
- **Issue:** #26 · **Rama:** `feature/26-ui-fotos-jornada` · Reglas comunes en el [README](README.md).
- **Base:** `modo_fotos` ya existe en grupos y jornadas, y se elige en Configuración (PR #66).

## Resultado esperado

Si la jornada permite fotos (`opcionales` u `obligatorias`), los integrantes agregan fotos de evidencia y todos ven la galería con autor y fecha. El responsable puede retirar una foto sin afectar asistencias. Con `obligatorias`, el participante ve que le falta la foto.

## Datos

1. Tipo en `types/dominio.ts` (bloque `// Media · HU10`):
   ```ts
   export interface FotoJornada {
     id: string; jornada_id: string; autor_id: string; ruta_storage: string;
     retirada_en: string | null; retirada_por: string | null; creado_en: string;
   }
   ```
2. **Imágenes de prueba** en `assets/images/evidencias/` (de 3 a 4 JPG livianos, menos de 150 KB cada uno, sin personas reconocibles ni datos personales). `ruta_storage` guarda una clave como `evidencias/foto-1.jpg`, que un mapa en `lib/fotosStore.ts` traduce a `require(...)`. Así se reemplaza fácil por la URL de Storage.
3. `data/fotosJornada.json`: fotos en 2 jornadas, una retirada.
4. `lib/fotosStore.ts`, que exporta:
   - `obtenerFotosDeJornada(jornadaId)`: sin las retiradas, más recientes primero.
   - `agregarFotoSimulada(jornadaId)`.
     - Valida integrante activo, jornada no cancelada y ya iniciada (`derivarEstadoJornada` distinto de `programada`) y `modo_fotos` distinto de `no_permitidas`.
     - Toma una imagen de prueba al azar.
     - Lanza `ErrorDominio` con mensajes claros si no se cumple algo.
   - `retirarFoto(id)`: solo responsable activo. Marca `retirada_en` y `retirada_por` y no toca asistencias (`HU10 CA04`).
   - `tengoFotoEnJornada(jornadaId): boolean`, para `obligatorias`.
   - `suscribirFotos(listener)`.
5. **Cámara simulada:** en desarrollo, **Agregar foto** abre una `HojaAcciones` con "Tomar foto", "Permiso denegado" y "Error al subir". No instales `expo-image-picker` ni `expo-camera` sin una `DUDA` aprobada.

## Pantallas y archivos

### Componente nuevo `components/ui/GaleriaFotos.tsx`

- Cuadrícula de 3 columnas con miniaturas cuadradas (`radios.md`) y un espacio `espaciados.xs` entre ellas.
- Debajo de cada una, autor en `micro` y fecha corta.
- Al tocar, vista ampliada en un `Modal` con autor, fecha y, si quien mira es responsable, **Retirar foto** (variante peligro, con confirmación: "La foto deja de verse para el grupo. Las asistencias no cambian.").
- Primera celda: **Agregar foto** (icono `camara`), si se permite.
- Vacío: "Todavía no hay fotos de esta jornada."

### Detalle de jornada (SCREEN-08) y Mi registro (SCREEN-17)

- `Seccion` "Fotos de la jornada", solo si `jornada.modo_fotos !== 'no_permitidas'`.
- Con `obligatorias`, en Mi registro: `Aviso` de tipo `info` "Esta jornada pide al menos una foto para completar tu asistencia." hasta que el participante tenga una.
- **Permiso denegado:** `Aviso` de error con **Reintentar** y **Abrir ajustes** (simulado). Con `opcionales`, no bloquea nada más.
- **Error al subir:** `Aviso` de error con **Reintentar**.
- Jornada programada o cancelada: sin botón de agregar, con el motivo en una línea.

## Fuera de alcance

Subida real a Supabase Storage, compresión y recorte. Fotos fuera de una jornada.

## Terminado cuando

- [ ] Con `no_permitidas`, la sección no aparece.
- [ ] Con `opcionales` u `obligatorias`, se agregan fotos en jornadas iniciadas y no canceladas, con autor y fecha.
- [ ] El responsable retira una foto y deja de verse; las asistencias no cambian.
- [ ] Con `obligatorias`, el aviso aparece hasta que el participante tiene foto.
- [ ] Permiso denegado y error al subir tienen mensaje y reintento.
- [ ] Imágenes de prueba livianas y sin datos personales.
- [ ] Se actualizaron `SCREEN-08` y `SCREEN-17`.

## Guion E2E sugerido (Android)

1. Configuración → modo de fotos "Opcionales" → jornada en curso → **Agregar foto** → aparece con tu nombre y hora.
2. Elegir "Permiso denegado" → aviso con reintento; la asistencia sigue disponible.
3. Como responsable, abrir la foto → **Retirar foto** → confirmar → desaparece.
4. Cambiar a "Obligatorias" → como participante sin foto, Mi registro muestra el aviso → agregar una → el aviso desaparece.
5. Con "No se usan" → la sección no aparece.
