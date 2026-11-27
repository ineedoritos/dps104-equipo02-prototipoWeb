import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { obtenerMisGrupos, obtenerSesionActual, suscribirStore } from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import type { ResumenGrupoUsuario } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

export default function MisGruposScreen() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<ResumenGrupoUsuario[]>(() => obtenerMisGrupos());
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refrescando, setRefrescando] = useState(false);
  const ultimaAtras = useRef(0);

  const recargar = useCallback(() => {
    if (!obtenerSesionActual()) {
      router.replace('/(auth)/login');
      return;
    }
    setGrupos(obtenerMisGrupos());
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      recargar();
      const desuscribir = suscribirStore(recargar);

      if (Platform.OS !== 'android') {
        return () => desuscribir();
      }

      const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
        const ahora = Date.now();
        if (ahora - ultimaAtras.current < 2000) {
          return false;
        }
        ultimaAtras.current = ahora;
        ToastAndroid.show('Presiona atrás de nuevo para salir', ToastAndroid.SHORT);
        return true;
      });

      return () => {
        desuscribir();
        suscripcion.remove();
      };
    }, [recargar]),
  );

  const manejarRefresh = () => {
    setRefrescando(true);
    setTimeout(() => {
      setEstadoVista('normal');
      recargar();
      setRefrescando(false);
    }, 250);
  };

  const listaVisible = estadoVista === 'vacio' ? [] : grupos;

  return (
    <SafeAreaView edges={[]} style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl
            colors={[colores.acento]}
            onRefresh={manejarRefresh}
            refreshing={refrescando}
            tintColor={colores.acento}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <Text style={styles.subtitulo}>Tu rol cambia según el grupo.</Text>
        </View>


        {estadoVista === 'cargando' ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator color={colores.acento} size="large" />
            <Text style={styles.textoCarga}>Cargando tus grupos…</Text>
          </View>
        ) : null}

        {estadoVista === 'error' ? (
          <Aviso
            accion={
              <Boton
                onPress={() => {
                  setEstadoVista('normal');
                  recargar();
                }}
                tamano="sm"
                titulo="Reintentar"
                variante="secundario"
              />
            }
            texto="No pudimos cargar tus grupos. Revisa tu conexión e intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista !== 'cargando' && estadoVista !== 'error' && listaVisible.length === 0 ? (
          <EstadoVacio
            accion={
              <Boton
                icono="nueva"
                onPress={() => router.push('/grupos/crear')}
                titulo="Crear grupo"
              />
            }
            descripcion="Crea un grupo para organizar jornadas y registrar asistencia, o pide que te agreguen por correo."
            icono="gente"
            titulo="Aún no perteneces a ningún grupo"
          />
        ) : null}

        {estadoVista === 'normal' && listaVisible.length > 0 ? (
          <View style={styles.lista}>
            {listaVisible.map((item) => {
              const esResponsable = item.rol === 'responsable';
              return (
                <Pressable
                  key={item.grupo.id}
                  accessibilityRole="button"
                  onPress={() => router.push(`/grupos/${item.grupo.id}` as Href)}
                  style={({ pressed }) => [styles.tarjeta, pressed && styles.tarjetaPresionada]}
                >
                  <View style={styles.filaSuperior}>
                    <Text style={styles.nombreGrupo}>{item.grupo.nombre}</Text>
                    <View
                      style={[
                        styles.pildoraRol,
                        esResponsable ? styles.pildoraResponsable : styles.pildoraParticipante,
                      ]}
                    >
                      <Text
                        style={[
                          styles.textoRol,
                          esResponsable ? styles.textoResponsable : styles.textoParticipante,
                        ]}
                      >
                        {esResponsable ? 'Responsable' : 'Participante'}
                      </Text>
                    </View>
                  </View>

                  {item.grupo.descripcion ? (
                    <Text numberOfLines={2} style={styles.descripcion}>
                      {item.grupo.descripcion}
                    </Text>
                  ) : null}

                  <View style={styles.filaInferior}>
                    <View style={styles.metaGrupo}>
                      <Icono color={colores.tintaSuave} nombre="gente" tamano={16} />
                      <Text style={[styles.textoMeta, cifrasTabulares]}>
                        {item.totalIntegrantes}{' '}
                        {item.totalIntegrantes === 1 ? 'integrante' : 'integrantes'}
                      </Text>
                    </View>

                    {item.tieneJornadaEnCurso ? (
                      <View style={styles.estadoEnCurso}>
                        <View style={styles.puntoEnCurso} />
                        <Text style={styles.textoEnCurso}>Jornada en curso ahora</Text>
                      </View>
                    ) : (
                      <Icono color={colores.tintaTenue} nombre="avanzar" tamano={18} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {listaVisible.length > 0 && estadoVista === 'normal' ? (
          <Boton
            icono="nueva"
            onPress={() => router.push('/grupos/crear')}
            titulo="Crear grupo"
          />
        ) : null}

        <Text style={styles.notaPie}>Solo ves los grupos a los que perteneces.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  encabezado: {
    gap: espaciados.xs,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.display,
    fontFamily: fuentes.fuerte,
    letterSpacing: -0.4,
  },
  subtitulo: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpo,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  lista: {
    gap: espaciados.md,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  tarjetaPresionada: {
    backgroundColor: colores.superficieAlt,
  },
  filaSuperior: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  nombreGrupo: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  pildoraRol: {
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  pildoraResponsable: {
    backgroundColor: colores.acentoSuave,
  },
  pildoraParticipante: {
    backgroundColor: colores.completadaSuave,
  },
  textoRol: {
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
  },
  textoResponsable: {
    color: colores.acento,
  },
  textoParticipante: {
    color: colores.completada,
  },
  descripcion: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
  },
  filaInferior: {
    alignItems: 'center',
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espaciados.xs,
    paddingTop: espaciados.sm,
  },
  metaGrupo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  textoMeta: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  estadoEnCurso: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  puntoEnCurso: {
    backgroundColor: colores.acento,
    borderRadius: radios.pill,
    height: 8,
    width: 8,
  },
  textoEnCurso: {
    color: colores.acento,
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    textAlign: 'center',
  },
});
