# ADR-005 · Flujo Git Flow, trazabilidad con Issues y calidad Human-in-the-loop

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
Equipo de 2 desarrolladores (Gerardo y Christian) con plazo de 4 semanas, entregas por fases en `main` (`"Fase N"`), asistencia de agentes de IA y enfoque práctico sin overhead de herramientas (sin GitHub Spec Kit ni Projects V2).

## Decisión
1. **Git Flow ligero:**
   - `main` es la rama predeterminada y recibe los PR de integración y los cortes de laboratorio `"Fase N"`.
   - Cada integrante crea su rama de trabajo desde `main`, abre un PR pequeño hacia `main` y sincroniza su rama de trabajo a diario.
   - Si el equipo habilita `develop` como rama de integración, los PR de trabajo apuntarán a `develop` y los cortes de fase se integrarán en `main`.
   - `Closes #N` cierra la issue al integrar el PR en la rama predeterminada. Si la rama de integración es otra, la issue se cierra manualmente tras aprobar su prueba E2E.
2. **Trazabilidad unidireccional (link, no copia):**
   - `PR / Commit` → referencia `#issue` → enlaza a `docs/specs/...#huXX`, `docs/database.md` y `docs/screens/SCREEN-XX.md`.
   - Los archivos en `docs/` **nunca** mantienen tablas inversas con números de issue; se consulta con `gh issue list --search "[HU07]" --state all`.
   - Si cambia una regla al programar, se actualiza `docs/` en el **mismo PR**.
3. **Organización en GitHub (sin Projects V2):**
   - Solo **Milestones** (`Fase 2 · UI`, `MVP · Alta`, `MVP · Media`), **labels mínimos** (`tipo:setup|historia|bug`, `prioridad:alta|media`, `area:ui|db|qr|gps|push`), `assignee` y dependencias nativas (`blocked by` vía REST API) cuando apliquen.
4. **Estrategia de calidad (sin tests automatizados):**
   - **No se escriben tests unitarios ni de integración automatizados** (ni Jest ni Testing Library).
   - Todo PR debe pasar:
     1. `typecheck` (TypeScript sin errores).
     2. `lint` sin errores.
     3. **Prueba manual E2E en Android (Human-in-the-loop):** el desarrollador ejecuta el guion paso a paso de la issue y de `docs/e2e-manual-guide.md` (caso feliz + casos borde + estados `cargando / vacío / error`).
     4. Revisión rápida del otro integrante + captura de pantalla si hay cambios de UI.

## Consecuencias
- **Positivas:** la integración diaria reduce los conflictos antes de cada entrega `"Fase N"`.
- **Riesgo y mitigación:** la lógica de horas o reportes puede sufrir regresiones. Ejecutar los **4 flujos maestros** de `docs/e2e-manual-guide.md` antes de cada corte de fase.
