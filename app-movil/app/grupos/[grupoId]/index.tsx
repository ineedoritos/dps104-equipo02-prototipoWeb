import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Estado, type TonoEstado } from '@/components/ui/Estado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { Seccion } from '@/components/ui/Seccion';
import { formatearDia, horaEnZona } from '@/lib/fecha';
import {
  agruparJornadas,
  derivarEstadoJornada,
  obtenerGrupoPorId,
  obtenerJornadasDeGrupo,
  obtenerMiRolEnGrupo,
  suscribirStore,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { EstadoJornada, Grupo, Jornada, RolGrupo } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

const MAPA_ESTADO_JORNADA: Record<EstadoJornada, { tono: TonoEstado; etiqueta: string }> = {
  en_curso: { tono: 'enCurso', etiqueta: 'En curso' },
  programada: { tono: 'programada', etiqueta: 'Programada' },
  finalizada: { tono: 'completada', etiqueta: 'Finalizada' },
  cancelada: { tono: 'cancelada', etiqueta: 'Cancelada' },
};

function formatearHoraCorta(iso: string): string {
  return horaEnZona(iso).slice(0, 5);
}

export default function GrupoDetalleScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const [grupo, setGrupo] = useState<Grupo | undefined>(() =>
    grupoId ? obtenerGrupoPorId(grupoId) : undefined,
  );
  const [rol, setRol] = useState<RolGrupo | null>(() =>
    grupoId ? obtenerMiRolEnGrupo(grupoId) : null,
  );
  const [jornadas, setJornadas] = useState<Jornada[]>(() =>
    grupoId ? obtenerJornadasDeGrupo(grupoId) : [],
  );
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refrescando, setRefrescando] = useState(false);

  const recargar = useCallback(() => {
    if (!grupoId) {
      return;
    }
    setGrupo(obtenerGrupoPorId(grupoId));
    setRol(obtenerMiRolEnGrupo(grupoId));
    setJornadas(obtenerJornadasDeGrupo(grupoId));
  }, [grupoId]);

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

  if (!grupo || !rol) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)')}
            style={styles.botonIcono}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
          <Text style={styles.tituloBarra}>Grupo</Text>
          <View style={styles.espacioDerecha} />
        </View>
        <View style={styles.contenido}>
          <Aviso
            accion={
              <View style={styles.accionesErrorGrupo}>
                {grupoId ? (
                  <Boton
                    onPress={() =>
                      router.replace({
                        pathname: '/(tabs)/historial',
                        params: { grupoId },
                      })
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
  const resumenConfig = `${
    grupo.modalidad_asistencia === 'qr' ? 'Asistencia por QR' : 'Asistencia manual'
  } · ${grupo.control_horas ? 'con control de horas' : 'sin control de horas'}`;

  const listaJornadas = estadoVista === 'vacio' ? [] : jornadas;
  const agrupadas = agruparJornadas(listaJornadas);

  const renderTarjetaJornada = (jornada: Jornada) => {
    const estado = derivarEstadoJornada(jornada);
    const metaEstado = MAPA_ESTADO_JORNADA[estado];
    const fechaTexto = formatearDia(jornada.inicio_en.slice(0, 10), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const esAhoraConQR =
      !esResponsable &&
      estado === 'en_curso' &&
      jornada.modalidad_asistencia === 'qr' &&
      !jornada.cancelada;

    return (
      <Pressable
        key={jornada.id}
        accessibilityRole="button"
        onPress={() => {
          if (esResponsable) {
            router.push({
              pathname: '/grupos/[grupoId]/jornadas/[jornadaId]',
              params: { grupoId: grupo.id, jornadaId: jornada.id },
            });
          } else {
            router.push({
              pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro',
              params: { grupoId: grupo.id, jornadaId: jornada.id },
            });
          }
        }}
        style={({ pressed }) => [
          styles.tarjetaJornada,
          esAhoraConQR && styles.tarjetaDestacada,
          pressed && styles.tarjetaPresionada,
        ]}
      >
        <View style={styles.filaSuperior}>
          <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
          <Estado etiqueta={metaEstado.etiqueta} tono={metaEstado.tono} />
        </View>

        <View style={styles.filaMeta}>
          <Icono color={colores.tintaSuave} nombre="reloj" tamano={15} />
          <Text style={[styles.textoHorario, cifrasTabulares]}>
            {fechaTexto} · {formatearHoraCorta(jornada.inicio_en)} – {formatearHoraCorta(jornada.fin_en)}
          </Text>
        </View>

        {jornada.cancelada ? (
          <Text style={styles.notaCancelada}>Sus registros no cuentan en los totales.</Text>
        ) : null}

        {esAhoraConQR ? (
          <View style={styles.pieDestacado}>
            <Boton
              icono="camara"
              onPress={() =>
                router.push({
                  pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/escanear-qr',
                  params: { grupoId: grupo.id, jornadaId: jornada.id },
                })
              }
              tamano="sm"
              titulo="Escanear QR"
            />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <View style={styles.barraSuperior}>
        <Pressable
          accessibilityLabel="Volver a Mis grupos"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.botonIcono}
        >
          <Icono color={colores.tinta} nombre="volver" tamano={22} />
        </Pressable>

        <View style={styles.centroBarra}>
          <Text numberOfLines={1} style={styles.tituloBarra}>
            {grupo.nombre}
          </Text>
        </View>

        {esResponsable ? (
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
            <Text style={styles.textoAjustes}>Ajustes</Text>
          </Pressable>
        ) : (
          <View style={styles.espacioDerecha} />
        )}
      </View>

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
        <View style={styles.cabeceraGrupo}>
          <View style={styles.filaRol}>
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
            <Text style={styles.resumenConfig}>{resumenConfig}</Text>
          </View>
        </View>

        {esResponsable ? (
          <View style={styles.tabsInternas}>
            <View style={[styles.tabInterna, styles.tabInternaActiva]}>
              <Text style={[styles.textoTab, styles.textoTabActiva]}>Jornadas</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/grupos/[grupoId]/integrantes',
                  params: { grupoId: grupo.id },
                })
              }
              style={styles.tabInterna}
            >
              <Text style={styles.textoTab}>Integrantes</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/grupos/[grupoId]/reportes',
                  params: { grupoId: grupo.id },
                })
              }
              style={styles.tabInterna}
            >
              <Text style={styles.textoTab}>Reportes</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tabsInternas}>
            <View style={[styles.tabInterna, styles.tabInternaActiva]}>
              <Text style={[styles.textoTab, styles.textoTabActiva]}>Jornadas</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/historial',
                  params: { grupoId: grupo.id },
                })
              }
              style={styles.tabInterna}
            >
              <Text style={styles.textoTab}>Mi historial</Text>
            </Pressable>
          </View>
        )}

        {__DEV__ ? (
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
            <Text style={styles.textoCarga}>Cargando jornadas…</Text>
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
            texto="No pudimos cargar las jornadas del grupo. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista !== 'cargando' && estadoVista !== 'error' && listaJornadas.length === 0 ? (
          <EstadoVacio
            accion={
              esResponsable ? (
                <Boton
                  icono="nueva"
                  onPress={() =>
                    router.push({
                      pathname: '/grupos/[grupoId]/jornadas/crear',
                      params: { grupoId: grupo.id },
                    })
                  }
                  titulo="Nueva jornada"
                />
              ) : undefined
            }
            descripcion="Cuando se programe una jornada en este grupo aparecerá aquí."
            icono="calendario"
            titulo="Aún no hay jornadas publicadas en este grupo."
          />
        ) : null}

        {estadoVista === 'normal' && listaJornadas.length > 0 ? (
          <View style={styles.gruposJornadas}>
            {agrupadas.hoy.length > 0 ? (
              <Seccion titulo="Hoy">
                <View style={styles.lista}>{agrupadas.hoy.map(renderTarjetaJornada)}</View>
              </Seccion>
            ) : null}

            {agrupadas.proximas.length > 0 ? (
              <Seccion titulo="Próximas">
                <View style={styles.lista}>{agrupadas.proximas.map(renderTarjetaJornada)}</View>
              </Seccion>
            ) : null}

            {agrupadas.anteriores.length > 0 ? (
              <Seccion titulo="Anteriores y canceladas">
                <View style={styles.lista}>{agrupadas.anteriores.map(renderTarjetaJornada)}</View>
              </Seccion>
            ) : null}
          </View>
        ) : null}

        {esResponsable && estadoVista === 'normal' && listaJornadas.length > 0 ? (
          <Boton
            icono="nueva"
            onPress={() =>
              router.push({
                pathname: '/grupos/[grupoId]/jornadas/crear',
                params: { grupoId: grupo.id },
              })
            }
            titulo="Nueva jornada"
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  barraSuperior: {
    alignItems: 'center',
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  botonIcono: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  centroBarra: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: espaciados.sm,
  },
  tituloBarra: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  botonAjustes: {
    borderColor: colores.bordeFuerte,
    borderRadius: radios.pill,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  textoAjustes: {
    color: colores.tinta,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
  },
  espacioDerecha: {
    width: 40,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  cabeceraGrupo: {
    gap: espaciados.xs,
  },
  filaRol: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
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
    fontWeight: pesos.fuerte,
  },
  textoResponsable: {
    color: colores.acento,
  },
  textoParticipante: {
    color: colores.completada,
  },
  resumenConfig: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  tabsInternas: {
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  tabInterna: {
    alignItems: 'center',
    borderRadius: radios.sm,
    flex: 1,
    paddingVertical: espaciados.sm,
  },
  tabInternaActiva: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
  },
  textoTab: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  textoTabActiva: {
    color: colores.tinta,
    fontWeight: pesos.fuerte,
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
  gruposJornadas: {
    gap: espaciados.lg,
  },
  lista: {
    gap: espaciados.md,
  },
  tarjetaJornada: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
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
  tituloJornada: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  filaMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  textoHorario: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  notaCancelada: {
    color: colores.ausente,
    fontSize: tipografia.micro,
  },
  tarjetaDestacada: {
    borderColor: colores.acentoBorde,
    borderWidth: 1.5,
  },
  pieDestacado: {
    marginTop: espaciados.xs,
  },
  accionesErrorGrupo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
  },
});
