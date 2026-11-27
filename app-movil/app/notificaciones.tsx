import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { HojaAcciones } from '@/components/ui/HojaAcciones';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { formatearFechaRelativa } from '@/lib/fecha';
import {
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
  suscribirStore,
} from '@/lib/gruposStore';
import {
  contarNoLeidas,
  establecerPermisoPushSimulado,
  marcarLeida,
  marcarTodasLeidas,
  obtenerMisNotificaciones,
  obtenerPermisoPushSimulado,
  suscribirNotificaciones,
} from '@/lib/notificacionesStore';
import {
  cifrasTabulares,
  colores,
  espaciados,
  forma,
  fuentes,
  interlineado,
  radios,
  tamanos,
  tipografia,
} from '@/lib/tema';
import type { Notificacion, TipoEventoNotificacion } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'error';

const ESTILO_EVENTO: Record<
  TipoEventoNotificacion,
  { fondo: string; tinta: string; icono: NombreIcono; etiquetaTipo: string }
> = {
  asistencia_modificada: {
    fondo: forma.blue,
    tinta: forma.blueInk,
    icono: 'hecho',
    etiquetaTipo: 'Asistencia',
  },
  horas_actualizadas: {
    fondo: forma.mint,
    tinta: forma.mintInk,
    icono: 'reloj',
    etiquetaTipo: 'Horas',
  },
  solicitud_revision: {
    fondo: forma.peach,
    tinta: forma.peachInk,
    icono: 'alerta',
    etiquetaTipo: 'Revisión',
  },
};

