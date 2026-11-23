# ADR-005 · Flujo Git Flow, trazabilidad con Issues y calidad Human-in-the-loop

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
Equipo de 2 desarrolladores (Gerardo y Christian) con plazo de 4 semanas, entregas por fases en `main` (`"Fase N"`), asistencia de agentes de IA y enfoque práctico sin overhead de herramientas (sin GitHub Spec Kit ni Projects V2).

## Decisión
1. **Git Flow ligero:**
   - `main`: rama protegida de entregas. Solo recibe merges desde `develop` al cierre de cada laboratorio con commit `"Fase N"`.
   - `develop`: rama de integración diaria entre los 2 integrantes.
   - Ramas de trabajo: cada integrante trabaja en su rama (o rama corta `feat/huXX-...` desde `develop`) y abre PR pequeño hacia `develop` al terminar cada issue, sincronizando con `develop` a diario.
   - *Nota GitHub:* `Closes #N` auto-cierra issues solo al mergear en la rama por defecto del repo; si `main` es default, las issues se cierran manualmente (o vía `gh`) cuando su PR pasa la prueba E2E en `develop`.
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
- **Positivas:** cero tiempo quemado en mantener boards o mocks de tests; integración diaria en `develop` evita *merge hell* antes de cada entrega `"Fase N"`.
- **Riesgo y mitigación:** sin tests automatizados pueden colarse regresiones al tocar lógica de horas o reportes; se mitiga corriendo los **4 flujos maestros** de `docs/e2e-manual-guide.md` antes de cada corte `develop → main`.
