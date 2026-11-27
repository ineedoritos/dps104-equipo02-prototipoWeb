# DESIGN.md · Forma

Sistema de diseño de **Registro de actividades** (móvil y web). Es una copia del design system **Forma** publicado en claude.ai: [https://claude.ai/artifact/35KiK1Minm8qXJ4J4JCP9j](https://claude.ai/artifact/35KiK1Minm8qXJ4J4JCP9j) (versión `1795734455-443d`, exportada el 2026-11-27).

- **Fuente de verdad:** el artefacto de claude.ai. Si cambia allí, se vuelve a exportar este archivo y `design/forma.tokens.json` en el mismo PR. No edites los tokens solo aquí.
- **Tokens exactos (máquina):** [`design/forma.tokens.json`](design/forma.tokens.json), copia textual de `tokens.json`.
- Las secciones *Principios* y *Componentes* se copian textuales del artefacto. Las secciones *Cómo se aplica en el código* y *Desvíos conocidos* son propias del repositorio.

## Cómo se aplica en el código

| Dónde | Archivo | Cómo se usa |
|---|---|---|
| Móvil | `app-movil/lib/tema.ts` | `forma.*` con los nombres de Forma (`forma.ink`, `forma.mintInk`...). `colores.*` son alias heredados que apuntan a Forma. También `fuentes`, `tipografia`, `interlineado`, `interletrado`, `espaciados`, `radios`, `tamanos`. Ningún color fuera de ese archivo. |
| Móvil | `app-movil/app/_layout.tsx` | Carga Instrument Sans (400, 500, 600, 700) con `@expo-google-fonts/instrument-sans`. |
| Web | `app-web/src/app/globals.css` | Variables `--forma-*` (claro y `.dark`), utilidades `bg-forma-*` / `text-forma-*`, roles de shadcn mapeados a Forma y radios de Forma. |
| Web | `app-web/src/app/layout.tsx` | Instrument Sans con `next/font/google`. |

**Reglas para React Native** (Forma está escrito para web con clases `fm-*`; en móvil se traduce así):
- No hay clases CSS: usa los tokens de `tema.ts` en `StyleSheet.create` y los componentes de la tabla de abajo.
- **Tipografía:** en Android `fontWeight` no elige el peso de una fuente propia. Usa siempre `fontFamily: fuentes.normal | medio | fuerte | negrita` y nunca `fontWeight`.
- **Iconos:** `Icono` (Lucide en contorno, trazo 1.8; 2.1 en activo). Agrega nombres nuevos en `components/ui/Icono.tsx`.
- **Superficies:** `paper` (`colores.superficie`) sobre `canvas` (`colores.papel`), sin bordes decorativos ni sombras. `line` solo divide filas.
- **Presionado:** escala 0.98. **Deshabilitado:** opacidad 0.42 y `disabled`.

| Componente Forma | Equivalente en `app-movil` |
|---|---|
| Button | `components/ui/Boton.tsx` |
| Field | `components/ui/CampoTexto.tsx`, `DatePickerField.tsx`, `HoraPickerField.tsx` |
| Select | Sin componente propio todavía |
| Combobox | Sin componente propio todavía |
| Choice | `components/ui/SelectorSegmentado.tsx` (lista de opciones) y `SelectorTarjeta.tsx` (tarjetas en grid) |
| Switch | `Switch` de React Native con los colores de `tema.ts` |
| Segmented | Pestañas del grupo en `app/grupos/[grupoId]/(pestanas)/_layout.tsx` |
| Notice | `components/ui/Aviso.tsx` |
| Toast | Sin componente propio todavía |
| Dialog | `Modal` de React Native (por ejemplo, cancelar jornada) |
| Sheet | `components/ui/HojaAcciones.tsx` (hoja nativa de `@expo/ui`) |
| EmptyState | `components/ui/EstadoVacio.tsx` |
| Card | Estilos `tarjeta` por pantalla (`superficie` sobre `papel`) |
| Progress | `components/ui/BarraApilada.tsx` (reportes) |
| Metric | Sin componente propio todavía |
| ListRow | Filas por pantalla |
| Pill | `components/ui/Estado.tsx` |
| Avatar | Sin componente propio todavía |
| TabBar | `components/ui/BarraTabs.tsx` |
| Icons | `components/ui/Icono.tsx` (`lucide-react-native`) |

## Desvíos conocidos

- **Copy:** Forma pide voseo ("Confirmá tu participación"). La app usa tuteo ("Ingresa tu nombre"). **Pendiente de decisión del equipo**; mientras tanto, se mantiene el tuteo.
- **Foco de campos (móvil):** `CampoTexto` usa un anillo de 2 px en `lineStrong` (gris), separado 3 px del campo, en lugar del anillo `focus` azul. Fue una decisión de la persona del equipo.
- **TabBar (móvil):** ocupa todo el ancho con márgenes laterales y destinos de igual ancho (`flex: 1`), en lugar de ajustarse al contenido.
- **Tema oscuro:** solo en web. `app-movil` usa el tema claro (`userInterfaceStyle: light`).

## Principios y contenido

*Copia textual de `project/README.md` del artefacto.*

Forma es el lenguaje de interfaz móvil de "Registro de actividades": estructura monocromática, geometría precisa y color que pertenece a la información. La profundidad vive en las superficies, no en las sombras.

### Principios

- Usá `ink`, `muted`, `paper` y `canvas` para toda la estructura; el color aparece solo cuando comunica algo (progreso, estado, logro).
- Separá superficies por tono (`paper` sobre `canvas`), nunca por sombra (`shadow-none`) ni por borde decorativo (`line` solo divide filas).
- Un solo botón primario (`action`) por pantalla.
- Todo control interactivo mide al menos `size-target` (44 px) y tiene foco visible (`focus`, 2 px, sólido).

### Contenido

- Escribí en español con voseo: "Confirmá tu participación", "Agregá la evidencia", "Tocá cualquiera de las opciones".
- Usá mayúscula solo al inicio de la frase (sentence case). Títulos como "Registrar asistencia" y "Tu día, en equilibrio."
- Los títulos de notice son una frase corta con punto: "Vas por buen camino.", "Necesita tu atención."
- Los botones nombran el resultado: "Confirmar", "Guardar", "Registrar". Evitá "Aceptar" y "OK".
- Los mensajes de error dicen cómo corregir: "Marcá esta opción para continuar."
- Sin emojis. El estado siempre se escribe; el color solo lo refuerza.
- El wordmark es `forma.` en minúscula, con punto, en `display` o `heading`.

### Fundamentos visuales

- **Color.** Estructura en `ink`/`muted` sobre `paper`/`canvas`. Acentos contextuales: `blue` (información, horas), `mint` (éxito, actividades), `lilac` (logros, fechas), `peach` (pendiente, evidencias), `rose` (atención, error). Texto y iconos sobre un tinte usan su `*-ink`.
- **Temas.** Claro y oscuro comparten los mismos nombres de token; no escribas hex en componentes. Todo texto cumple 4.5:1 en ambos temas.
- **Tipografía.** Instrument Sans (Google Fonts, 400–700) en una sola familia `sans`. Pantallas: `title`; modales y secciones: `heading`; cifras: `metric` / `metric-sm` con cifras tabulares; texto: `body`, `body-sm`, `caption`. Los títulos grandes llevan interletrado negativo definido en el estilo.
- **Espaciado.** Escala `space-4` … `space-40`. Superficies tonales: `space-20`; modales: `space-24`.
- **Geometría.** El radio responde al tamaño y al espacio interior: `radius-sm` (10), `radius-md` (16), `radius-field` (17), `radius-lg` (24), `radius-surface` (28), `radius-modal` (32) y `radius-pill` para cápsulas y círculos. En contenedores anidados, el radio exterior es el interior más el inset (28 = 16 + 12; 24 = 16 + 8; 34 = 28 + 6 en la `TabBar`) y el inset es igual en todos los lados. No apliques el mismo radio a todo.
- **Superficies tonales.** Un degradado vertical de `paper` a un tinte, sin borde ni sombra (`Notice`).
- **Estados.** Hover cambia el tono (`fill-hover`, `action-hover`); presionado escala a 0.98; deshabilitado baja la opacidad y usa el atributo `disabled`. La selección nunca se comunica solo con color: el indicador cambia de forma o contenido.
- **Movimiento.** Transiciones de 150–200 ms; respetá `prefers-reduced-motion`.

### Iconografía

- Usá Lucide, solo en contorno: SVG en línea con `fill: none` y `stroke: currentColor`, trazo 1.8 redondeado. No uses iconos rellenos ni mezcles familias; si algún día hacen falta rellenos, cambiá toda la familia (ver `Icons`).
- Tamaños: 21 px por defecto, 20 px en `TabBar` y `Metric`, 19 px dentro de botones y toasts.
- El estado activo se marca con la cápsula `canvas` y trazo 2.1, no con otro icono.
- Los iconos decorativos llevan `aria-hidden="true"`; los botones redondos sin texto llevan `aria-label`.
- Colocá los iconos en círculos de `paper` o de un tinte; el icono toma el `*-ink` del tinte.

### Componentes

- Cargá `tokens.css` y `components/bundle.css`; las clases llevan prefijo `fm-` y se aplican dentro de un contenedor `.fm`.
- Acciones: `Button`. Formularios: `Field`, `Select`, `Combobox`, `Choice` (casilla y radio en fila), `Switch`, `Segmented`. Feedback: `Notice`, `Toast`, `Dialog`, `Sheet`, `EmptyState`. Datos: `Card`, `Progress`, `Metric`, `ListRow`, `Pill`, `Avatar`. Navegación: `TabBar`. Fundamentos: `Icons`.
- Para elegir entre pocas opciones usá `Segmented` (hasta 4) o `Choice`; entre cinco o más, `Select`; con búsqueda, `Combobox`. Los ajustes que se aplican al instante usan `Switch`.
- Un `Toast` confirma sin interrumpir (cápsula negra en tema claro); un `Dialog` o `Sheet` pide una decisión.
- Para un modal de confirmación usá `Dialog` con `showModal()`.

## Tokens

*Generado desde `tokens.json`. Valores exactos en [`design/forma.tokens.json`](design/forma.tokens.json).*

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `paper` | `#ffffff` | `#1b1d1f` | Superficie principal: tarjetas, modales, hojas y fondo de pantalla. Texto `ink` y `muted` sobre ella. |
| `canvas` | `#f4f5f5` | `#121415` | Fondo detrás de las superficies `paper` y reposo de filas seleccionables. Texto `ink` y `muted` sobre él. |
| `line` | `#e7e9e9` | `#2b2f32` | Divisores decorativos entre filas. No comunica estado: para bordes de controles usá `line-strong`. |
| `line-strong` | `#858d93` | `#7c868c` | Borde de controles que comunican estado (casilla sin marcar, pista de interruptor apagado). 3:1 sobre `paper` y `canvas` en ambos temas. |
| `fill` | `#eff1f1` | `#2a2e31` | Relleno de botones secundarios, campos y segmentos sobre `paper`. |
| `fill-hover` | `#e5e8e8` | `#353a3e` | Estado hover de `fill`. |
| `ink` | `#17191b` | `#f1f3f3` | Texto principal y títulos sobre `paper`, `canvas` y los tintes de acento. |
| `muted` | `#60686e` | `#b0b9be` | Texto secundario, subtítulos y leyendas sobre `paper`, `canvas`, `fill` y los cinco tintes (4.5:1 o más en ambos temas). |
| `action` | `#17191b` | `#f1f3f3` | Relleno del botón primario, interruptor encendido y casilla marcada. Texto encima: `on-action`. |
| `action-hover` | `#33383c` | `#d6dadb` | Estado hover de `action`. |
| `on-action` | `#ffffff` | `#17191b` | Texto e iconos sobre `action`. |
| `focus` | `#377ab8` | `#8cc0ee` | Anillo de foco de 2 px, siempre sólido. 3:1 o más sobre `paper`, `canvas` y los tintes. |
| `scrim` | `#202a3250` | `#00000099` | Velo detrás de modales y hojas. |
| `blue` | `#e1edf9` | `#26394b` | Tinte hielo: información, progreso de horas y casilla seleccionada. Texto `ink`/`muted` encima. |
| `mint` | `#e0eee6` | `#24372d` | Tinte menta: éxito, actividades completadas y estado activo. |
| `peach` | `#f9eedc` | `#3d3322` | Tinte arena: pendiente de revisión y evidencias. |
| `lilac` | `#ebe6f6` | `#342e47` | Tinte lila: logros, fechas de eventos y actividades cerradas. |
| `rose` | `#f7e5e9` | `#432c34` | Tinte rosa: atención requerida y errores de selección. |
| `blue-ink` | `#1f6aa3` | `#86bdea` | Icono y texto de acento sobre `blue` (4.5:1) y sobre `paper`. |
| `mint-ink` | `#28704b` | `#7fd0a4` | Texto de acento sobre `mint`; deltas positivos sobre `paper`. |
| `peach-ink` | `#86601b` | `#e2b565` | Icono y texto de acento sobre `peach`. |
| `lilac-ink` | `#7657a8` | `#b9a1e6` | Icono y texto de acento sobre `lilac`. |
| `rose-ink` | `#9a4658` | `#e69aab` | Icono, borde y texto de acento sobre `rose`; mensajes de error. |

### Tipografía

- `sans`: `"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- `mono`: `ui-monospace, SFMono-Regular, Consolas, monospace`

| Estilo | Grupo | Tamaño | Interlineado | Peso | Interletrado | Uso |
|---|---|---|---|---|---|---|
| `display` | Títulos | 56px | 58px | 500 | -0.065em | Solo portadas y estados de bienvenida. |
| `title` | Títulos | 32px | 36px | 500 | -0.05em | Título de pantalla. |
| `heading` | Títulos | 26px | 30px | 600 | -0.045em | Título de modal y de sección. |
| `subheading` | Títulos | 17px | 22px | 600 | -0.025em | Encabezado de grupo dentro de una pantalla. |
| `metric` | Datos | 40px | 40px | 600 | -0.055em | Cifra principal de un indicador. |
| `metric-sm` | Datos | 19px | 22px | 600 | -0.05em | Valor dentro de un indicador integrado. |
| `body` | Texto | 16px | 24px | 400 |  | Texto corrido. |
| `body-sm` | Texto | 14px | 20px | 400 |  | Descripciones de modal y notice. |
| `label` | Texto | 14px | 18px | 600 |  | Botones y títulos de fila. |
| `caption` | Texto | 13px | 18px | 400 |  | Leyendas, notas y subtítulos de fila. |
| `eyebrow` | Texto | 11px | 14px | 600 | 0.12em | Sobretítulo en mayúsculas; usarlo con moderación. |

### Espaciado

| Token | Valor | Uso |
|---|---|---|
| `space-4` | `4px` | Separación mínima entre icono y texto pequeño. |
| `space-8` | `8px` | Separación entre filas apiladas y entre botones. |
| `space-12` | `12px` | Padding interno de filas y separación icono-texto. |
| `space-16` | `16px` | Separación entre bloques relacionados. |
| `space-20` | `20px` | Padding de superficies tonales (notice). |
| `space-24` | `24px` | Padding de modales y separación entre grupos. |
| `space-32` | `32px` | Separación entre secciones de pantalla. |
| `space-40` | `40px` | Aire en estados vacíos y portadas. |

### Radios

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | `10px` | Controles pequeños e indicadores de casilla. |
| `radius-field` | `17px` | Campos de texto. |
| `radius-md` | `16px` | Contenedores internos con inset de 12 px dentro de superficies de 28 px (28 = 16 + 12) y opciones dentro de un panel de 24 px con inset de 8 (24 = 16 + 8). |
| `radius-lg` | `24px` | Filas, contenedores internos y tarjetas de lista. |
| `radius-surface` | `28px` | Superficies tonales (notice) y tarjetas de pantalla. |
| `radius-modal` | `32px` | Modales y hojas. Concéntrico: 32 = 24 (contenido) + 8 (inset). |
| `radius-pill` | `999px` | Botones, segmentos, indicadores, pills y círculos. |

### Tamaños

| Token | Valor | Uso |
|---|---|---|
| `size-control` | `48px` | Altura de botones y campos. |
| `size-target` | `44px` | Área táctil mínima de botones redondos e iconos interactivos. |
| `size-row` | `64px` | Altura mínima de una fila seleccionable (Choice). |
| `size-indicator` | `26px` | Lado del indicador de casilla o radio dentro de una fila. |

### Sombras

Forma no usa sombras: la profundidad vive en el contraste tonal entre superficies.

| Token | Valor | Uso |
|---|---|---|
| `shadow-none` | `none` | Valor por defecto de todas las superficies. No agregar sombras a tarjetas, modales ni botones. |

## Componentes

*Copia textual de `project/components/<Nombre>/README.md` del artefacto. Las clases `fm-*` y las etiquetas HTML describen la versión web; en móvil se usa el equivalente de la tabla de arriba.*

### Acciones

#### Button

*En el repo:* `components/ui/Boton.tsx`

Botón de acción con forma de cápsula: una sola acción primaria por pantalla, el resto en `fm-btn--secondary` o `fm-btn--ghost`.

##### Qué aporta quien lo usa

- Una etiqueta de verbo en infinitivo o imperativo voseo ("Registrar asistencia", "Guardar").
- Un icono Lucide opcional a la izquierda, 19 px, con `aria-hidden`.
- Un `aria-label` en `fm-round`, que no tiene texto visible.

##### Uso

```html
<button class="fm-btn fm-btn--primary">Registrar asistencia</button>
<button class="fm-btn fm-btn--secondary">Guardar</button>
<button class="fm-btn fm-btn--ghost">Cancelar</button>
<button class="fm-round" aria-label="Más opciones">…</button>
```

##### Reglas

- Altura `size-control` (48 px); `fm-round` mide `size-target` (44 px) como mínimo táctil.
- Relleno `action` con texto `on-action`; no usar acentos de color como fondo de botón.
- Un botón deshabilitado baja a 42 % de opacidad y usa `disabled`, no una clase.
- No agregar sombras (`shadow-none`).
- En un modal, los dos botones comparten el ancho a partes iguales.

### Formularios

#### Field

*En el repo:* `components/ui/CampoTexto.tsx`, `DatePickerField.tsx`, `HoraPickerField.tsx`

Campo de texto con relleno tonal: sin borde en reposo, borde `line-strong` y fondo `paper` al enfocar.

##### Qué aporta quien lo usa

- Una etiqueta visible (`<label class="fm-field">`); el placeholder no la reemplaza.
- `autocomplete` y `type` correctos (`search`, `email`, `tel`).
- El texto de ayuda o de error en `fm-field__hint`, enlazado con `aria-describedby`.

##### Uso

```html
<label class="fm-field">Nombre<input class="fm-input" placeholder="Tu nombre"></label>
<label class="fm-field"><span>Buscar actividad</span>
  <div class="fm-search">…<input class="fm-input" type="search"></div></label>
```

##### Reglas

- Radio `radius-field` (17 px), altura `size-control`.
- Error: `fm-field--error` pinta `rose` y borde `rose-ink`, y el mensaje explica cómo corregirlo ("Agregá tu nombre completo"). Nunca solo color.
- Foco: anillo `focus` de 2 px, además del cambio de fondo.

#### Select

*En el repo:* Sin componente propio todavía

Selector de una opción entre cinco o más: usa el `<select>` nativo del sistema, con el mismo relleno tonal y radio que `Field`.

##### Qué aporta quien lo usa

- Una etiqueta visible en `<label class="fm-field">`.
- Un `<select class="fm-input">` dentro de `<span class="fm-select">`, más el chevron Lucide `chevron-down` (21 px, `aria-hidden`).
- Una primera opción de instrucción ("Elegí una actividad") con `value=""` si el campo es obligatorio.

##### Reglas

- Conservá el menú nativo en móvil: es accesible, táctil y respeta el teclado del sistema.
- Con menos de cinco opciones usá `Segmented` (hasta cuatro) o `Choice` de tipo radio.
- Si el usuario necesita buscar en la lista, usá `Combobox`.
- Error: `fm-field--error` y un mensaje que explique qué elegir. Deshabilitado: atributo `disabled`.
- Mismas medidas que `Field`: altura `size-control`, radio `radius-field`, foco con anillo `focus`.

#### Combobox

*En el repo:* Sin componente propio todavía

Campo de texto con lista desplegable que filtra mientras se escribe: para elegir una opción entre muchas cuando buscar es más rápido que desplazarse.

##### Qué aporta quien lo usa

- Una etiqueta visible enlazada al input (`for` / `id`).
- El patrón ARIA completo: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` y `aria-activedescendant` en el input; `role="listbox"` en la lista y `role="option"` + `aria-selected` en cada opción.
- La lógica: filtrar sin distinguir tildes ni mayúsculas, flechas arriba/abajo, Enter para elegir, Esc para cerrar, y devolver el foco al input.
- Un mensaje de "Sin resultados" cuando el filtro no coincide.

##### Reglas

- Panel `canvas` con radio `radius-lg` (24) e inset de 8; las opciones usan `radius-md` (16): 24 = 16 + 8.
- La opción activa por teclado se pinta `fill`; la elegida, `blue` con un check `blue-ink`. Nunca comuniques la selección solo con color.
- Cada opción mide al menos `size-target` (44 px).
- Sin sombra: el panel se separa por tono y un contorno `line` de 1 px.
- Para menos de cinco opciones sin búsqueda usá `Select`.

#### Choice

*En el repo:* `components/ui/SelectorSegmentado.tsx` (lista de opciones) y `SelectorTarjeta.tsx` (tarjetas en grid)

Fila seleccionable de una o varias opciones: toda la cápsula es el área táctil y el estado se lee por tinte, indicador y forma.

##### Qué aporta quien lo usa

- Un `<label class="fm-choice">` que envuelve un `<input type="checkbox|radio">` real con clase `fm-choice__input`; el input cubre la fila y es el que recibe teclado y foco.
- Título y descripción cortos (`strong` + `small`).
- Un icono Lucide opcional en `fm-choice__icon`; sin icono, usá `fm-choice--plain`.
- Varias opciones relacionadas dentro de `<fieldset class="fm-choicegroup"><legend>…</legend>`.

##### Uso

```html
<fieldset class="fm-choicegroup"><legend>Registro</legend>
  <label class="fm-choice">
    <input class="fm-choice__input" type="checkbox" checked>
    <span class="fm-choice__icon">…</span>
    <span class="fm-choice__text"><strong>Asistencia presencial</strong><small>Registrar tu participación</small></span>
    <span class="fm-choice__box" aria-hidden="true"><svg>…check…</svg></span>
  </label>
</fieldset>
```

##### Estados

- **Reposo:** fondo `canvas`, indicador con borde `line-strong` (3:1).
- **Marcada:** degradado `blue` → `paper`, indicador `action` con check `on-action` que se dibuja en 180 ms.
- **Foco por teclado:** anillo `focus` de 2 px alrededor de toda la fila.
- **Error:** `fm-choice--error` pinta `rose` y borde `rose-ink`; el mensaje va en `fm-choicegroup__hint` y dice qué falta.
- **Deshabilitada:** 50 % de opacidad y `disabled` en el input.

##### Reglas

- Casilla = indicador cuadrado de esquinas redondeadas (9 px); radio = círculo con punto. La forma distingue "varias" de "una sola" sin depender del color. `fm-choice--round` mantiene el indicador circular de la primera versión, pero usalo solo si no mezclás casillas y radios en la misma pantalla.
- Alto mínimo `size-row` (64 px); icono de 48 px dentro de `paper`.
- Nunca comuniques la selección solo con el tinte: el indicador siempre cambia.
- No agregar sombras.

#### Switch

*En el repo:* `Switch` de React Native con los colores de `tema.ts`

Interruptor de ajuste inmediato: el cambio se aplica al tocarlo, sin botón de guardar.

##### Qué aporta quien lo usa

- Un `<button class="fm-switch" role="switch" aria-checked="true|false">` con `aria-label` o `aria-labelledby`.
- La etiqueta y la descripción al lado, dentro de `fm-row`.
- La lógica que alterna `aria-checked`.

##### Reglas

- Encendido: pista `action` y perilla `on-action`. Apagado: pista `line-strong` (3:1) y perilla `paper`.
- Usalo para ajustes que se aplican al instante; para elegir opciones dentro de un formulario usá `Choice`.
- Medidas fijas: 48 × 29 px, perilla de 23 px.

#### Segmented

*En el repo:* Pestañas del grupo en `app/grupos/[grupoId]/(pestanas)/_layout.tsx`

Control segmentado para filtrar una vista entre tres o cuatro opciones excluyentes.

##### Qué aporta quien lo usa

- Un contenedor `role="group"` con `aria-label` ("Filtro").
- Botones con `aria-pressed="true|false"`; solo uno en `true`.
- Etiquetas de una palabra ("Todas", "Próximas", "Pasadas").

##### Reglas

- Activo: `paper` sobre `fill`, peso 600; inactivo: `muted`.
- Más de cuatro opciones o etiquetas largas: usá una lista de `Choice` de tipo radio.
- Altura 39 px por segmento dentro de un contenedor con 4 px de inset.

### Feedback

#### Notice

*En el repo:* `components/ui/Aviso.tsx`

Superficie tonal para mensajes en contexto: un icono, un título integrado en la primera línea y una frase de apoyo, sin borde ni sombra.

##### Qué aporta quien lo usa

- Un tono: `fm-notice` (información), `--success`, `--achievement`, `--pending` o `--attention`.
- Un icono Lucide alineado con la primera línea.
- Título breve en `<strong>` y una o dos frases que expliquen qué hacer o qué pasó.

##### Reglas

- Degradado vertical de `paper` a un tinte (`blue`, `mint`, `lilac`, `peach`, `rose`); el icono toma el `*-ink` del mismo tono.
- Radio `radius-surface` (28 px) y padding `space-20`; el texto de apoyo es `muted`, el título `ink`.
- El tono nunca es el único portador del significado: el título lo dice ("Necesita tu atención").
- Un solo notice por bloque de pantalla; no apilar más de dos.
- Usá `role="status"` para avisos informativos y `role="alert"` solo para `--attention` que bloquea.

#### Toast

*En el repo:* Sin componente propio todavía

Aviso temporal de una confirmación o de un resultado: cápsula `action` (negra en tema claro, invertida en oscuro para mantener el contraste), texto `on-action`, sin sombra.

##### Qué aporta quien lo usa

- Un mensaje de una línea ("Cambios guardados"), en pasado y sin punto final si cabe.
- Un icono Lucide opcional de 19 px (`circle-check`, `info`).
- Una acción opcional (`fm-toast__action`, "Deshacer") cuando el resultado se puede revertir.
- El contenedor `role="status"` (o `aria-live="polite"`); el texto se anuncia al aparecer.

##### Reglas

- Ubicalo centrado, a `space-24` del borde inferior y por encima de la `TabBar`.
- Duración de 4 segundos; si lleva acción, dejalo al menos 6 segundos.
- Uno a la vez: un toast nuevo reemplaza al anterior.
- No uses toast para errores que bloquean: usá `Notice` con tono `--attention` en contexto.
- Entra con un desplazamiento de 12 px y 220 ms; con `prefers-reduced-motion` aparece sin animar.

#### Dialog

*En el repo:* `Modal` de React Native (por ejemplo, cancelar jornada)

Hoja de confirmación centrada: una insignia, un título, una explicación y dos acciones a partes iguales, sin decoración extra.

##### Qué aporta quien lo usa

- Un `<dialog class="fm-dialog" aria-labelledby aria-describedby>` abierto con `showModal()`; el navegador gestiona foco, Esc y fondo inerte.
- Insignia con un icono Lucide en `fm-dialog__badge` y un botón `fm-round` de cierre con `aria-label="Cerrar"`.
- Título de acción ("Registrar asistencia"), una frase que explica qué se confirma y, si hace falta, una nota de 13 px (`fm-dialog__note`).
- Dos botones: `fm-btn--secondary` ("Cancelar") y `fm-btn--primary` ("Confirmar").

##### Reglas

- Radio `radius-modal` (32 px), padding `space-24`, ancho máximo 410 px.
- Fondo `paper`; velo `scrim` con desenfoque de 3 px; sin sombra.
- La insignia usa `blue`/`blue-ink`; el cierre, `fill`.
- Devolvé el foco al botón que abrió el modal al cerrarlo.
- La acción primaria nombra el resultado ("Confirmar", "Eliminar"), nunca "Aceptar".

#### Sheet

*En el repo:* `components/ui/HojaAcciones.tsx` (hoja nativa de `@expo/ui`)

Hoja inferior flotante para decisiones que no merecen una pantalla: elegir una acción, filtrar o confirmar con más contexto que un `Dialog`.

##### Qué aporta quien lo usa

- Un contenedor modal (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) con foco atrapado y cierre con Esc, con arrastre hacia abajo o con un botón de cancelar.
- Un título de acción, una frase de contexto y como máximo tres botones apilados.
- El velo `scrim` detrás.

##### Reglas

- Flota a 8 px de los bordes de pantalla con radio `radius-modal` (32) en las cuatro esquinas.
- Padding `space-24`; el tirador es una cápsula de 36 × 4 px en `line-strong`.
- Acciones apiladas a ancho completo: primaria arriba (`fm-btn--primary`), secundarias abajo. La destructiva nunca es la primaria.
- Devolvé el foco al control que abrió la hoja al cerrarla.
- Sin sombra: la separación la da el velo.

#### EmptyState

*En el repo:* `components/ui/EstadoVacio.tsx`

Estado vacío tranquilo: una insignia, un mensaje corto que describe qué aparecerá y una acción opcional.

##### Qué aporta quien lo usa

- Un icono Lucide para la insignia (28 px).
- Un título breve ("Todo al día.") y una frase que diga qué va a aparecer aquí.
- Una acción secundaria si existe un siguiente paso útil.

##### Reglas

- Insignia de 66 px en `blue`/`blue-ink`; texto `ink` y `muted`.
- Centrado, sobre `paper`; padding vertical `space-32`.
- No uses ilustraciones ni emojis; el tono es de calma, no de error.

### Datos

#### Card

*En el repo:* Estilos `tarjeta` por pantalla (`superficie` sobre `papel`)

Superficie contenedora de una unidad de contenido: `paper` con radio `radius-surface` (28 px), sin borde ni sombra.

##### Variantes

- **Base** (`fm-card`): padding 16, para agrupar controles o texto.
- **Tonal** (`fm-card--tint`): degradado de `paper` a un tinte (`--tint: var(--lilac)`), como `Notice`, para destacar una unidad.
- **Anidada** (`fm-card--nested` + `fm-card__inner`): padding 12 y contenedor interno `canvas` con `radius-md` (16). 28 = 16 + 12.
- **Enlazable** (`fm-card--link`): un `<a>` o `<button>` completo; hover pasa a `fill`.

##### Qué aporta quien lo usa

- Un título (`fm-card__title`) con `strong` y `small`; a su izquierda un icono en círculo o una ficha de fecha.
- Cifras ya formateadas en `fm-card__figure`, con un `fm-card__eyebrow` que las nombra.
- Un progreso (`Progress`) cuando la tarjeta mide avance, y a lo sumo dos acciones en `fm-card__foot`.

##### Reglas

- Colocá las tarjetas sobre `canvas`; separalas con `space-12`.
- Geometría concéntrica: radio exterior = radio interior + inset (28 = 16 + 12; 24 = 16 + 8).
- Una tarjeta enlazable no contiene botones propios.
- Una tarjeta, una idea: no apiles más de tres bloques dentro.
- Sin sombra (`shadow-none`); la profundidad es el contraste `paper` sobre `canvas`.

#### Progress

*En el repo:* `components/ui/BarraApilada.tsx` (reportes)

Indicadores de avance: barra lineal en cápsula, barra por pasos y anillo con cifra central.

##### Variantes

- **Barra** (`fm-progress`): pista en el tinte del tono y barra en su `*-ink`. Tonos: base `blue`, `--mint`, `--peach`, `--lilac`, `--rose`. `fm-progress--lg` sube la altura de 10 a 16 px.
- **Pasos** (`fm-steps`): una cápsula por paso; los completados llevan `data-done`.
- **Anillo** (`fm-ring`): para una sola cifra destacada, 96 px.

##### Qué aporta quien lo usa

- `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y un nombre (`aria-label`).
- El avance en `--value` (porcentaje) y el valor escrito en texto ("48 / 60 h"): el color nunca es el único dato.
- Para pasos: cuántos hay y cuántos están completos, dicho en texto ("Paso 2 de 4").

##### Reglas

- La barra mide al menos 10 px aunque el avance sea 0, para que se vea el punto de partida.
- Pista y barra son del mismo tono: el `*-ink` sobre su tinte cumple 3:1 en claro y oscuro.
- Elegí el tono por significado (`mint` completo, `peach` pendiente, `rose` en riesgo), no por decoración.
- Respetá `prefers-reduced-motion`: la transición de 400 ms se desactiva.

#### Metric

*En el repo:* Sin componente propio todavía

Indicador en una sola cápsula: la barra de progreso es el fondo, y el icono, el valor y la flecha de navegación viven dentro de la misma geometría.

##### Qué aporta quien lo usa

- Una etiqueta corta, el valor ya formateado ("48 h", "92%") y un porcentaje de avance en `--progress`.
- Un tono por indicador: `--tone: var(--blue | mint | lilac | peach | rose)`.
- Un delta opcional ("+4") y un destino al tocar: es un `<button>`.

##### Reglas

- El valor usa `metric-sm` (19 px) o `fm-metric--lg` (24 px) con cifras tabulares.
- La barra mide al menos 40 px para cubrir el icono aunque el avance sea 0.
- El delta positivo va en `mint-ink`; no inventes deltas negativos en rojo, usá texto ("−2 esta semana").
- El color del tono no sustituye al número: el valor siempre se muestra.
- Cuatro indicadores como máximo por tarjeta.

#### ListRow

*En el repo:* Filas por pantalla

Fila táctil con icono circular, título, descripción y chevron; la variante `fm-event` agrega una ficha de fecha.

##### Qué aporta quien lo usa

- Un `<button class="fm-list__row">` (o un `<a>`) por fila, con título y descripción cortos.
- El tono del icono: `--tone: var(--blue | lilac | …)`; sin tono usa `fill`.
- Para eventos: mes en `small` (3 letras) y día en `strong` dentro de `fm-date`.

##### Reglas

- Altura mínima 62 px, icono de 44 px; el divisor es `line` y la última fila no lo lleva.
- El chevron indica que la fila navega; sin destino, usá un `<div>`, no un botón.
- `fm-event` va sobre `canvas` (fondo `paper`, radio 23 px); la ficha de fecha usa `lilac`.
- No pongas más de una línea de descripción por fila.

#### Pill

*En el repo:* `components/ui/Estado.tsx`

Etiqueta compacta de estado: una o dos palabras en un tinte con su texto de acento.

##### Qué aporta quien lo usa

- Una palabra de estado ("Activa", "Pendiente", "Revisada").
- Un tono: base `mint`, o `--info`, `--pending`, `--achievement`, `--attention`.

##### Reglas

- Texto 12 px en el `*-ink` del tinte (4.5:1 o más en claro y oscuro).
- El estado siempre va escrito; el color solo lo refuerza.
- No la uses como botón: no es interactiva.

#### Avatar

*En el repo:* Sin componente propio todavía

Círculo con las iniciales de una persona sobre uno de los cinco tintes.

##### Qué aporta quien lo usa

- Las dos iniciales en mayúscula (nombre y apellido).
- El tono (`--tone: var(--blue | mint | peach | lilac | rose)`), siempre el mismo para la misma persona.
- El nombre completo en texto al lado o en `aria-label`: el avatar solo no identifica.

##### Reglas

- Tamaños: 32 (`--sm`), 40 y 56 px (`--lg`); texto `ink` sobre el tinte.
- En grupo (`fm-avatars`) se solapan 10 px con un anillo de `paper` de 2 px; mostrá hasta cuatro y un "+N".
- No uses fotos de stock ni emojis; si hay foto real, recortala en círculo con el mismo tamaño.

### Navegación

#### TabBar

*En el repo:* `components/ui/BarraTabs.tsx`

Barra de navegación inferior en cápsula con cuatro destinos como máximo: icono sobre etiqueta, y la pestaña activa sobre una cápsula `canvas` concéntrica.

##### Qué aporta quien lo usa

- Un `<nav aria-label>` con botones o enlaces; el activo lleva `aria-selected="true"` (o `aria-current="page"` si son enlaces).
- Etiquetas de una palabra ("Inicio", "Actividades", "Progreso", "Perfil").
- La lógica de cambio de pantalla.

##### Reglas

- Geometría concéntrica: inset de 6 px igual en los cuatro lados y radio `radius-pill` en barra y destinos (34 = 28 + 6). Si cambiás el alto, mantené el inset igual arriba, abajo y a los lados.
- Fondo `paper`; el activo usa `ink`, trazo 2.1 y peso 600 sobre `canvas`; el resto `muted`.
- Cada destino mide 56 px de alto y al menos 64 px de ancho.
- Iconos de 20 px, trazo 1.8; nunca solo icono: la etiqueta siempre se ve.

### Fundamentos

#### Icons

*En el repo:* `components/ui/Icono.tsx` (`lucide-react-native`)

Iconografía de Forma: **Lucide, solo en contorno**, SVG en línea con `fill: none` y `stroke: currentColor`.

##### Por qué contorno y no relleno

- Forma comunica con tono, forma y tipografía; un icono relleno es la zona más pesada de la pantalla y rompe la calma tonal.
- Lucide es una sola familia en contorno. No existe una versión rellena equivalente: rellenar trazos a mano da resultados desiguales.
- El estado seleccionado ya lo dan la cápsula `canvas` y el trazo un poco más grueso (2.1 en lugar de 1.8). No dependas de cambiar de icono para marcar un estado.
- Si más adelante el producto necesita iconos rellenos, adoptá una familia que ofrezca ambos pesos (por ejemplo Phosphor regular + fill) para todo el sistema. No mezcles familias.

##### Medidas

- Trazo 1.8, redondeado (`stroke-linecap` y `stroke-linejoin: round`).
- 21 px por defecto, 20 px en `TabBar` y `Metric`, 19 px dentro de botones y toasts, 25–28 px en insignias grandes.
- Área táctil mínima `size-target` (44 px): el icono es más pequeño que su botón.

##### Color

- `ink` sobre `paper`/`canvas`; `muted` para iconos secundarios; `*-ink` solo sobre su tinte (p. ej. `blue-ink` sobre `blue`).
- Colocalos en círculos `paper` o de un tinte, nunca sueltos sobre una superficie de color.

##### Accesibilidad

- Decorativos: `aria-hidden="true"`. Un botón solo con icono lleva `aria-label`.
- Un icono nunca sustituye a la etiqueta de una acción principal.

##### Inventario

La hoja muestra el inventario base de 41 iconos; agregá otros desde Lucide con las mismas reglas y sumalos aquí.
