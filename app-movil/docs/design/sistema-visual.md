# Sistema visual y directrices de diseño (`app-movil`)

Documento rector de estética, tokens y reglas de interfaz para **Registro de actividades** (Expo + React Native `StyleSheet` nativo). Su implementación vive en [`lib/tema.ts`](../../lib/tema.ts) y sus primitivos en [`components/ui/`](../../components/ui/).

> **Propósito central:** evitar la estética genérica de interfaces generadas por IA (*"AI slop"*) —gradientes neón, tarjetas flotantes con sombras pesadas, jerarquías saturadas de colores e iconografía decorativa— y construir una herramienta **táctil, editorial y utilitaria** pensada para uso real en campo (voluntariado, servicio social y deporte en Android).

---

## 1. Principios de diseño (anti-"AI-like")

1. **Superficies de papel cálido y bordes de 1 px (cero gradientes):**
   - El fondo base es papel cálido (`colores.papel`: `#F7F4EE`) y las tarjetas usan blanco limpio (`colores.superficie`: `#FFFFFF`) delimitadas por bordes finos de `1 px` (`colores.borde`: `#E6E1D7` / `colores.bordeFuerte`: `#CFC8B8`).
   - **Prohibido** usar gradientes lineales/radiales, efectos *glassmorphism* o brillos de fondo.
   - **Sombras solo cuando flotan:** `sombras.flotante` se reserva exclusivamente para el botón flotante principal y el panel/modal de código QR. Las tarjetas en flujo normal no llevan sombra.

2. **Un solo acento semántico (`#0B6B58`):**
   - `colores.acento` (`#0B6B58`) representa presencia activa y acción principal.
   - Nunca compite con un segundo color de marca. Los demás tonos (`ausente`, `justificada`, `programada`) son **estrictamente semánticos** para estados de asistencia o jornada y solo aparecen en etiquetas o avisos puntuales.

3. **Jerarquía por tamaño, peso y aire — no por más colores:**
   - Escala tipográfica cerrada de **6 pasos** (`micro: 11`, `cuerpoSm: 13`, `cuerpo: 15`, `tituloSm: 17`, `titulo: 20`, `display: 28`).
   - Techo de peso tipográfico en `pesos.fuerte` (`600`). **Prohibido** usar `700`/`800`/`900` o encabezados sobredimensionados estilo *landing page*.

4. **Cifras tabulares obligatorias (`cifrasTabulares`):**
   - Toda cifra numérica —horas reconocidas, duraciones, tasas de asistencia, contadores y fechas numéricas— debe aplicar `cifrasTabulares` (`fontVariant: ['tabular-nums']`) para mantener alineación vertical sin saltos visuales.

5. **Densidad utilitaria sin relleno decorativo:**
   - Espaciado estricto en **base 4** (`4, 8, 12, 16, 24, 32, 48`), sin valores intermedios arbitrarios.
   - **Prohibido** usar tarjetas *hero* de marketing, grillas de 3 columnas con íconos decorativos, emojis en controles/títulos o texto de relleno.
   - Cada fila o tarjeta muestra como máximo **3 niveles de lectura** (título, metadato breve, estado/cifra).

6. **Movimiento sobrio y respetuoso:**
   - Sin *parallax*, rebotes elásticos ni animaciones continuas de adorno.
   - Las transiciones puntuales se mantienen breves (`<= 320 ms`, alineado con la mediana observada en referencias móviles editoriales; ver [`DESIGN.md`](./DESIGN.md)) y la retroalimentación táctil inmediata usa cambio sutil de opacidad/estado en `Pressable`.
   - Respetar la preferencia del sistema de reducir animaciones y garantizar todos los estados de pantalla (`RNF04`: `cargando`, `vacío`, `error visible con reintento`, permisos denegados).

7. **Copy humano en español claro:**
   - Todo texto visible debe orientarse a la tarea de la persona, sin claves internas (`HUxx`, `SCREEN-xx`, `RNFxx`), nombres de tablas ni jerga de sistema.

---

## 2. Tokens oficiales (`lib/tema.ts`)

Ningún componente o pantalla debe definir colores, radios, espaciados o tamaños de fuente fuera de `lib/tema.ts`.

### 2.1 Paleta de color

