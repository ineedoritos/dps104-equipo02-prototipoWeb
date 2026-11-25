# Dirección visual · Registro de actividades

- **Estado:** Propuesta para revisión
- **Fecha:** 2026-11-25
- **Alcance:** las 18 pantallas de `docs/screens/README.md`
- **Este documento no cambia código.** Los tokens de `lib/tema.ts` se actualizan en un PR posterior.

---

## 1. Diagnóstico

El tema actual (`lib/tema.ts`) usa la paleta por defecto de Tailwind:

| Token | Valor actual | Origen |
|---|---|---|
| `fondo` | `#F8FAFC` | Tailwind `slate-50` |
| `superficie` | `#FFFFFF` | blanco puro |
| `primario` | `#1D4ED8` | Tailwind `blue-700` |
| `texto` | `#0F172A` | Tailwind `slate-900` |
| `textoSuave` | `#64748B` | Tailwind `slate-500` |
| `borde` | `#E2E8F0` | Tailwind `slate-200` |

Ninguno de esos valores fue una decisión de diseño: son los valores que produce cualquier herramienta por defecto. Eso explica la sensación de "interfaz genérica", y se refuerza con:

- **Cuatro radios casi iguales** (8 / 12 / 16 / 28): ningún elemento se siente intencional.
- **Jerarquía plana**: todas las tarjetas tienen el mismo peso, aunque la jornada de hoy es lo único urgente.
- **Tres acentos compitiendo** (azul primario, verde de éxito, gris) sin una regla que los separe.
- **Sombra o borde según el componente**, sin criterio.
- **Cifras de ancho variable** en horas, duraciones y tasas: se mueven al actualizar y se leen mal.

Conclusión: el problema no es "faltan adornos", es que **no hay decisiones restrictivas**. Este documento las fija.

---

## 2. Principios (reglas duras)

1. **Un solo acento.** El verde del sistema se usa para acción principal *y* para "presente". No hay un segundo color de marca.
2. **Cero gradientes y cero glassmorphism.** Superficies planas.
3. **Borde de 1 px en lugar de sombra.** La sombra se reserva para dos casos: el panel del QR y el botón flotante.
4. **Un radio dominante (16).** 12 solo para campos, 999 solo para chips y botones de estado.
5. **La jerarquía se construye con tamaño, peso y espacio**, nunca con más colores.
6. **Todo dato numérico usa cifras tabulares** (`fontVariant: ['tabular-nums']`).
7. **El color nunca es la única señal.** Cada estado lleva además texto o forma.

---

## 3. Paleta semántica

| Token | Hex | Uso |
|---|---|---|
| `papel` | `#F7F4EE` | Fondo de pantalla (crema cálido, no blanco) |
| `superficie` | `#FFFFFF` | Tarjetas, hojas, cabeceras |
| `tinta` | `#1C1B1F` | Texto principal |
| `tintaSuave` | `#5B5862` | Texto secundario, metadatos |
| `borde` | `#E6E1D7` | Bordes de 1 px |
| `bordeFuerte` | `#CFC8B8` | Separadores y campos deshabilitados |
| `acento` | `#0E7C66` | Acción principal, QR vigente, "presente" |
| `acentoSuave` | `#E3F1ED` | Fondo de chips de presente |
| `ausente` | `#C2352B` | Ausente sin motivo, acción destructiva |
| `ausenteSuave` | `#FBEAE7` | Fondo de chips de ausente |
| `justificada` | `#A65A12` | Ausencia justificada, advertencia |
| `justificadaSuave` | `#FAF0E1` | Fondo de chips de justificada |
| `cancelada` | `#6B6772` | Jornada cancelada (texto tachado) |
| `canceladaSuave` | `#EFEEF1` | Fondo de chips de cancelada |

**Regla de contraste:** sobre `papel`, el texto mínimo es `tintaSuave`; sobre fondos suaves de estado, el texto usa el tono fuerte del mismo estado. Nunca gris claro sobre blanco.

**Semántica de estados de asistencia:**

| Estado | Color de texto | Fondo del chip | Señal adicional |
|---|---|---|---|
| Presente | `acento` | `acentoSuave` | Punto lleno |
| Ausente | `ausente` | `ausenteSuave` | Punto hueco |
| Justificada | `justificada` | `justificadaSuave` | Punto con anillo |
| Sin registrar | `tintaSuave` | `papel` | Guion |

---

## 4. Tipografía

- **Familia:** la del sistema (Roboto en Android). Sin fuentes descargadas: pesa menos y arranca más rápido.
- **Escala:**

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `micro` | 11 | 600 | Chips, etiquetas en mayúsculas con `letterSpacing: 0.5` |
| `cuerpo-sm` | 13 | 400 | Metadatos, notas al pie, motivos |
| `cuerpo` | 15 | 400 | Texto de listas y formularios |
| `titulo-sm` | 17 | 600 | Título de tarjeta, nombre de integrante |
| `titulo` | 20 | 600 | Encabezado de pantalla |
| `display` | 26 | 600 | Cuenta regresiva del QR, cifra del resumen |

