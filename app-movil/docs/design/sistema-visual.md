# Sistema visual y directrices de diseño (`app-movil`)

Documento rector de estética, tokens y reglas de interfaz para **Registro de actividades** (Expo + React Native `StyleSheet` nativo). Su implementación vive en [`lib/tema.ts`](../../lib/tema.ts) y sus primitivos en [`components/ui/`](../../components/ui/).

> **Propósito central:** evitar la estética genérica de interfaces generadas por IA (*"AI slop"*) —gradientes neón, tarjetas flotantes con sombras pesadas, jerarquías saturadas de colores e iconografía decorativa— y construir una herramienta **táctil, editorial y utilitaria** pensada para uso real en campo (voluntariado, servicio social y deporte en Android).

---

## 1. Principios de diseño (anti-"AI-like")

1. **Fondo blanco, superficies grises y divisores finos:**
   - Las pantallas y los encabezados son blancos. El gris claro agrupa resúmenes y distingue campos en reposo. Las listas usan divisores finos y los campos interactivos tienen un borde de mayor contraste.
   - **Prohibido** usar gradientes lineales/radiales, efectos *glassmorphism* o brillos de fondo.
   - **Sombras solo cuando flotan:** `sombras.flotante` se reserva exclusivamente para el botón flotante principal y el panel/modal de código QR. Las tarjetas en flujo normal no llevan sombra.

2. **Acciones negras y color semántico:**
   - La acción principal usa fondo negro y texto blanco. Las acciones secundarias y las selecciones de navegación usan tonos neutros.
   - El verde identifica presencia o una jornada en curso. Violeta, ámbar, rojo y azul apagado indican programación, justificación, ausencia/error o información. Los indicadores y las leyendas de gráfico incluyen texto.

3. **Jerarquía por tamaño, peso y aire — no por más colores:**
   - Escala tipográfica cerrada de **6 pasos** (`micro: 11`, `cuerpoSm: 13`, `cuerpo: 15`, `tituloSm: 17`, `titulo: 20`, `display: 28`).
   - Usa peso 700 en títulos y cifras principales. Etiquetas, filas y acciones mantienen los pesos 400, 500 o 600.

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
| Superficies | `papel` | `#FFFFFF` | Fondo base de pantallas |
| Superficies | `superficie` | `#FFFFFF` | Tarjetas, modales, barra de pestañas |
| Superficies | `superficieAlt` | `#F5F5F5` | Superficies secundarias / campos en reposo |
| Texto | `tinta` | `#181818` | Títulos y texto principal |
| Texto | `tintaSuave` | `#525252` | Subtítulos, metadatos, etiquetas |
| Texto | `tintaTenue` | `#666666` | Placeholders, iconos inactivos |
| Líneas | `borde` | `#E4E4E4` | Divisores y bordes de superficies |
| Líneas | `bordeFuerte` | `#858585` | Bordes de inputs y botones secundarios |
| Acento | `acento` | `#181818` | Acción primaria y selección activa |
| Acento | `acentoSuave` | `#F1F1F1` | Fondo de selección neutra |
| Acento | `acentoBorde` | `#CFCFCF` | Borde de superficie resaltada |
| Velo | `velo` | `rgba(24, 24, 24, 0.45)` | Backdrop de modales (nunca gris azulado) |
| Estados | `ausente` / `ausenteSuave` | `#A02E32` / `#FBECEE` | Ausencia, cancelación, error o acción destructiva |
| Estados | `justificada` / `justificadaSuave` | `#785014` / `#FAF0DC` | Ausencia justificada o advertencia |
| Estados | `programada` / `programadaSuave` | `#504280` / `#F0EDF9` | Jornada programada |
| Estados | `completada` / `completadaSuave` | `#525252` / `#F5F5F5` | Jornada finalizada |
| Estados | `sinRegistro` / `sinRegistroSuave` | `#595959` / `#F1F1F1` | Participante sin marca registrada |
| Estados | `info` / `infoSuave` | `#384D6A` / `#EDF2F8` | Aviso informativo |

### 2.2 Escala tipográfica y pesos

| Token | Tamaño (`px`) | Interlineado (`px`) | Uso recomendado |
|---|---|---|---|
| `micro` | `11` | `16` | Etiquetas de pestaña, micro-metadatos, badges |
| `cuerpoSm` | `13` | `19` | Texto secundario, descripciones de apoyo |
| `cuerpo` | `15` | `22` | Texto principal, valores de inputs |
| `tituloSm` | `17` | `24` | Títulos de sección y encabezado de pantalla |
| `titulo` | `20` | `26` | Títulos principales de vista o modal |
| `display` | `28` | `34` | Cifras resumen o encabezados de portada |

Pesos: normal (400), medio (500), fuerte (600) y encabezado (700).

### 2.3 Espaciado y radios

- **Espaciados (base 4):** `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`, `xxxl: 48`.
- **Radios por tipo de superficie:** `sm: 8` (badges/elementos internos), `campo: 12` (inputs), `tarjeta: 16` (contenedores y modales), `pill: 999` (botones y chips).

---

## 3. Catálogo de primitivos UI (`components/ui/`)

Toda pantalla nueva o refactorizada debe componer estos primitivos antes de crear estilos propios:

| Componente | Responsabilidad | Regla clave |
|---|---|---|
| `Boton` | Acción táctil (`primario`, `secundario`, `fantasma`, `peligro`) | Acción primaria negra, forma de cápsula y estados de carga y deshabilitado. |
| `CampoTexto` | Entrada de texto con etiqueta y error | Borde de `1 px`, radio `radios.campo`, error visible debajo. |
| `DatePickerField` | Selector de fecha nativo Android/iOS | Formatea en `America/El_Salvador` (`ADR-006`). |
| `Seccion` | Encabezado de bloque con título, detalle y acción opcional | Separa bloques con `espaciados.md`. |
| `Estado` | Píldora semántica de jornada o asistencia | Mapeo único vía `ESTADO_JORNADA` y `ESTADO_ASISTENCIA`. |
| `Aviso` | Banner contextual (informativo, advertencia o error) | Sin sombras; borde sutil y texto accionable. |
| `EstadoVacio` | Vista vacía con ícono, explicación breve y acción | Obligatorio en listas vacías (`RNF04`). |
| `Icono` | Material Icons vía `@expo/vector-icons` | Decorativo por defecto (`accessible={false}`); el texto o `accessibilityLabel` da el significado. |

---

## 4. Referencia de diseño basada en evidencia

La dirección actual y la evidencia de Mira Life se documentan en [DESIGN.md](./DESIGN.md). La evidencia de Tirus queda en [design-evidence.json](./design-evidence.json).
