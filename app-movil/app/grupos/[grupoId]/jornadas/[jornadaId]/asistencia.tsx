import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { horaEnZona } from '@/lib/fecha';
import {
  guardarAsistenciasManual,
  obtenerAsistenciasDeJornada,
  obtenerGrupoPorId,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerParticipantesActivos,
  suscribirStore,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio, type Asistencia, type EstadoAsistencia, type IntegranteConUsuario } from '@/types/dominio';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

interface BorradorFila {
  estado: EstadoAsistencia | null;
  motivoAusencia: string;
  teniaHorasRegistradas: boolean;
  resumenHoras: string | null;
}

function formatearResumenHoras(registro?: Asistencia): string | null {
  if (!registro || registro.estado !== 'presente' || !registro.hora_entrada) {
    return null;
  }
  const entrada = horaEnZona(registro.hora_entrada).slice(0, 5);
  const salida = registro.hora_salida ? horaEnZona(registro.hora_salida).slice(0, 5) : 'pendiente';
  return `Entrada ${entrada} · Salida ${salida}`;
}

export default function AsistenciaManualScreen() {
  const router = useRouter();
  const { grupoId, jornadaId } = useLocalSearchParams<{
    grupoId: string;
    jornadaId: string;
  }>();

  const [participantes, setParticipantes] = useState<IntegranteConUsuario[]>(() =>
    grupoId ? obtenerParticipantesActivos(grupoId) : [],
  );
  const [borradores, setBorradores] = useState<Record<string, BorradorFila>>({});
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [errorGuardar, setErrorGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;
  const jornada = jornadaId ? obtenerJornadaPorId(jornadaId) : undefined;

  const sincronizarDesdeStore = useCallback(() => {
    if (!grupoId || !jornadaId) {
      return;
    }
    const lista = obtenerParticipantesActivos(grupoId);
    const registros = obtenerAsistenciasDeJornada(jornadaId);
    const mapa = new Map(registros.map((r) => [r.participante_id, r]));

    const siguiente: Record<string, BorradorFila> = {};
    for (const p of lista) {
      const reg = mapa.get(p.usuario_id);
      siguiente[p.usuario_id] = {
        estado: reg?.estado ?? null,
        motivoAusencia: reg?.motivo_ausencia ?? '',
        teniaHorasRegistradas: Boolean(reg?.hora_entrada || reg?.hora_salida),
        resumenHoras: formatearResumenHoras(reg),
      };
    }

    setParticipantes(lista);
    setBorradores(siguiente);
  }, [grupoId, jornadaId]);

  useFocusEffect(
    useCallback(() => {
      sincronizarDesdeStore();
      return suscribirStore(sincronizarDesdeStore);
    }, [sincronizarDesdeStore]),
  );

  const resumenVivo = useMemo(() => {
    let presentes = 0;
    let ausentes = 0;
    let justificadas = 0;

    for (const p of participantes) {
      const estado = borradores[p.usuario_id]?.estado;
      if (estado === 'presente') {
        presentes += 1;
      } else if (estado === 'ausente') {
        ausentes += 1;
      } else if (estado === 'justificada') {
        justificadas += 1;
      }
    }
    return { presentes, ausentes, justificadas };
  }, [borradores, participantes]);

  if (!grupo || !jornada || rol !== 'responsable') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.botonIcono}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
          <Text style={styles.tituloBarra}>Asistencia</Text>
          <View style={styles.espacioDerecha} />
        </View>
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                onPress={() => router.replace('/(tabs)')}
                tamano="sm"
                titulo="Ir a Mis grupos"
                variante="secundario"
              />
            }
            texto="Solo un responsable activo puede registrar o corregir asistencias."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const seleccionarEstado = (usuarioId: string, nuevoEstado: EstadoAsistencia) => {
    setErrorGuardar('');
    setBorradores((prev) => {
      const actual = prev[usuarioId] ?? {
        estado: null,
        motivoAusencia: '',
        teniaHorasRegistradas: false,
        resumenHoras: null,
      };
      const estadoFinal = actual.estado === nuevoEstado ? null : nuevoEstado;
      return {
        ...prev,
        [usuarioId]: {
          ...actual,
          estado: estadoFinal,
          motivoAusencia: estadoFinal === 'justificada' ? actual.motivoAusencia : '',
        },
      };
    });
  };

  const cambiarMotivo = (usuarioId: string, texto: string) => {
    setErrorGuardar('');
    setBorradores((prev) => ({
      ...prev,
      [usuarioId]: {
        ...(prev[usuarioId] ?? {
          estado: 'justificada',
          motivoAusencia: '',
          teniaHorasRegistradas: false,
          resumenHoras: null,
        }),
        motivoAusencia: texto,
      },
    }));
  };

  const construirCambios = () =>
    participantes.map((p) => {
      const b = borradores[p.usuario_id];
      return {
        participanteId: p.usuario_id,
        estado: b?.estado ?? null,
        motivoAusencia: b?.motivoAusencia ?? '',
      };
    });

  const manejarGuardar = () => {
    setErrorGuardar('');
    setGuardando(true);
    try {
      guardarAsistenciasManual(jornada.id, construirCambios());
      router.back();
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorGuardar(error.message);
      } else {
        setErrorGuardar('No pudimos guardar los cambios de asistencia. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const irAAjustarHoras = (participanteId: string) => {
    setErrorGuardar('');
    try {
      guardarAsistenciasManual(jornada.id, construirCambios());
      router.push({
        pathname: '/grupos/[grupoId]/jornadas/[jornadaId]/ajustar-horas',
        params: {
          grupoId: grupo.id,
          jornadaId: jornada.id,
          participanteId,
        },
      });
    } catch (error) {
      if (error instanceof ErrorDominio) {
        setErrorGuardar(error.message);
      } else {
        setErrorGuardar('Corrige los motivos pendientes antes de ajustar horas.');
      }
    }
  };

  const listaVisible = estadoVista === 'vacio' ? [] : participantes;
  const subtituloModalidad =
    jornada.modalidad_asistencia === 'qr'
      ? 'Registrada por QR · corrección excepcional'
      : jornada.control_horas
        ? 'Manual · con horas'
        : 'Manual · sin horas';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <View style={styles.barraSuperior}>
        <Pressable
          accessibilityLabel="Volver al detalle de jornada"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.botonIcono}
        >
          <Icono color={colores.tinta} nombre="volver" tamano={22} />
        </Pressable>
        <Text numberOfLines={1} style={styles.tituloBarra}>
          Asistencia y correcciones
        </Text>
        <View style={styles.espacioDerecha} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecera}>
          <Text style={styles.tituloJornada}>{jornada.titulo}</Text>
          <Text style={[styles.subtituloJornada, cifrasTabulares]}>
            {horaEnZona(jornada.inicio_en).slice(0, 5)} – {horaEnZona(jornada.fin_en).slice(0, 5)} ·{' '}
            {subtituloModalidad}
          </Text>
          <Text style={styles.leyenda}>
            P presente · A ausente · J justificada (sin marca = sin registro)
          </Text>
        </View>

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

        {errorGuardar ? <Aviso texto={errorGuardar} tipo="error" /> : null}

        {estadoVista === 'cargando' ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator color={colores.acento} size="large" />
            <Text style={styles.textoCarga}>Cargando participantes…</Text>
          </View>
        ) : null}

        {estadoVista === 'error' ? (
          <Aviso
            accion={
              <Boton
                onPress={() => {
                  setEstadoVista('normal');
                  sincronizarDesdeStore();
                }}
                tamano="sm"
                titulo="Reintentar"
                variante="secundario"
              />
            }
            texto="No pudimos cargar la lista de asistencia. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista !== 'cargando' && estadoVista !== 'error' && listaVisible.length === 0 ? (
          <EstadoVacio
            descripcion="Agrega integrantes con rol participante al grupo para poder pasar lista."
            icono="gente"
            titulo="Este grupo no tiene participantes activos"
          />
        ) : null}

        {estadoVista === 'normal' && listaVisible.length > 0 ? (
          <View style={styles.lista}>
            {listaVisible.map((integrante) => {
              const borrador = borradores[integrante.usuario_id] ?? {
                estado: null,
                motivoAusencia: '',
                teniaHorasRegistradas: false,
                resumenHoras: null,
              };
              const mostraraLimpiezaHoras =
                borrador.teniaHorasRegistradas &&
                (borrador.estado === 'ausente' || borrador.estado === 'justificada');

              return (
                <View key={integrante.id} style={styles.tarjetaParticipante}>
                  <View style={styles.filaParticipante}>
                    <View style={styles.infoParticipante}>
                      <Text style={styles.nombreParticipante}>{integrante.usuario.nombre}</Text>
                      <Text style={styles.correoParticipante}>{integrante.usuario.correo}</Text>
                    </View>

                    <View style={styles.grupoBotonesEstado}>
                      {(
                        [
                          { codigo: 'P', estado: 'presente' as const },
                          { codigo: 'A', estado: 'ausente' as const },
                          { codigo: 'J', estado: 'justificada' as const },
                        ] as const
                      ).map((item) => {
                        const activo = borrador.estado === item.estado;
                        return (
                          <Pressable
                            key={item.codigo}
                            accessibilityLabel={`${item.codigo} para ${integrante.usuario.nombre}`}
                            accessibilityRole="button"
                            onPress={() => seleccionarEstado(integrante.usuario_id, item.estado)}
                            style={[
                              styles.botonLetra,
                              activo && item.estado === 'presente' && styles.botonPresente,
                              activo && item.estado === 'ausente' && styles.botonAusente,
                              activo && item.estado === 'justificada' && styles.botonJustificada,
                            ]}
                          >
                            <Text
                              style={[
                                styles.textoBotonLetra,
                                activo && item.estado === 'presente' && styles.textoPresente,
                                activo && item.estado === 'ausente' && styles.textoAusente,
                                activo && item.estado === 'justificada' && styles.textoJustificada,
                              ]}
                            >
                              {item.codigo}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {borrador.estado === 'justificada' ? (
                    <CampoTexto
                      etiqueta="Motivo de la ausencia"
                      onChangeText={(texto) => cambiarMotivo(integrante.usuario_id, texto)}
                      placeholder="Ej. Cita médica o examen académico"
                      value={borrador.motivoAusencia}
                    />
                  ) : null}

                  {mostraraLimpiezaHoras ? (
                    <Text style={styles.advertenciaLimpieza}>
                      Al guardar como ausencia, se limpiarán las horas registradas de este
                      participante.
                    </Text>
                  ) : null}

                  {borrador.estado === 'presente' && jornada.control_horas ? (
                    <View style={styles.filaHoras}>
                      <Text style={[styles.textoResumenHoras, cifrasTabulares]}>
                        {borrador.resumenHoras ?? 'Sin horas registradas'}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => irAAjustarHoras(integrante.usuario_id)}
                        style={styles.enlaceHoras}
                      >
                        <Text style={styles.textoEnlaceHoras}>Registrar / Ajustar horas ›</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {estadoVista === 'normal' && listaVisible.length > 0 ? (
        <View style={styles.pie}>
          <Text style={[styles.resumenPie, cifrasTabulares]}>
            {resumenVivo.presentes} presentes · {resumenVivo.ausentes} ausentes ·{' '}
            {resumenVivo.justificadas} justificadas
          </Text>
          <Boton
            cargando={guardando}
            deshabilitado={jornada.cancelada}
            onPress={manejarGuardar}
            titulo="Guardar cambios"
          />
        </View>
      ) : null}
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
    backgroundColor: colores.superficie,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.sm,
  },
  botonIcono: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  tituloBarra: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  espacioDerecha: {
    width: 44,
  },
  contenido: {
    gap: espaciados.md,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  cabecera: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.xs,
    padding: espaciados.lg,
  },
  tituloJornada: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  subtituloJornada: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  leyenda: {
    color: colores.tintaTenue,
    fontSize: tipografia.micro,
    marginTop: espaciados.xs,
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
    gap: espaciados.sm,
  },
  tarjetaParticipante: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  filaParticipante: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  infoParticipante: {
    flex: 1,
    gap: 2,
  },
  nombreParticipante: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  correoParticipante: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
  },
  grupoBotonesEstado: {
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  botonLetra: {
    alignItems: 'center',
    backgroundColor: colores.papel,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  botonPresente: {
    backgroundColor: colores.presenteSuave,
    borderColor: colores.acentoBorde,
  },
  botonAusente: {
    backgroundColor: colores.ausenteSuave,
    borderColor: colores.ausente,
  },
  botonJustificada: {
    backgroundColor: colores.justificadaSuave,
    borderColor: colores.justificada,
  },
  textoBotonLetra: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  textoPresente: {
    color: colores.presente,
  },
  textoAusente: {
    color: colores.ausente,
  },
  textoJustificada: {
    color: colores.justificada,
  },
  advertenciaLimpieza: {
    color: colores.justificada,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  filaHoras: {
    alignItems: 'center',
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
    justifyContent: 'space-between',
    paddingTop: espaciados.sm,
  },
  textoResumenHoras: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  enlaceHoras: {
    paddingVertical: espaciados.xs,
  },
  textoEnlaceHoras: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  pie: {
    backgroundColor: colores.superficie,
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  resumenPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
    textAlign: 'center',
  },
});
