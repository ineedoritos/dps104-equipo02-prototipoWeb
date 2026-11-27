import { Slot, useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { Icono, TRAZO_ICONO, type NombreIcono } from '@/components/ui/Icono';
import { obtenerGrupoPorId, obtenerMiRolEnGrupo, suscribirStore } from '@/lib/gruposStore';
import { colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import type { Grupo, RolGrupo } from '@/types/dominio';

/**
 * Marco fijo del grupo: encabezado, pestañas y, debajo, el contenido de la
 * pestaña activa (Slot). Cambiar de pestaña cambia solo el contenido; el
 * encabezado y las pestañas no se mueven.
 */
export default function GrupoPestanasLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  // Se leen al inicializar: así el primer render ya tiene el grupo y no muestra el aviso de "no integrante".
  const [grupo, setGrupo] = useState<Grupo | undefined>(() =>
    grupoId ? obtenerGrupoPorId(grupoId) : undefined,
  );
  const [rol, setRol] = useState<RolGrupo | null>(() =>
    grupoId ? obtenerMiRolEnGrupo(grupoId) : null,
  );

  useFocusEffect(
    useCallback(() => {
      const recargar = () => {
        if (!grupoId) return;
        setGrupo(obtenerGrupoPorId(grupoId));
        setRol(obtenerMiRolEnGrupo(grupoId));
      };
      recargar();
      return suscribirStore(recargar);
    }, [grupoId]),
  );

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!grupo || !rol) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <Encabezado onVolver={volver} titulo="Grupo" />
        <View style={styles.aviso}>
          <Aviso
            accion={
              <View style={styles.acciones}>
                {grupoId ? (
                  <Boton
                    onPress={() =>
                      router.replace({ pathname: '/(tabs)/historial', params: { grupoId } })
                    }
                    tamano="sm"
                    titulo="Ir a Mi historial"
                    variante="primario"
                  />
                ) : null}
                <Boton
                  onPress={() => router.replace('/(tabs)')}
                  tamano="sm"
                  titulo="Ir a Mis grupos"
                  variante="secundario"
                />
              </View>
            }
            texto="Ya no eres integrante activo de este grupo o no está disponible. Puedes consultar tus registros anteriores en Mi historial."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const esResponsable = rol === 'responsable';
  const seccion = pathname.endsWith('/integrantes')
    ? 'integrantes'
    : pathname.endsWith('/reportes')
      ? 'reportes'
      : 'jornadas';

  const pestana = (
    id: 'jornadas' | 'integrantes' | 'reportes' | 'historial',
    etiqueta: string,
    icono: NombreIcono,
    onPress: () => void,
  ) => {
    const activa = seccion === id;
    return (
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activa }}
        key={id}
        onPress={onPress}
        style={[styles.pestana, activa && styles.pestanaActiva]}
      >
        <Icono
          color={activa ? colores.tinta : colores.tintaSuave}
          nombre={icono}
          tamano={18}
          trazo={activa ? TRAZO_ICONO.activo : TRAZO_ICONO.normal}
        />
        <Text style={[styles.textoPestana, activa && styles.textoPestanaActiva]}>{etiqueta}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado
        derecha={
          esResponsable ? (
            <Pressable
              accessibilityLabel="Configuración del grupo"
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/grupos/[grupoId]/configuracion',
                  params: { grupoId: grupo.id },
                })
              }
              style={styles.botonAjustes}
            >
              <Icono color={colores.tinta} nombre="ajustes" tamano={19} />
              <Text style={styles.textoAjustes}>Ajustes</Text>
            </Pressable>
          ) : null
        }
        onVolver={volver}
        titulo={grupo.nombre}
      />

      {esResponsable ? (
      <View style={styles.pestanas} accessibilityRole="tablist">
        {pestana('jornadas', 'Jornadas', 'calendario', () =>
          router.replace({ pathname: '/grupos/[grupoId]', params: { grupoId: grupo.id } }),
        )}
        {pestana('integrantes', 'Integrantes', 'gente', () =>
              router.replace({
                pathname: '/grupos/[grupoId]/integrantes',
                params: { grupoId: grupo.id },
              }),
            )}
        {pestana('reportes', 'Reportes', 'reportes', () =>
              router.replace({ pathname: '/grupos/[grupoId]/reportes', params: { grupoId: grupo.id } }),
            )}
      </View>
      ) : null}

      <View style={styles.contenido}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  barra: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  botonIcono: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  centro: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: espaciados.sm,
  },
  titulo: {
    color: colores.tinta,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
  },
  espacio: {
    width: 44,
  },
  botonAjustes: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.pill,
    flexDirection: 'row',
    gap: espaciados.xs,
    minHeight: 44,
    paddingHorizontal: espaciados.md,
  },
  textoAjustes: {
    color: colores.tinta,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.micro,
  },
  pestanas: {
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.campo,
    flexDirection: 'row',
    marginHorizontal: espaciados.lg,
    marginTop: espaciados.xs,
    padding: 3,
  },
  pestana: {
    alignItems: 'center',
    borderRadius: radios.sm,
    flex: 1,
    flexDirection: 'row',
    gap: espaciados.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  pestanaActiva: {
    backgroundColor: colores.superficie,
  },
  textoPestana: {
    color: colores.tintaSuave,
    fontFamily: fuentes.medio,
    fontSize: tipografia.cuerpoSm,
  },
  textoPestanaActiva: {
    color: colores.tinta,
    fontFamily: fuentes.fuerte,
  },
  contenido: {
    flex: 1,
  },
  aviso: {
    padding: espaciados.lg,
  },
  acciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
  },
});
