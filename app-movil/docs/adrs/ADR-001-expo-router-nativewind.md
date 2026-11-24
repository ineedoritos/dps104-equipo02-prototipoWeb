# ADR-001 · Stack móvil: Expo, Expo Router, StyleSheet nativo y Android Dev Build

- **Estado:** Aprobado
- **Fecha:** 2026-11-22

## Contexto
La app debe ejecutarse en React Native con Expo, tener al menos 4 pantallas, combinar navegación en pila y pestañas (`RNF01`), y usar cámara/QR, GPS puntual y notificaciones push en Android dentro de un plazo de 4 semanas para 2 personas.

## Decisión
1. **Expo + TypeScript (modo estricto):** plantilla Expo gestionada (`managed`) con TypeScript.
2. **Expo Router:** navegación basada en archivos con grupos `(auth)` para pila de acceso, `(tabs)` para pestañas principales (`Mis grupos`, `Mi historial`, `Notificaciones`, `Cuenta`) y rutas dinámicas `grupos/[grupoId]/...` para la pila interna de cada grupo.
3. **Estilos con `StyleSheet` nativo (Expo normal):** se descarta NativeWind por temas de rendimiento y complejidad de configuración; se usa `StyleSheet.create` estándar de React Native, validando estilos en una pantalla real en `[SETUP-01]`.
4. **Objetivo de pruebas en Android:**
   - Para UI inicial (`Fase 2`), cámara QR y GPS puede usarse Expo Go o Development Build.
   - Para notificaciones push remotas (`HU16`), usar **Android Development Build (`expo-dev-client`)** compilado vía `npx expo run:android` (Android SDK local) o EAS Build (tier gratuito en la nube).
5. **Redux Toolkit + React Redux** para el estado compartido de la app. `[SETUP-01]` instala las dependencias. La primera historia que necesite estado compartido configura el store, el `Provider` y los slices que use.

## Consecuencias
- **Positivas:** rutas deterministas para agentes, recarga rápida, sin costo de licencia iOS para push.
- **Riesgos y mitigación:** al usar `StyleSheet` nativo sin compiladores CSS en Metro/Babel, se evitan problemas de rendimiento y configuración; mantener consistencia visual con constantes compartidas de colores y espaciados.