- **Cifras tabulares** obligatorias en: `HH:MM`, duraciones, tasas en `%`, contadores (`X de Y`) y totales de reportes.
- **Sin MAYÚSCULAS** salvo en chips y etiquetas de sección.

---

## 5. Espaciado, radios y elevación

| Token | Valor | Uso |
|---|---|---|
| `xs` | 4 | Separación dentro de un chip |
| `sm` | 8 | Entre líneas de una misma tarjeta |
| `md` | 16 | Padding de tarjeta, margen de pantalla |
| `lg` | 24 | Entre bloques de una pantalla |
| `xl` | 32 | Encabezado a contenido |

| Token | Valor | Uso |
|---|---|---|
| `campo` | 12 | Inputs y botones |
| `tarjeta` | 16 | Tarjetas, hojas, banners |
| `pill` | 999 | Chips, botones P/A/J |

**Elevación:** `sombra` solo en el panel del QR y el botón flotante. Todo lo demás es `borde` de 1 px sobre `superficie`.

---

## 6. Componentes base

### 6.1 Tarjeta de jornada
- Radio 16, borde 1 px, padding 16, altura mínima 72.
- Línea 1: título (`titulo-sm`) + chip de estado a la derecha.
- Línea 2: `HH:MM – HH:MM` en `cuerpo-sm` con cifras tabulares.
- Línea 3 (opcional): resumen (`8 integrantes` · `2 sin registrar`).
- **Jornada en curso:** barra de 3 px de `acento` en el borde izquierdo y fondo `acentoSuave` al 40 %. Es el único elemento destacado del listado.
- **Cancelada:** texto de título tachado, chip `cancelada` y nota *"Sus registros no cuentan en los totales"*.

### 6.2 Chips de estado
- Pill, `micro`, mayúsculas, punto de 6 px a la izquierda.
- Fondo suave del estado + texto fuerte del mismo estado.

### 6.3 Botones P / A / J (SCREEN-09)
- Tres botones de 44 dp de alto mínimo, radio `pill`, borde 1 px.
- Contenido: letra grande + palabra pequeña debajo (`P presente`, `A ausente`, `J justificada`).
- Seleccionado: relleno del color de estado, texto blanco.
- No seleccionado: `superficie` + borde.
- Al cambiar de `P` a `A`/`J`, advertencia visible antes de borrar horas.

### 6.4 Barra apilada (SCREEN-12)
- Tres segmentos: `acento`, `justificada`, `ausente`, con separación de 2 px.
- **Siempre** con leyenda numérica al lado (nombre + total). El gráfico no debe ser la única fuente del dato.
- Altura 8, radio `pill`.

### 6.5 Panel del QR (SCREEN-11)
- Fondo `tinta`, contenido en blanco: es la única superficie oscura de la app.
- QR centrado con margen blanco de 16.
- Cuenta regresiva en `display` tabular, debajo del QR.
- Contador `Han escaneado 7 de 12` en `cuerpo-sm`.
- Al vencer: QR al 20 % de opacidad + botón **Regenerar código**.

### 6.6 Resumen fijo al pie (SCREEN-09)
- Barra inferior con borde superior de 1 px, fondo `superficie`.
- `4 presentes · 1 ausente · 1 justificada` con cifras tabulares + botón **Guardar cambios**.
- Nunca flotante sobre el contenido: ocupa su propio espacio.

### 6.7 Estados obligatorios (RNF04)
- **Cargando:** 3 tarjetas esqueleto con el mismo alto que la tarjeta real. Sin spinner centrado salvo en acciones.
- **Vacío:** icono de línea de 48, título `titulo-sm`, una línea de explicación y el CTA principal.
- **Error:** banner dentro del flujo (no modal) con el mensaje en español y botón **Reintentar**.
- **Permiso denegado:** pantalla completa limpia, explicación, botón para reintentar y salida alternativa.

---

## 7. Patrones por pantalla

