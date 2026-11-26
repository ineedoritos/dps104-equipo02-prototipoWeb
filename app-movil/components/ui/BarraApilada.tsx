import { StyleSheet, Text, View } from 'react-native';

import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

interface BarraApiladaProps {
  presentes: number;
  justificadas: number;
  ausentesSinMotivo: number;
}

/**
 * Barra horizontal apilada con leyenda textual explícita para leer cada
 * categoría sin depender únicamente del color.
 */
export function BarraApilada({
  presentes,
  justificadas,
  ausentesSinMotivo,
}: BarraApiladaProps) {
  const total = presentes + justificadas + ausentesSinMotivo;

  if (total === 0) {
    return null;
  }

  return (
    <View style={styles.tarjeta}>
      <Text accessibilityRole="header" style={styles.titulo}>Resumen del período</Text>

      <View style={styles.barra}>
        {presentes > 0 ? (
          <View style={[styles.segmento, styles.segPresente, { flex: presentes }]} />
        ) : null}
        {justificadas > 0 ? (
          <View style={[styles.segmento, styles.segJustificada, { flex: justificadas }]} />
        ) : null}
        {ausentesSinMotivo > 0 ? (
          <View style={[styles.segmento, styles.segAusente, { flex: ausentesSinMotivo }]} />
        ) : null}
      </View>

      <View style={styles.leyenda}>
        <View style={styles.itemLeyenda}>
          <View style={[styles.punto, styles.segPresente]} />
          <Text style={[styles.textoLeyenda, cifrasTabulares]}>
            Presentes: {presentes}
          </Text>
        </View>

        <View style={styles.itemLeyenda}>
          <View style={[styles.punto, styles.segJustificada]} />
          <Text style={[styles.textoLeyenda, cifrasTabulares]}>
            Justificadas: {justificadas}
          </Text>
        </View>

        <View style={styles.itemLeyenda}>
          <View style={[styles.punto, styles.segAusente]} />
          <Text style={[styles.textoLeyenda, cifrasTabulares]}>
            Sin motivo: {ausentesSinMotivo}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.encabezado,
  },
  barra: {
    backgroundColor: colores.papel,
    borderRadius: radios.pill,
    flexDirection: 'row',
    height: espaciados.md,
    overflow: 'hidden',
    width: '100%',
  },
  segmento: {
    height: '100%',
  },
  segPresente: {
    backgroundColor: colores.presente,
  },
  segJustificada: {
    backgroundColor: colores.justificada,
  },
  segAusente: {
    backgroundColor: colores.ausente,
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.md,
  },
  itemLeyenda: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  punto: {
    borderRadius: radios.pill,
    height: 10,
    width: 10,
  },
  textoLeyenda: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
});
