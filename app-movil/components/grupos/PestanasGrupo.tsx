import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

const SECCIONES = [
  { id: 'jornadas', titulo: 'Jornadas', ruta: '/grupos/[grupoId]' },
  { id: 'integrantes', titulo: 'Integrantes', ruta: '/grupos/[grupoId]/integrantes' },
  { id: 'reportes', titulo: 'Reportes', ruta: '/grupos/[grupoId]/reportes' },
  { id: 'historial', titulo: 'Mi historial', ruta: '/(tabs)/historial' },
] as const;

type SeccionGrupo = (typeof SECCIONES)[number]['id'];

export function PestanasGrupo({
  grupoId,
  actual,
  esResponsable,
}: {
  grupoId: string;
  actual: SeccionGrupo;
  esResponsable: boolean;
}) {
  const router = useRouter();
  const visibles = SECCIONES.filter(({ id }) =>
    esResponsable ? id !== 'historial' : id === 'jornadas' || id === 'historial',
  );

  return (
    <View accessibilityRole="tablist" style={styles.barra}>
      {visibles.map(({ id, titulo, ruta }) => {
        const activa = actual === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            onPress={() => {
              if (activa) return;
              const destino = { pathname: ruta, params: { grupoId } };
              if (id === 'jornadas') {
                router.dismissTo(destino);
              } else if (id === 'historial' || actual === 'jornadas') {
                router.push(destino);
              } else {
                router.replace(destino);
              }
            }}
            style={({ pressed }) => [
              styles.pestana,
              activa && styles.activa,
              pressed && styles.presionada,
            ]}
          >
            <Text style={[styles.titulo, activa && styles.tituloActivo]}>{titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espaciados.xs,
    marginHorizontal: espaciados.lg,
    marginTop: espaciados.xs,
    padding: espaciados.xs,
  },
  pestana: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radios.campo,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espaciados.xs,
    paddingVertical: espaciados.sm,
  },
  activa: { backgroundColor: colores.superficie, borderColor: colores.acentoBorde },
  presionada: { backgroundColor: colores.acentoSuave },
  titulo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
    textAlign: 'center',
  },
  tituloActivo: { color: colores.acento, fontWeight: pesos.fuerte },
});