| Grupo | Token | Valor | Uso |
|---|---|---|---|
| Superficies | `papel` | `#F7F4EE` | Fondo base de pantallas |
| Superficies | `superficie` | `#FFFFFF` | Tarjetas, modales, barra de pestañas |
| Superficies | `superficieAlt` | `#FBF9F4` | Superficies secundarias / campos en reposo |
| Texto | `tinta` | `#1C1B1F` | Títulos y texto principal |
| Texto | `tintaSuave` | `#5B5862` | Subtítulos, metadatos, etiquetas |
| Texto | `tintaTenue` | `#8B8794` | Placeholders, iconos inactivos |
| Líneas | `borde` | `#E6E1D7` | Bordes de tarjetas y divisores |
| Líneas | `bordeFuerte` | `#CFC8B8` | Bordes de inputs y botones secundarios |
| Acento | `acento` | `#0B6B58` | Acción primaria, tab activa, presencia |
| Acento | `acentoSuave` | `#E3F1ED` | Fondo de badge/aviso positivo |
| Acento | `acentoBorde` | `#BCD9D1` | Borde de superficie resaltada |
| Velo | `velo` | `rgba(28, 27, 31, 0.45)` | Backdrop de modales (nunca gris azulado) |
| Estados | `ausente` / `ausenteSuave` | `#A82A20` / `#FBEAE7` | Ausencia, cancelación, error o acción destructiva |
| Estados | `justificada` / `justificadaSuave` | `#8A4E0C` / `#F6EEDF` | Ausencia justificada o advertencia |
| Estados | `programada` / `programadaSuave` | `#2F5D8A` / `#E8F0F7` | Jornada programada o aviso informativo |
| Estados | `completada` / `completadaSuave` | `#5B5862` / `#F1EEE8` | Jornada finalizada |
| Estados | `sinRegistro` / `sinRegistroSuave` | `#6B6772` / `#EFEEF1` | Participante sin marca registrada |

### 2.2 Escala tipográfica y pesos

| Token | Tamaño (`px`) | Interlineado (`px`) | Uso recomendado |
|---|---|---|---|
| `micro` | `11` | `16` | Etiquetas de pestaña, micro-metadatos, badges |
| `cuerpoSm` | `13` | `19` | Texto secundario, descripciones de apoyo |
| `cuerpo` | `15` | `22` | Texto principal, valores de inputs |
| `tituloSm` | `17` | `24` | Títulos de sección y encabezado de pantalla |
| `titulo` | `20` | `26` | Títulos principales de vista o modal |
| `display` | `28` | `34` | Cifras resumen o encabezados de portada |

Pesos permitidos: `normal` (`400`), `medio` (`500`), `fuerte` (`600`).

### 2.3 Espaciado y radios

- **Espaciados (base 4):** `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`, `xxxl: 48`.
- **Radios por tipo de superficie:** `sm: 8` (badges/elementos internos), `campo: 12` (inputs y botones), `tarjeta: 16` (contenedores y modales), `pill: 999` (chips y píldoras).

---

## 3. Catálogo de primitivos UI (`components/ui/`)

Toda pantalla nueva o refactorizada debe componer estos primitivos antes de crear estilos propios:

| Componente | Responsabilidad | Regla clave |
|---|---|---|
| `Boton` | Acción táctil (`primario`, `secundario`, `fantasma`, `peligro`) | Usa `acento` solo en `primario`; incluye estado `cargando` y `deshabilitado`. |
| `CampoTexto` | Entrada de texto con etiqueta y error | Borde de `1 px`, radio `radios.campo`, error visible debajo. |
| `DatePickerField` | Selector de fecha nativo Android/iOS | Formatea en `America/El_Salvador` (`ADR-006`). |
| `Seccion` | Encabezado de bloque con título, detalle y acción opcional | Separa bloques con `espaciados.md`. |
| `Estado` | Píldora semántica de jornada o asistencia | Mapeo único vía `ESTADO_JORNADA` y `ESTADO_ASISTENCIA`. |
| `Aviso` | Banner contextual (informativo, advertencia o error) | Sin sombras; borde sutil y texto accionable. |
| `EstadoVacio` | Vista vacía con ícono, explicación breve y acción | Obligatorio en listas vacías (`RNF04`). |
| `Icono` | Ícono de línea único vía `expo-symbols` | Decorativo por defecto (`accessible={false}`); el texto o `accessibilityLabel` da el significado. |

---

## 4. Referencia de diseño basada en evidencia

Las decisiones de superficie cálida, contraste sobrio, cifras tabulares y contención de movimiento están respaldadas por el estudio de referencia en [`DESIGN.md`](./DESIGN.md) y su evidencia estructurada en [`design-evidence.json`](./design-evidence.json), obtenidos mediante inspección en viewport móvil (`390×844`) con `awwwards-mcp`.
