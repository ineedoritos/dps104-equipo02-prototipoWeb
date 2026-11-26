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

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { Estado, type TonoEstado } from '@/components/ui/Estado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Seccion } from '@/components/ui/Seccion';
import { fechaEnZona, formatearDia, formatearDuracion } from '@/lib/fecha';
import {
  obtenerMiHistorial,
  obtenerMisGruposParaHistorial,
  obtenerSesionActual,
  suscribirStore,
} from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { RegistroHistorial } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

interface GrupoMes {
  clave: string;
  titulo: string;
  items: RegistroHistorial[];
}

function agruparPorMes(registros: RegistroHistorial[]): GrupoMes[] {
  const mapa = new Map<string, GrupoMes>();

  for (const item of registros) {
    const fechaISO = fechaEnZona(item.jornada.inicio_en);
    const clave = fechaISO.slice(0, 7);
    let grupoMes = mapa.get(clave);
    if (!grupoMes) {
      const etiqueta = formatearDia(fechaISO, { month: 'long', year: 'numeric' });
      const titulo = etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
      grupoMes = { clave, titulo, items: [] };
      mapa.set(clave, grupoMes);
    }
    grupoMes.items.push(item);
  }

  return Array.from(mapa.values());
}

function obtenerBadgeRegistro(item: RegistroHistorial): { tono: TonoEstado; etiqueta: string } {
  if (item.jornada.cancelada) {
    return { tono: 'cancelada', etiqueta: 'Cancelada · no cuenta' };
  }
  const { asistencia, jornada } = item;
  if (asistencia.estado === 'presente') {
    const fueAjustada =
      jornada.control_horas &&
      asistencia.duracion_minutos !== null &&
      asistencia.minutos_reconocidos !== null &&
      asistencia.minutos_reconocidos < asistencia.duracion_minutos;
    if (fueAjustada) {
      return { tono: 'justificada', etiqueta: 'Ajustada' };
    }
    return { tono: 'presente', etiqueta: 'Presente' };
  }
  if (asistencia.estado === 'justificada') {
    return { tono: 'justificada', etiqueta: 'Justificada' };
  }
  return { tono: 'ausente', etiqueta: 'Ausente' };
}

