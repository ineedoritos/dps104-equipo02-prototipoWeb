---
version: alpha
name: tirus.app (referencia editorial móvil)
description: Referencia de diseño móvil analizada con awwwards-mcp para fundamentar superficies de papel cálido, bordes de 1 px, acento único y cifras tabulares en app-movil.
colors:
  paper: "#f8f6f0"
  paperAlt: "#f0ede6"
  surface: "#ffffff"
  ink: "#161616"
  inkMuted: "#696969"
  accent: "#0e7c66"
typography:
  primary: "DM Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  fallback: "-apple-system, BlinkMacSystemFont, SF Pro Text, DM Sans, sans-serif"
rounded:
  field: "12px"
  card: "16px"
  modal: "24px"
  pill: "999px"
spacing:
  base: "4px / 8px / 12px / 16px / 24px / 32px"
components:
  talkCard: ".talk"
  planCard: ".plan"
---

## Overview

Inspección en viewport móvil (`390×844`) de `https://tirus.app/` (*Tirus: Voice Notes & Tasks — Awwwards Nominee*), seleccionada tras el cribado de referencias editoriales minimalistas con `awwwards-mcp` (`shortlist_references`, `export_design_tokens`, `analyze_page_structure`, `capture_live_site`, `capture_component`, `get_motion_dna`) [S1][S2][S3]. El sitio demuestra cómo una herramienta de productividad puede sentirse humana, táctil y ordenada alternando un lienzo papel cálido (`#f8f6f0`) con tarjetas blancas (`#ffffff`), un solo acento verde bosque (`#0e7c66`) y lecturas numéricas limpias [S1][S2].

## Colors

Valores observados en el barrido de estilos computados (`maxNodes: 800`, `viewport: mobile`) [S1]:

- **Fondo papel cálido:** `#f8f6f0` (15 nodos) y `#f0ede6` (3 nodos), usado como lienzo continuo entre bandas [S1][S2].
- **Superficie de tarjeta:** `#ffffff` (40 nodos), creando separación clara sin necesidad de colores saturados [S1][S2].
- **Tinta principal:** `#161616` (685 nodos) y `#111111` (5 nodos) [S1].
- **Tinta secundaria:** `#696969` (38 nodos) y `#6b6b6b` (15 nodos) [S1].
- **Acento único principal:** `#0e7c66` (verde bosque profundo) con variante `#14a386` [S1].
- **Propuesta para `app-movil` (`lib/tema.ts`):** mantener exactamente esta arquitectura cromática con `papel: #F7F4EE`, `superficie: #FFFFFF`, `tinta: #1C1B1F`, `tintaSuave: #5B5862` y `acento: #0B6B58`.

## Typography

Familias y pesos observados [S1]:

