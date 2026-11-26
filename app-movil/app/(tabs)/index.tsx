import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { Estado } from '@/components/ui/Estado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { obtenerMisGrupos, obtenerSesionActual, suscribirStore } from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { ResumenGrupoUsuario } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

export default function MisGruposScreen() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<ResumenGrupoUsuario[]>(() => obtenerMisGrupos());
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refrescando, setRefrescando] = useState(false);

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
      return suscribirStore(recargar);
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
    <View style={styles.pantalla}>
      <BarraSuperior mostrarVolver={false} titulo="Mis grupos" />

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

        {mostrarControlesDePrueba ? (
          <View style={styles.barraEstados}>
            {(['normal', 'cargando', 'vacio', 'error'] as const).map((modo) => {
              const activo = estadoVista === modo;
              return (
                <Pressable
                  key={modo}
                  onPress={() => setEstadoVista(modo)}
                  style={[styles.chipEstado, activo && styles.chipEstadoActivo]}
                >
                  <Text style={[styles.textoChipEstado, activo && styles.textoChipEstadoActivo]}>
                    {modo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

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
          <Boton icono="nueva" onPress={() => router.push('/grupos/crear')} titulo="Crear grupo" />
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
                  <View style={styles.detalleGrupo}>
                    <Text style={styles.nombreGrupo}>{item.grupo.nombre}</Text>

                    {item.grupo.descripcion ? (
                      <Text numberOfLines={2} style={styles.descripcion}>
                        {item.grupo.descripcion}
                      </Text>
                    ) : null}

                    <View style={styles.metaGrupo}>
                      <Text style={[styles.textoMeta, cifrasTabulares]}>
                        {esResponsable ? 'Responsable' : 'Participante'} ·{' '}
                        {item.totalIntegrantes}{' '}
                        {item.totalIntegrantes === 1 ? 'integrante' : 'integrantes'}
                      </Text>
                      {item.tieneJornadaEnCurso ? <Estado tono="enCurso" /> : null}
                    </View>
                  </View>
                  <Icono color={colores.tintaSuave} nombre="avanzar" tamano={22} />
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.superficie,
    flex: 1,
  },
  contenido: {
    backgroundColor: colores.papel,
    flexGrow: 1,
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  barraEstados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.xs,
  },
  chipEstado: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  chipEstadoActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoChipEstado: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  textoChipEstadoActivo: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  lista: {
    borderTopColor: colores.borde,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tarjeta: {
    alignItems: 'center',
    borderBottomColor: colores.borde,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: espaciados.md,
    minHeight: 64,
    paddingVertical: espaciados.lg,
  },
  tarjetaPresionada: {
    backgroundColor: colores.superficieAlt,
  },
  detalleGrupo: {
    flex: 1,
    gap: espaciados.xs,
  },
  nombreGrupo: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  descripcion: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
  },
  metaGrupo: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
  },
  textoMeta: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
});
