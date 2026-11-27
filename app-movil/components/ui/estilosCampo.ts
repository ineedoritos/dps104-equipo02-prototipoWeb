import { StyleSheet } from 'react-native';

import { colores, interlineado, pesos, radios, tipografia } from '@/lib/tema';

export const alturaInteriorCampo = 54;

export const estilosCampo = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  etiqueta: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  marco: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.acentoBorde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: alturaInteriorCampo + 2,
  },
  enfocado: {
    backgroundColor: colores.superficie,
    borderColor: colores.acento,
  },
  conError: {
    borderColor: colores.ausente,
  },
  deshabilitado: {
    opacity: 0.6,
  },
  textoError: {
    color: colores.ausente,
    fontSize: tipografia.cuerpoSm,
    lineHeight: interlineado.cuerpoSm,
  },
});
