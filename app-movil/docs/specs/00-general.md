# Spec 00 · Visión general, alcance y reglas transversales

Fuente académica base: `docs/artifacts/DPS104_Equipo02_T1_corregido (1).pdf` (Equipo 02 · Ciclo 03-2026).

## 1. Problema e hipótesis del MVP
- **Problema:** ¿Cómo lograr que responsables y participantes vean el mismo registro de asistencia y horas **el mismo día de la jornada**, para detectar inconsistencias antes de que nadie las olvide?
- **Inconsistencia:** diferencia entre lo ocurrido y lo registrado (una asistencia mal marcada o unas horas registradas que no coinciden con las reconocidas).
- **Aplicación generalista:** voluntariado, servicio social y deporte usan el mismo sistema, sin categorías de grupo.

## 2. Glosario oficial (T1 ↔ Código/BD)
| Término en T1 | Término en BD / Código | Definición |
|---|---|---|
| Actividad | **`jornada`** (`jornadas`) | Sesión individual de un grupo en **un solo día calendario** (`America/El_Salvador`, UTC-6). |
| Cuenta / Usuario | **`usuario`** (`usuarios`) | Cuenta única por persona; no existen tipos de cuenta globales. |
| Responsable | `rol = 'responsable'` | Integrante que administra un grupo específico (puede ser participante en otro grupo). |
| Participante | `rol = 'participante'` | Integrante cuya asistencia y horas se registran en ese grupo. |
| Registro de asistencia | **`asistencia`** (`asistencias`) | Registro único de un participante en una jornada (`presente`, `ausente` o `justificada`). |

## 3. Alcance del MVP (Dentro vs Fuera / No-Goals)
| Dentro del MVP | Fuera del MVP (No-Goals — PROHIBIDO implementar) |
|---|---|
| Cuenta por correo y contraseña; grupos e integrantes con un solo rol por grupo. | Autenticación institucional, jerarquías y permisos personalizados. |
| Crear, editar, cancelar y consultar jornadas individuales de un solo día. | Torneos, donaciones, recurrencias, tareas y entregas. |
| Asistencia manual o por QR según configuración del grupo. | Biometría, reconocimiento facial y antifraude avanzado. |
| Control de horas y tiempo reconocido con ajuste y motivo visible del responsable. Validación previa *(Media)*. | Turnos múltiples, descansos automáticos y reglas de jornada complejas. |
| Fotografía opcional como evidencia y GPS puntual en QR *(Media)*. | Video, mapas interactivos, rastreo continuo y geocercas. |
| Ausencia justificada marcada por el responsable con texto breve informativo. | Subida/envío de documentos, PDFs o constancias médicas por el participante. |
| Historial propio y reportes de participación de solo lectura en la app. | Exportación a PDF o Excel, rankings y analítica avanzada. |
| Solicitud básica de revisión y notificaciones in-app + push Android en 3 eventos *(Media)*. | Correo, SMS, chat y avisos por cada llegada por QR. |
| React Native con Expo (Android), API Supabase y datos en la nube. | Sincronización sin conexión (*offline-first*) e integraciones institucionales. |

> **Nota sobre horas reconocidas:** son internas del grupo y no sustituyen la acreditación oficial de servicio social.

## 4. Prioridades y metas del calendario
- **Prioridad Alta (`MVP · Alta` · meta 1-dic-2026):** `RF01`–`RF09`, `RF14`, `RF15` (`HU01`–`HU09`, `HU14`, `HU15`).
- **Prioridad Media (`MVP · Media` · tras prueba 2–4 dic, antes del 10-dic):** `RF10`–`RF13`, `RF16` (`HU10`–`HU13`, `HU16`). En este proyecto se priorizan primero **GPS puntual (`HU11`)** y **Notificaciones/Push Android (`HU16`)** después de estabilizar el flujo Alta.
- **Hitos clave:**
  - `24-nov`: L Fase 2 (interfaz navegable en Expo).
  - `27-nov`: T Fase 2 (diseño y arquitectura).
  - `01-dic`: Flujo central (`MVP · Alta`) completo en la nube.
  - `02–04 dic`: Prueba real con 3 usuarios.
  - `10-dic`: Defensa final (con al menos 1 mejora derivada de la prueba + Media alcanzada).

## 5. Requerimientos no funcionales (RNF01–RNF05)
- **RNF01 · Tecnología y navegación:** React Native con Expo; mínimo 4 pantallas y navegación combinada en **pila + pestañas**.
- **RNF02 · Persistencia:** lectura y escritura mediante API (Supabase); los datos confirmados se persisten en la nube.
- **RNF03 · Seguridad e integridad:** autorización verificada en servidor (RLS + RPCs), credenciales protegidas y operaciones idempotentes sin duplicados.
- **RNF04 · Errores y permisos:** toda pantalla maneja estados de carga, errores visibles claros, reintento seguro y solicitud/manejo de permisos de cámara, GPS y notificaciones.
- **RNF05 · Privacidad:** las fotografías son configurables por grupo (`no_permitidas`, `opcionales` u `obligatorias`); cuando sean obligatorias solo aplican como evidencia de asistencia dentro del grupo y está prohibido almacenar datos confidenciales o imágenes identificables sin autorización.

## 6. Criterio de éxito de la prueba con usuarios (Tablas 2 y 3 del T1)
La hipótesis del MVP se valida entre el 2 y 4 de diciembre con 3 usuarios reales en un grupo demo:
1. **Registro completado:** 3 de 3 usuarios completan su registro correctamente.
2. **Consulta correcta:** al menos 2 de 3 consultan correctamente su asistencia y horas.
3. **Detección de inconsistencias:** al menos 2 de 3 detectan un error sembrado previamente por el equipo (una hora de menos o una asistencia mal marcada).

Los 4 escenarios obligatorios de esta prueba están detallados en `docs/e2e-manual-guide.md`.