| # | Pantalla | Patrón visual dominante |
|---|---|---|
| 01 | Iniciar sesión / Crear cuenta | Formulario de una columna, encabezado corto, un solo botón sólido |
| 02 | Mis grupos | Lista de tarjetas con chip de rol; vacío con CTA |
| 03 | Crear grupo | Formulario simple + tarjeta informativa de rol |
| 04 | Grupo, vista responsable | Encabezado con chip + tres secciones (Hoy / Próximas / Anteriores) |
| 05 | Configuración | Selector excluyente + switches con dependencia (GPS deshabilitado en manual) |
| 06 | Integrantes | Formulario de alta + lista con selector de rol y acción destructiva |
| 07 | Crear / editar jornada | Formulario con fecha y horas; campos bloqueados al editar |
| 08 | Detalle de jornada | Badge de estado + tres cifras de resumen + acciones según modalidad |
| 09 | Asistencia | Lista P/A/J + motivo obligatorio + resumen fijo al pie |
| 10 | Ajustar horas | Dos campos de hora + duración calculada en vivo + motivo condicional |
| 11 | Mostrar QR | Única pantalla oscura; QR + cuenta regresiva + contador |
| 12 | Reportes | Chips de período + barra apilada + tabla de solo lectura |
| 13 | Grupo, vista participante | Tarjeta destacada "Ahora" con CTA Escanear QR |
| 14 | Escanear QR | Visor de cámara a pantalla completa con marco y guía |
| 15 | Confirmación | Pantalla de éxito: cifra grande (hora o duración) y dos acciones |
| 16 | Mi historial | Filtro por grupo + tarjetas de resumen + lista por mes |
| 17 | Detalle del registro | Pares etiqueta/valor + tarjeta de motivo destacada |
| 18 | Notificaciones | Bandeja con punto de no leído + banner de permiso discreto |

---

## 8. Checklist RNF04 antes de cerrar una pantalla

- [ ] Estado **cargando** con esqueleto del tamaño real.
- [ ] Estado **vacío** con texto propio de la pantalla y CTA.
- [ ] Estado **error** visible, en español, con **Reintentar** sin duplicar datos.
- [ ] **Denegación de permiso** sin bloquear el resto de la pantalla.
- [ ] Cifras tabulares en horas, duraciones, tasas y contadores.
- [ ] El estado no depende solo del color.
- [ ] Sin gradientes, sin sombras fuera del QR y el botón flotante.
- [ ] Copy sin claves internas (`HUxx`, `SCREEN-xx`, `RNFxx`, nombres de tablas o campos).
- [ ] Contraste verificado sobre `papel`, no sobre blanco.

---

## 9. Evidencia: tokens extraídos con el MCP `awwwards`

Los valores de abajo no son estimaciones: se obtuvieron con `export_design_tokens` sobre sitios reales del índice de Awwwards.

| Referencia | Paleta observada | Tipografía | Radios |
|---|---|---|---|
| `tirus.app` (Mobile & Apps) | `#161616`, `#F8F6F0`, `#99FFE7`, `#FFC0A0`, `#0E7C66` | DM Sans / SF Pro | — |
| `woday.app` (Mobile & Apps) | `#000000`, `#FFFFFF`, `#F5F5F5`, `#0000EE` | Inter Display | 10 / 20 / 120 |
| `yumlog.dev` (Mobile & Apps) | `#1D1B2C`, `#4C4A60`, `#F2533A`, `#FFE3DC` | SF Pro / ui-rounded | 6 / 21 / 24 / 999 |
| `contentarchitecture.dev` (Honorable Mention) | `#232323`, `#F1EEE7`, `#FF9100` | Geist Sans + Geist Mono | 4 / 8 / 999 |

**Decisiones tomadas a partir de esta evidencia:**

- Fondo cálido en lugar de blanco/gris azulado (`tirus`, `contentarchitecture`).
- Un acento verde-teal como color de marca y de "presente" (`tirus`).
- Un solo radio dominante y chips tipo pill (`yumlog`, `woday`).
- Números con presencia tipográfica fuerte, no texto gris pequeño (`contentarchitecture` usa mono para datos).

**Cómo reproducirlo:**

```text
search_sites({ tags: ["mobile-apps"], responseMode: "compact" })
export_design_tokens({ url: "https://tirus.app/" })
create_design_brief({ slugs: [...], goal: "..." })
```

**Limitaciones honestas:**

- Awwwards es **web-first**: sus referencias sirven para paleta, tipografía y jerarquía, no para recrear pantallas nativas.
- El índice local está incompleto (15 de 196 páginas recorridas) y algunas consultas libres devuelven vacío; las búsquedas por tag y el análisis de una URL concreta sí responden.
- `create_design_brief` devolvió poca señal porque las fichas de sitio no exponen paleta; por eso la evidencia principal vino de `export_design_tokens`.

---

## 10. Fuera de alcance de este documento

- No modifica `lib/tema.ts`, componentes ni pantallas.
- No define animaciones ni transiciones (el proyecto no las usa como recurso de diseño).
- No propone librerías nuevas: todo se implementa con `StyleSheet` y los tokens existentes.

## 11. Siguiente paso

PR posterior: reescribir `lib/tema.ts` con esta paleta manteniendo los nombres actuales de las claves, para que el cambio se propague sin tocar componentes, y ajustar la jerarquía de la tarjeta de jornada.

## Referencias internas

- [`docs/screens/README.md`](../screens/README.md) — inventario de las 18 pantallas
- [`docs/specs/00-general.md`](../specs/00-general.md) — reglas generales y no-goals
- [`docs/adrs/ADR-001-expo-router-nativewind.md`](../adrs/ADR-001-expo-router-nativewind.md) — stack de UI
