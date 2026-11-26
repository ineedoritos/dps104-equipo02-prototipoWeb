import { StyleSheet } from 'react-native';

import { colores, espaciados, interlineado, pesos, radios, tipografia } from '@/lib/tema';

export const alturaInteriorCampo = 50;

export const estilosCampo = StyleSheet.create({
  contenedor: {
    gap: espaciados.xs,
  },
  etiqueta: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  marco: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.bordeFuerte,
    borderRadius: radios.campo,
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
