// Expo Go tambien activa __DEV__. Las herramientas de QA se habilitan por separado.
export const mostrarControlesDePrueba =
  __DEV__ && process.env.EXPO_PUBLIC_CONTROLES_PRUEBA === '1';
