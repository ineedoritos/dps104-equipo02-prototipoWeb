# ADR-WEB-003 · Exportación 100% Client-Side a PDF y Excel

- **Estado:** Aprobado
- **Fecha:** 2026-11-25

## Contexto
El portal web necesita exportar reportes de participación (grupales y personales) a **PDF** y **Excel (`.xlsx`)** sin crear un servidor backend ni enviar datos de usuarios a servicios externos (`RNF-WEB-02`, `RNF05`).

## Decisión
1. **PDF Client-Side con `jspdf` + `jspdf-autotable`:**
   - Genera documentos tabulares limpios y paginados directamente en el navegador.
   - Peso reducido, excelente soporte de tablas multipágina con encabezados repetidos y pies de página con numeración y nota legal.
   - Se importa dinámicamente (`import('jspdf')`) al hacer clic en exportar para no inflar el bundle inicial ni fallar en SSR de Next.js.
2. **Excel Client-Side con `xlsx-style` / `xlsx-js-style`:**
   - Permite aplicar estilos a celdas (negrita en encabezados, color de relleno, bordes, alineación y formatos numéricos/porcentajes) directamente en el navegador.
   - **Nota de compatibilidad con Next.js / Webpack / Turbopack:** usar el paquete **`xlsx-js-style`** (fork mantenido y drop-in compatible de `xlsx-style` sin errores de módulos nativos `fs`/`cptable` en bundlers modernos), cargado con importación dinámica solo en cliente (`'use client'`).
3. **Integridad de datos exportados:**
   - Los exportadores reciben exclusivamente los datos ya filtrados en pantalla y respetan la fórmula oficial de tasa (`—` si denominador es 0) y la zona horaria `America/El_Salvador` (UTC-6).

## Consecuencias
- **Positivas:** descargas instantáneas, cero carga de servidor, privacidad total (los datos nunca salen del navegador del usuario autorizado).
- **Restricciones:** la generación de archivos debe ejecutarse únicamente en componentes cliente (`'use client'`) con `import()` dinámico para evitar errores de SSR (`window is not defined`).
