# ADR-001 · Stack móvil: Expo, Expo Router, NativeWind v4 y Android Dev Build

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
La app debe ejecutarse en React Native con Expo, tener al menos 4 pantallas, combinar navegación en pila y pestañas (`RNF01`), y usar cámara/QR, GPS puntual y notificaciones push en Android dentro de un plazo de 4 semanas para 2 personas.

## Decisión
1. **Expo + TypeScript (modo estricto):** plantilla Expo gestionada (`managed`) con TypeScript.
2. **Expo Router:** navegación basada en archivos con grupos `(auth)` para pila de acceso, `(tabs)` para pestañas principales (`Mis grupos`, `Mi historial`, `Notificaciones`, `Cuenta`) y rutas dinámicas `grupos/[grupoId]/...` para la pila interna de cada grupo.
3. **NativeWind v4:** estilos utilitarios tipo Tailwind. Fijar versión en `[SETUP-01]` y validar el render de clases en una pantalla real antes de maquetar las demás pantallas (no mezclar sintaxis v2/v4).
4. **Objetivo de pruebas en Android:**
   - Para UI inicial (`Fase 2`), cámara QR y GPS puede usarse Expo Go o Development Build.
   - Para notificaciones push remotas (`HU16`), usar **Android Development Build (`expo-dev-client`)** compilado vía `npx expo run:android` (Android SDK local) o EAS Build (tier gratuito en la nube).

## Consecuencias
- **Positivas:** rutas deterministas para agentes, recarga rápida, sin costo de licencia iOS para push.
- **Riesgos y mitigación:** la configuración de Metro/Babel de NativeWind v4 es frágil; se verifica con un smoke test visual en `[SETUP-01]` antes de avanzar.