export default function NotificacionesScreen() {
  const router = useRouter();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() =>
    obtenerMisNotificaciones(),
  );
  const [noLeidas, setNoLeidas] = useState<number>(() => contarNoLeidas());
  const [permisoPush, setPermisoPush] = useState<boolean>(() =>
    obtenerPermisoPushSimulado(),
  );
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refrescando, setRefrescando] = useState(false);
  const [avisoDestino, setAvisoDestino] = useState('');
  const [hojaPermisoAbierta, setHojaPermisoAbierta] = useState(false);

  const recargar = useCallback(() => {
    setNotificaciones(obtenerMisNotificaciones());
    setNoLeidas(contarNoLeidas());
    setPermisoPush(obtenerPermisoPushSimulado());
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
      const desuscribirNotif = suscribirNotificaciones(recargar);
      const desuscribirStore = suscribirStore(recargar);
      return () => {
        desuscribirNotif();
        desuscribirStore();
      };
    }, [recargar]),
  );

  const sesion = obtenerSesionActual();

  const manejarRefresh = () => {
    setRefrescando(true);
    setTimeout(() => {
      setEstadoVista('normal');
      setAvisoDestino('');
      recargar();
      setRefrescando(false);
    }, 250);
  };

  const abrirSolicitudPermiso = () => {
    if (__DEV__) {
      setHojaPermisoAbierta(true);
    } else {
      establecerPermisoPushSimulado(true);
    }
  };

  const abrirNotificacion = (item: Notificacion) => {
    setAvisoDestino('');
    marcarLeida(item.id);

    if (!item.jornada_id) {
      setAvisoDestino('Esta jornada ya no está disponible.');
      return;
    }

    const jornada = obtenerJornadaPorId(item.jornada_id);
    if (!jornada) {
      setAvisoDestino('Esta jornada ya no está disponible.');
      return;
    }

    if (item.tipo_evento === 'solicitud_revision') {
      const esResponsable = obtenerMiRolEnGrupo(jornada.grupo_id) === 'responsable';
      router.push({
        pathname: esResponsable
          ? '/grupos/[grupoId]/jornadas/[jornadaId]/revisiones'
          : '/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro',
        params: { grupoId: jornada.grupo_id, jornadaId: jornada.id },
      });
      return;
    }

    router.push({
      pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro',
      params: { grupoId: jornada.grupo_id, jornadaId: jornada.id },
    });
  };

  if (!sesion) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado titulo="Notificaciones" onVolver={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
        <View style={styles.contenidoVacioSesion}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.replace('/(auth)/login')}
                tamano="sm"
                titulo="Iniciar sesión"
              />
            }
            texto="Inicia sesión para ver tus notificaciones."
            tipo="info"
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Notificacion }) => {
    const meta = ESTILO_EVENTO[item.tipo_evento];
    const tiempoTexto = formatearFechaRelativa(item.creado_en);
    const etiquetaEstado = item.leida ? 'Leída' : 'Sin leer';

    return (
      <Pressable
        accessibilityLabel={`${etiquetaEstado}. ${meta.etiquetaTipo}. ${item.titulo}. ${item.mensaje}. ${tiempoTexto}`}
        accessibilityRole="button"
        onPress={() => abrirNotificacion(item)}
        style={({ pressed }) => [
          styles.fila,
          item.leida ? styles.filaLeida : styles.filaNoLeida,
          pressed && styles.presionado,
        ]}
      >
        <View style={styles.indicadorColumna}>
          {!item.leida ? <View style={styles.puntoNoLeida} /> : null}
        </View>

        <View style={[styles.circuloIcono, { backgroundColor: meta.fondo }]}>
          <Icono color={meta.tinta} nombre={meta.icono} tamano={20} />
        </View>

        <View style={styles.cuerpoFila}>
          <View style={styles.filaTitulo}>
            <Text numberOfLines={1} style={styles.tituloFila}>
              {item.titulo}
            </Text>
            <Text style={[styles.fechaFila, cifrasTabulares]}>{tiempoTexto}</Text>
          </View>
          <Text numberOfLines={1} style={styles.mensajeFila}>
            {item.mensaje}
          </Text>
          {!item.leida ? <Text style={styles.etiquetaSinLeer}>Sin leer</Text> : null}
        </View>

        <Icono color={forma.muted} nombre="avanzar" tamano={18} />
      </Pressable>
    );
  };

  const cabeceraLista = (
    <View style={styles.cabeceraLista}>
      {!permisoPush ? (
        <Aviso
          accion={
            <Boton
              onPress={abrirSolicitudPermiso}
              tamano="sm"
              titulo="Activar avisos en el dispositivo"
              variante="secundario"
            />
          }
          texto="Las notificaciones push están desactivadas. Igual verás todos tus avisos aquí."
          tipo="info"
        />
      ) : null}

      {avisoDestino ? <Aviso texto={avisoDestino} tipo="info" /> : null}

      {estadoVista === 'cargando' ? (
        <View style={styles.estadoCentro}>
          <ActivityIndicator color={colores.acento} size="large" />
          <Text style={styles.textoCarga}>Cargando notificaciones…</Text>
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
          texto="No pudimos cargar tus notificaciones. Intenta de nuevo."
          tipo="error"
        />
      ) : null}
    </View>
  );

  const listaVisible = estadoVista === 'normal' ? notificaciones : [];

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado titulo="Notificaciones" onVolver={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
      <FlatList
        ListEmptyComponent={
          estadoVista === 'normal' ? (
            <EstadoVacio
              descripcion="Cuando cambie tu asistencia, tus horas o recibas una solicitud de revisión, aparecerá aquí."
              icono="notificaciones"
              titulo="No tienes notificaciones todavía."
            />
          ) : undefined
        }
        ListHeaderComponent={cabeceraLista}
        contentContainerStyle={styles.contenido}
        data={listaVisible}
        ListFooterComponent={noLeidas > 0 ? <Boton titulo="Marcar todas como leídas" variante="secundario" onPress={marcarTodasLeidas} /> : undefined}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            colors={[colores.acento]}
            onRefresh={manejarRefresh}
            refreshing={refrescando}
            tintColor={colores.acento}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <HojaAcciones
        acciones={[
          {
            etiqueta: 'Conceder',
            icono: 'hecho',
            onPress: () => establecerPermisoPushSimulado(true),
          },
          {
            etiqueta: 'Denegar',
            icono: 'cerrar',
            peligro: true,
            onPress: () => establecerPermisoPushSimulado(false),
          },
        ]}
        onCerrar={() => setHojaPermisoAbierta(false)}
        visible={hojaPermisoAbierta}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: forma.canvas,
    flex: 1,
  },
  contenidoVacioSesion: {
    padding: espaciados.lg,
  },
  contenido: {
    flexGrow: 1,
    gap: espaciados.sm,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  cabeceraLista: {
    gap: espaciados.md,
    marginBottom: espaciados.xs,
  },
  botonMarcarTodas: {
    alignItems: 'center',
    backgroundColor: forma.fill,
    borderRadius: radios.pill,
    justifyContent: 'center',
    maxWidth: 120,
    minHeight: tamanos.objetivo,
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.xs,
  },
  textoMarcarTodas: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.micro,
    lineHeight: 14,
    textAlign: 'center',
  },
  estadoCentro: {
    alignItems: 'center',
    gap: espaciados.md,
    paddingVertical: espaciados.xxl,
  },
  textoCarga: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  fila: {
    alignItems: 'center',
    borderRadius: radios.tarjeta,
    flexDirection: 'row',
    gap: espaciados.md,
    minHeight: tamanos.fila,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.md,
  },
  filaNoLeida: {
    backgroundColor: forma.paper,
  },
  filaLeida: {
    backgroundColor: forma.canvas,
  },
  presionado: {
    transform: [{ scale: 0.98 }],
  },
  indicadorColumna: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 10,
  },
  puntoNoLeida: {
    backgroundColor: forma.ink,
    borderRadius: radios.pill,
    height: 8,
    width: 8,
  },
  circuloIcono: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: tamanos.objetivo,
    justifyContent: 'center',
    width: tamanos.objetivo,
  },
  cuerpoFila: {
    flex: 1,
    gap: 2,
  },
  filaTitulo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  tituloFila: {
    color: forma.ink,
    flex: 1,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpoSm,
    lineHeight: interlineado.cuerpoSm,
  },
  fechaFila: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: interlineado.micro,
  },
  mensajeFila: {
    color: forma.muted,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: interlineado.cuerpoSm,
  },
  etiquetaSinLeer: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.micro,
    lineHeight: interlineado.micro,
    marginTop: 2,
  },
  separador: {
    backgroundColor: forma.line,
    height: 1,
    marginVertical: espaciados.xs,
  },
});