- **Familia principal:** `"DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` (487 nodos), pesos observados `300`, `400`, `500` [S1].
- **Familia de interfaz de apoyo:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "DM Sans", sans-serif` (307 nodos), pesos `400`, `500`, `600`, `700` [S1].
- **Tamaños frecuentes en UI móvil:** `13px`, `15px`, `16px`, `18px`, `20px`, `24px`, `32px`, `34px`, `44px` [S1].
- **Propuesta para `app-movil`:** usar fuente nativa del sistema en Android (`StyleSheet` sin carga pesada de fuentes web), acotar la escala a 6 pasos (`11`, `13`, `15`, `17`, `20`, `28`) y limitar el peso máximo a `600` (`pesos.fuerte`) con `tabular-nums` en todas las cifras.

## Layout

Estructura observada de 15 bandas en `scrollMode: "document"` (`390px` de ancho, `10471px` de alto total) [S2]:

- **Ritmo alterno papel ↔ tarjeta:** el documento alterna bandas de fondo `rgb(248, 246, 240)` (`body`) con tarjetas centradas de fondo `rgb(255, 255, 255)` (`.talk` a `y=2008`, `.data__shot` a `y=4144`, `.plan` a `y=8256`, `.final__screen` a `y=9648`) [S2].
- **Múltiplos de espaciado frecuentes:** `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px` [S1].
- **Propuesta para `app-movil`:** adoptar rigurosamente la rejilla base 4 (`4, 8, 12, 16, 24, 32, 48`) sin valores intermedios (`10px`, `14px`, `20px`) para simplificar el mantenimiento en React Native.

## Elevation & Depth

- **Bordes:** `1px solid` observado en 22 nodos (p. ej. `.plan` con `1px solid rgb(235, 231, 223)`) y `2px solid` en 2 nodos [S1][S3].
- **Sombras:** presentes de forma sutil en la referencia web (`rgba(22, 22, 22, 0.04) 0px 6px 18px 0px` en `.plan`), pero **propuesta estricta para `app-movil`:** eliminar sombras en tarjetas dentro del scroll y reemplazarlas por bordes de `1 px` (`colores.borde`), reservando `sombras.flotante` solo para botones flotantes y el panel QR.

## Shapes

Radios observados con mayor frecuencia [S1]:

- `12px` (15 nodos) — campos e ítems internos.
- `999px` (13 nodos) — píldoras y botones redondeados.
- `16px` (9 nodos) — tarjetas compactas (`.talk`: `borderRadius: 16px`) [S1][S3].
- `24px` (2 nodos) — tarjetas destacadas (`.plan`: `borderRadius: 24px`) [S1][S3].
- **Propuesta para `app-movil`:** un radio dominante por tipo de superficie (`campo: 12`, `tarjeta: 16`, `pill: 999`).

## Components

Dos componentes inspeccionados directamente con `capture_component` (`viewport: mobile`) [S3]:

1. **Tarjeta de contenido (`.talk`):**
   - Tamaño observado: `324 × 442 px` en viewport `390 × 844`.
   - Superficie `#ffffff`, tinta `#161616`, radio `16px`, sin borde (`0px`) y `overflow: hidden`.
   - Tipografía base `18px / 25.2px`, peso `400`.
2. **Tarjeta estructurada con borde (`.plan.plan--free`):**
   - Tamaño observado: `350 × 393.78 px`, `display: flex`, `flexDirection: column`, `padding: 28px 24px`.
   - Superficie `#ffffff`, borde `1px solid rgb(235, 231, 223)`, radio `24px`, sombra sutil `rgba(22, 22, 22, 0.04) 0px 6px 18px 0px`.

**Movimiento observado (`get_motion_dna`) [S4]:**
- `0` ScrollTriggers, `0` scrubs, `0` pins (`scroll.triggerCount = 0`).
- Mediana de duración de animaciones CSS: `320 ms` (`p25: 320 ms`, `p75: 1000 ms`).

## Do's and Don'ts

- **Hacer (evidencia + propuesta):** usar lienzo papel cálido (`#F7F4EE`) + tarjetas blancas (`#FFFFFF`) con borde de `1 px` y un único acento verde bosque (`#0B6B58`) [S1][S2].
- **Hacer (propuesta):** mantener transiciones breves (`<= 320 ms`, acorde a la mediana observada) y sin bloqueos de scroll [S4].
- **No hacer:** introducir gradientes, sombras pesadas en cada tarjeta, múltiples colores de acento o pesos tipográficos mayores a `600`.
- **No hacer:** copiar activos, ilustraciones, textos ni el render WebGL de la referencia; `app-movil` es una app utilitaria nativa sin 3D.

## Sources

- **[S1]** `export_design_tokens` sobre `https://tirus.app/` (`viewport: mobile`, `selector: body`, `maxNodes: 800`, `nodesTruncated: true`).
- **[S2]** `analyze_page_structure` y `capture_live_site` sobre `https://tirus.app/` (`viewport: mobile`, 15 bandas, `totalHeight: 10471`).
- **[S3]** `capture_component` sobre `.talk` (19 nodos) y `.plan` (25 nodos) en `https://tirus.app/` (`viewport: mobile`).
- **[S4]** `get_motion_dna` sobre `https://tirus.app/` (`viewport: mobile`).
