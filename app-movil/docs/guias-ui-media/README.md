# Guías de implementación · Interfaz de prioridad Media (móvil)

Cómo construir la **interfaz** de las historias de prioridad Media (`HU10`–`HU13`, `HU16`) en `app-movil`, con datos de prueba y **sin Supabase**. Cada guía corresponde a un hilo `DELEGO` de la [Discussion #60](https://github.com/ineedoritos/dps104-equipo02-prototipoWeb/discussions/60).

| Tarea | Historia | Guía | Issue | Rama |
|---|---|---|---|---|
| `T-k4d8-1` | HU16 Notificaciones | [T-k4d8-1-notificaciones.md](T-k4d8-1-notificaciones.md) | #30 | `feature/30-ui-notificaciones` |
| `T-k4d8-2` | HU13 Solicitar revisión | [T-k4d8-2-solicitar-revision.md](T-k4d8-2-solicitar-revision.md) | #31 | `feature/31-ui-solicitar-revision` |
| `T-k4d8-3` | HU11 GPS puntual | [T-k4d8-3-gps-puntual.md](T-k4d8-3-gps-puntual.md) | #25 | `feature/25-ui-gps-puntual` |
| `T-k4d8-4` | HU10 Fotos de evidencia | [T-k4d8-4-fotos-jornada.md](T-k4d8-4-fotos-jornada.md) | #26 | `feature/26-ui-fotos-jornada` |
| `T-k4d8-5` | HU12 Validación previa | [T-k4d8-5-validacion.md](T-k4d8-5-validacion.md) | #28 | `feature/28-ui-validacion` |

**Orden:** `T-k4d8-1` primero, porque crea `crearNotificacion()`, que usan `T-k4d8-2` y `T-k4d8-5`. Las demás pueden ir en paralelo.

## Fuentes que manda cada guía

1. Criterios de aceptación: [`docs/specs/04-funciones-media.md`](../specs/04-funciones-media.md).
2. Pantallas: [`docs/screens/`](../screens/) (cada guía indica cuáles).
3. Tablas y columnas: [`docs/database.md`](../database.md) §1.6 y §2.
4. Sistema de diseño: [`DESIGN.md`](../../../DESIGN.md) (Forma) y `lib/tema.ts`.

Si una guía contradice la spec, **manda la spec**: avisa con `DUDA` en el hilo.

## Reglas comunes

### Datos de prueba, sin servidor
- Nada de Supabase, RPC, Edge Functions ni SQL. Todo vive en memoria, con datos iniciales en `data/*.json`.
- Usa los nombres de tablas y columnas de `database.md`, en español y `snake_case`. Así la migración a Supabase cambia el origen de datos, no la pantalla.
- **Tablas nuevas en su propio módulo**, para que las tareas no choquen en `lib/gruposStore.ts`:

  | Tabla | Módulo | Datos iniciales | Tarea |
  |---|---|---|---|
  | `notificaciones` | `lib/notificacionesStore.ts` | `data/notificaciones.json` | `T-k4d8-1` |
  | `solicitudes_revision` | `lib/revisionesStore.ts` | `data/solicitudesRevision.json` | `T-k4d8-2` |
  | `fotos_jornada` | `lib/fotosStore.ts` | `data/fotosJornada.json` | `T-k4d8-4` |

  Cada módulo sigue el patrón de `gruposStore.ts`: estado en `let`, `suscribirX(listener)` que devuelve la función para desuscribirse, y un `notificar()` interno. La sesión se lee con `obtenerSesionActual()`. Los tipos van en `types/dominio.ts`, cada tarea en un bloque propio al final con el comentario `// Media · <HU>`.
- Solo `T-k4d8-3` (columnas de `jornadas`) y `T-k4d8-5` (columnas de `asistencias`) tocan `lib/gruposStore.ts`.
- Las pantallas se suscriben como hoy: `useFocusEffect` + `recargar` + `suscribirX`.

### Hardware simulado
- No instales dependencias nativas (`expo-location`, `expo-notifications`, `expo-image-picker`, `expo-camera`...) sin preguntar antes con `DUDA` en el hilo y tener el sí de la persona.
- La cámara, el GPS y el permiso de notificaciones se **simulan**. En desarrollo, ofrece los resultados posibles (éxito, permiso denegado, error) dentro de una `HojaAcciones`, nunca con chips visibles en la pantalla. Fuera de `__DEV__`, se usa el caso de éxito.

### Interfaz (Forma)
- Componentes: `Encabezado`, `Boton`, `CampoTexto`, `Aviso`, `EstadoVacio`, `Estado`, `HojaAcciones`, `SelectorTarjeta`, `SelectorSegmentado`, `Seccion`, `Icono`. Tabla completa en [`DESIGN.md`](../../../DESIGN.md#cómo-se-aplica-en-el-código).
- Tipografía con `fontFamily: fuentes.*`, nunca `fontWeight`. Colores solo de `lib/tema.ts`. Sin bordes decorativos ni sombras. Presionado con escala 0.98.
- Áreas táctiles de 44 dp o más; si el dibujo es menor, `hitSlop`.
- Iconos nuevos: agrégalos a `components/ui/Icono.tsx` desde `lucide-react-native`.
- Estados obligatorios (`RNF04`): cargando, vacío, error con reintento y permiso denegado.
- Copy en tuteo, como el resto de la app (ver *Desvíos conocidos* en `DESIGN.md`). Sin claves internas (`HUxx`, `SCREEN-xx`), sin "mock" ni "próximamente" en lo que ya funciona.
- Accesibilidad: `accessibilityRole`, `accessibilityLabel` en botones de solo icono y `accessibilityState` (`checked`, `disabled`, `selected`).

### Entrega
- Actualiza los `docs/screens/SCREEN-XX.md` que cambien, en el mismo PR.
- `npm run typecheck` y `npm run lint` sin errores en `app-movil`.
- PR hacia `main` desde la rama de la tabla, con la plantilla del repo y guion E2E en Android. La sección de prueba humana queda vacía.
- `ENTREGA` en el hilo de la tarea con rama, SHA, PR, qué verificaste y qué no.