export default function MiHistorialScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId?: string }>();

  const grupoIdParam = typeof grupoId === 'string' && grupoId.length > 0 ? grupoId : undefined;
  const [prevGrupoIdParam, setPrevGrupoIdParam] = useState<string | undefined>(grupoIdParam);
  const [filtroGrupoId, setFiltroGrupoId] = useState<string | undefined>(grupoIdParam);
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [refrescando, setRefrescando] = useState(false);
  const [tick, setTick] = useState(0);

  if (grupoIdParam !== prevGrupoIdParam) {
    setPrevGrupoIdParam(grupoIdParam);
    setFiltroGrupoId(grupoIdParam);
  }

  const recargar = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
      return suscribirStore(recargar);
    }, [recargar]),
  );

  void tick;
  const sesion = obtenerSesionActual();
  const gruposFiltro = obtenerMisGruposParaHistorial();
  const grupoSeleccionadoId = gruposFiltro.find(({ grupo }) => grupo.id === filtroGrupoId)?.grupo.id;
  const resumen = obtenerMiHistorial(grupoSeleccionadoId);

  const manejarRefresh = () => {
    setRefrescando(true);
    setTimeout(() => {
      setEstadoVista('normal');
      recargar();
      setRefrescando(false);
    }, 250);
  };

  if (!sesion) {
    return (
      <View style={styles.pantalla}>
        <BarraSuperior mostrarVolver={false} titulo="Mi historial" />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                icono="entrar"
                onPress={() => router.replace('/(auth)/login')}
                tamano="sm"
                titulo="Iniciar sesión"
              />
            }
            texto="Inicia sesión para consultar tus registros de participación."
            tipo="info"
          />
        </View>
      </View>
    );
  }

  const registrosVisibles = estadoVista === 'vacio' ? [] : resumen.registros;
  const meses = agruparPorMes(registrosVisibles);

  return (
    <View style={styles.pantalla}>
      <BarraSuperior mostrarVolver={false} titulo="Mi historial" />

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
        <ScrollView
          contentContainerStyle={styles.filtrosGrupo}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !grupoSeleccionadoId }}
            onPress={() => setFiltroGrupoId(undefined)}
            style={[styles.chipFiltro, !grupoSeleccionadoId && styles.chipFiltroActivo]}
          >
            <Text style={[styles.textoChipFiltro, !grupoSeleccionadoId && styles.textoChipFiltroActivo]}>
              Todos
            </Text>
          </Pressable>

          {gruposFiltro.map(({ grupo, retirado }) => {
            const activo = grupoSeleccionadoId === grupo.id;
            return (
              <Pressable
                key={grupo.id}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                onPress={() => setFiltroGrupoId(grupo.id)}
                style={[styles.chipFiltro, activo && styles.chipFiltroActivo]}
              >
                <Text style={[styles.textoChipFiltro, activo && styles.textoChipFiltroActivo]}>
                  {retirado ? `${grupo.nombre} (Retirado)` : grupo.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
            <Text style={styles.textoCarga}>Cargando historial…</Text>
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
            texto="No pudimos cargar tu historial. Revisa tu conexión e intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista !== 'cargando' && estadoVista !== 'error' && registrosVisibles.length === 0 ? (
          <EstadoVacio
            descripcion="Cuando participes en una jornada aparecerá tu registro aquí."
            icono="reloj"
            titulo="Todavía no tienes registros de participación"
          />
        ) : null}

        {estadoVista === 'normal' && registrosVisibles.length > 0 ? (
          <>
            <View style={styles.gridResumen}>
              <View style={styles.tarjetaResumen}>
                <Text style={styles.etiquetaResumen}>Asistencia</Text>
                <Text style={[styles.valorResumen, cifrasTabulares]}>
                  {resumen.tasaAsistencia !== null ? `${resumen.tasaAsistencia}%` : '—'}
                </Text>
                <Text style={[styles.desgloseResumen, cifrasTabulares]}>
                  {resumen.presentes} presentes · {resumen.justificadas} justificadas ·{' '}
                  {resumen.ausentes} ausentes
                </Text>
              </View>

              {resumen.aplicaControlHoras ? (
                <View style={[styles.tarjetaResumen, styles.resumenHoras]}>
                  <Text style={styles.etiquetaResumen}>Horas</Text>
                  <View style={styles.filaHoras}>
                    <View style={styles.datoHora}>
                      <Text style={styles.etiquetaDato}>Registradas</Text>
                      <Text style={[styles.valorHora, cifrasTabulares]}>
                        {formatearDuracion(resumen.minutosRegistrados)}
                      </Text>
                    </View>
                    <View style={styles.datoHora}>
                      <Text style={styles.etiquetaDato}>Reconocidas</Text>
                      <Text style={[styles.valorHora, cifrasTabulares]}>
                        {formatearDuracion(resumen.minutosReconocidos)}
                      </Text>
                    </View>
                    {resumen.minutosPendientes > 0 ? (
                      <View style={styles.datoHora}>
                        <Text style={styles.etiquetaDato}>Pendientes</Text>
                        <Text style={[styles.valorHora, cifrasTabulares]}>
                          {formatearDuracion(resumen.minutosPendientes)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.listaMeses}>
              {meses.map((mes) => (
                <Seccion key={mes.clave} titulo={mes.titulo}>
                  <View style={styles.listaRegistros}>
                    {mes.items.map((item) => {
                      const badge = obtenerBadgeRegistro(item);
                      const fechaTexto = formatearDia(fechaEnZona(item.jornada.inicio_en), {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      });
                      const tieneAjuste =
                        !item.jornada.cancelada &&
                        item.jornada.control_horas &&
                        item.asistencia.estado === 'presente' &&
                        item.asistencia.duracion_minutos !== null &&
                        item.asistencia.minutos_reconocidos !== null &&
                        item.asistencia.minutos_reconocidos < item.asistencia.duracion_minutos;

                      return (
                        <Pressable
                          key={item.asistencia.id}
                          accessibilityRole="button"
                          onPress={() =>
                            router.push({
                              pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/mi-registro',
                              params: {
                                grupoId: item.grupo.id,
                                jornadaId: item.jornada.id,
                              },
                            })
                          }
                          style={({ pressed }) => [
                            styles.tarjetaRegistro,
                            pressed && styles.tarjetaPresionada,
                          ]}
                        >
                          <View style={styles.filaSuperior}>
                            <Text style={styles.tituloJornada}>{item.jornada.titulo}</Text>
                            <Estado etiqueta={badge.etiqueta} tono={badge.tono} />
                          </View>

                          <Text style={styles.metaRegistro}>
                            {item.grupo.nombre} · {fechaTexto}
                          </Text>

                          {item.asistencia.estado === 'justificada' &&
                          item.asistencia.motivo_ausencia ? (
                            <Text style={styles.notaDetalle}>
                              Motivo: {item.asistencia.motivo_ausencia}
                            </Text>
                          ) : null}

                          {tieneAjuste ? (
                            <Text style={[styles.notaAjuste, cifrasTabulares]}>
                              Registrado: {formatearDuracion(item.asistencia.duracion_minutos)} ·
                              Reconocido: {formatearDuracion(item.asistencia.minutos_reconocidos)}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </Seccion>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
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
  filtrosGrupo: {
    gap: espaciados.sm,
  },
  chipFiltro: {
    justifyContent: 'center',
    minHeight: 48,
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  chipFiltroActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoChipFiltro: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  textoChipFiltroActivo: {
    color: colores.acento,
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
  gridResumen: {
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.tarjeta,
    paddingHorizontal: espaciados.lg,
  },
  tarjetaResumen: {
    gap: espaciados.xs,
    paddingVertical: espaciados.lg,
  },
  resumenHoras: {
    borderTopColor: colores.borde,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  etiquetaResumen: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  valorResumen: {
    color: colores.tinta,
    fontSize: tipografia.display,
    fontWeight: pesos.encabezado,
  },
  desgloseResumen: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  filaHoras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.lg,
    marginTop: espaciados.xs,
  },
  datoHora: {
    gap: 2,
  },
  etiquetaDato: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
  },
  valorHora: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  listaMeses: {
    gap: espaciados.lg,
  },
  listaRegistros: {
    borderTopColor: colores.borde,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tarjetaRegistro: {
    borderBottomColor: colores.borde,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: espaciados.xs,
    minHeight: 48,
    paddingVertical: espaciados.md,
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
  metaRegistro: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  notaDetalle: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    marginTop: espaciados.xs,
  },
  notaAjuste: {
    color: colores.justificada,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
    marginTop: espaciados.xs,
  },
});
