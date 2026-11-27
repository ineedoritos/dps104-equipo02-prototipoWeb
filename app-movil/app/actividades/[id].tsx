import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import {
  ESTADO_ASISTENCIA,
  ESTADO_JORNADA,
  Estado,
  coloresDeEstado,
} from '@/components/ui/Estado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { formatearDia } from '@/lib/fecha';
import {
  guardarAsistenciasActividad,
  obtenerActividadPorId,
  obtenerAsistenciasActividad,
  obtenerParticipantes,
} from '@/lib/mockStore';
import { cifrasTabulares, colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import type { EstadoAsistencia, RegistroAsistencia } from '@/types/actividad';

type MapaAsistencia = Record<number, { estado?: EstadoAsistencia; motivo: string }>;
type PestanaActividad = 'asistencia' | 'reporte';

const OPCIONES: { estado: EstadoAsistencia; letra: string }[] = [
  { estado: 'presente', letra: 'P' },
  { estado: 'ausente', letra: 'A' },
  { estado: 'justificada', letra: 'J' },
];

export default function ActividadDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const actividadId = Number(id);

  const actividad = obtenerActividadPorId(actividadId);
  const participantes = obtenerParticipantes();

  const [pestana, setPestana] = useState<PestanaActividad>('asistencia');
  const [mapa, setMapa] = useState<MapaAsistencia>(() => {
    const iniciales: MapaAsistencia = {};
    const guardados = obtenerAsistenciasActividad(actividadId);

    for (const p of participantes) {
      const registro = guardados.find((r) => r.participanteId === p.id);
      iniciales[p.id] = {
        estado: registro?.estado,
        motivo: registro?.motivo ?? '',
      };
    }

    return iniciales;
  });

  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const resumen = useMemo(() => {
    let presentes = 0;
    let ausentes = 0;
    let justificadas = 0;

    for (const item of Object.values(mapa)) {
      if (item.estado === 'presente') presentes += 1;
      if (item.estado === 'ausente') ausentes += 1;
      if (item.estado === 'justificada') justificadas += 1;
    }

    const total = presentes + ausentes + justificadas;
    const tasa = total > 0 ? `${Math.round((presentes / total) * 100)}%` : '—';

    return { presentes, ausentes, justificadas, total, tasa };
  }, [mapa]);

  if (!actividad) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
        <View style={styles.vacioContenedor}>
          <EstadoVacio
            accion={
              <Boton onPress={() => router.back()} titulo="Volver" variante="secundario" />
            }
            descripcion="Puede que se haya eliminado o que el enlace ya no sea válido."
            icono="alerta"
            titulo="Jornada no encontrada"
          />
        </View>
      </SafeAreaView>
    );
  }

  const estadoJornada = ESTADO_JORNADA[actividad.status];

  const seleccionarEstado = (participanteId: number, estado: EstadoAsistencia) => {
    setError('');
    setAviso('');
    setMapa((previo) => {
      const actual = previo[participanteId] ?? { motivo: '' };
      const nuevoEstado = actual.estado === estado ? undefined : estado;
      return {
        ...previo,
        [participanteId]: {
          estado: nuevoEstado,
          motivo: nuevoEstado === 'justificada' ? actual.motivo : '',
        },
      };
    });
  };

  const cambiarMotivo = (participanteId: number, motivo: string) => {
    setError('');
    setAviso('');
    setMapa((previo) => ({
      ...previo,
      [participanteId]: {
        ...(previo[participanteId] ?? { motivo: '' }),
        motivo,
      },
    }));
  };

  const manejarGuardar = () => {
    const registros: RegistroAsistencia[] = [];

    for (const p of participantes) {
      const item = mapa[p.id];
      if (!item?.estado) {
        continue;
      }

      if (item.estado === 'justificada' && !item.motivo.trim()) {
        setError(`Ingresa el motivo de la ausencia justificada de ${p.nombre}.`);
        setAviso('');
        return;
      }

      registros.push({
        actividadId,
        participanteId: p.id,
        estado: item.estado,
        motivo: item.estado === 'justificada' ? item.motivo.trim() : undefined,
      });
    }

    guardarAsistenciasActividad(actividadId, registros);
    setError('');
    setAviso('Asistencia guardada. Los datos de la jornada se actualizaron.');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={4}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.botonVolver, pressed && styles.presionado]}
        >
          <Icono color={colores.acento} nombre="volver" tamano={18} />
          <Text style={styles.textoVolver}>Volver</Text>
        </Pressable>

        <View style={styles.encabezado}>
          <Estado etiqueta={estadoJornada.etiqueta} tono={estadoJornada.tono} />

          <Text accessibilityRole="header" style={styles.titulo}>
            {actividad.title}
          </Text>

          {actividad.description ? (
            <Text style={styles.descripcionJornada}>{actividad.description}</Text>
          ) : null}

          <View style={styles.metaGrupo}>
            <View style={styles.meta}>
              <Icono color={colores.tintaSuave} nombre="calendario" tamano={16} />
              <Text style={styles.metaTexto}>
                {formatearDia(actividad.date, {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
              </Text>
            </View>

            <View style={styles.meta}>
              <Icono color={colores.tintaSuave} nombre="reloj" tamano={16} />
              <Text style={[styles.metaTexto, cifrasTabulares]}>
                {actividad.startTime}
                {actividad.endTime ? ` – ${actividad.endTime}` : ''}
              </Text>
            </View>

            <View style={styles.meta}>
              <Icono color={colores.tintaSuave} nombre="lugar" tamano={16} />
              <Text style={styles.metaTexto}>{actividad.location}</Text>
            </View>
          </View>
        </View>

        <View accessibilityRole="tablist" style={styles.pestanas}>
          <Pressable
            accessibilityLabel="Asistencia"
            accessibilityRole="tab"
            accessibilityState={{ selected: pestana === 'asistencia' }}
            onPress={() => setPestana('asistencia')}
            style={[styles.pestana, pestana === 'asistencia' && styles.pestanaActiva]}
          >
            <Text
              style={[styles.pestanaTexto, pestana === 'asistencia' && styles.pestanaTextoActiva]}
            >
              Asistencia
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Reporte"
            accessibilityRole="tab"
            accessibilityState={{ selected: pestana === 'reporte' }}
            onPress={() => setPestana('reporte')}
            style={[styles.pestana, pestana === 'reporte' && styles.pestanaActiva]}
          >
            <Text
              style={[styles.pestanaTexto, pestana === 'reporte' && styles.pestanaTextoActiva]}
            >
              Reporte
            </Text>
          </Pressable>
        </View>

        {pestana === 'asistencia' ? (
          <View style={styles.tarjeta}>
            <View style={styles.tituloFila}>
              <Text style={styles.tituloSeccion}>Participantes</Text>
              <Text style={styles.leyenda}>P presente · A ausente · J justificada</Text>
            </View>

            <View style={styles.lista}>
              {participantes.map((participante) => {
                const item = mapa[participante.id] ?? { motivo: '' };

                return (
                  <View key={participante.id} style={styles.filaParticipante}>
                    <View style={styles.filaSuperior}>
                      <View style={styles.infoParticipante}>
                        <Text numberOfLines={1} style={styles.nombreParticipante}>
                          {participante.nombre}
                        </Text>
                        <Text numberOfLines={1} style={styles.correoParticipante}>
                          {participante.correo}
                        </Text>
                      </View>

                      <View style={styles.grupoBotones}>
                        {OPCIONES.map((opcion) => {
                          const activo = item.estado === opcion.estado;
                          const paleta = coloresDeEstado(ESTADO_ASISTENCIA[opcion.estado].tono);

                          return (
                            <Pressable
                              accessibilityLabel={`${ESTADO_ASISTENCIA[opcion.estado].etiqueta} para ${participante.nombre}`}
                              accessibilityRole="button"
                              accessibilityState={{ selected: activo }}
                              key={opcion.estado}
                              onPress={() => seleccionarEstado(participante.id, opcion.estado)}
                              style={({ pressed }) => [
                                styles.botonEstado,
                                activo && {
                                  backgroundColor: paleta.fondo,
                                  borderColor: paleta.texto,
                                  borderWidth: 2,
                                },
                                pressed && styles.presionado,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.textoEstado,
                                  activo && { color: paleta.texto, fontFamily: fuentes.fuerte },
                                ]}
                              >
                                {opcion.letra}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    {item.estado === 'justificada' ? (
                      <CampoTexto
                        estilo={styles.campoMotivo}
                        etiqueta="Motivo de la ausencia"
                        onChangeText={(texto) => cambiarMotivo(participante.id, texto)}
                        placeholder="Ej. Cita médica"
                        value={item.motivo}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={styles.resumen}>
              <View style={styles.resumenItem}>
                <View style={[styles.punto, { backgroundColor: colores.presente }]} />
                <Text style={styles.resumenTexto}>
                  <Text style={styles.resumenNumero}>{resumen.presentes}</Text> presentes
                </Text>
              </View>
              <View style={styles.resumenItem}>
                <View style={[styles.punto, { backgroundColor: colores.ausente }]} />
                <Text style={styles.resumenTexto}>
                  <Text style={styles.resumenNumero}>{resumen.ausentes}</Text> ausentes
                </Text>
              </View>
              <View style={styles.resumenItem}>
                <View style={[styles.punto, { backgroundColor: colores.justificada }]} />
                <Text style={styles.resumenTexto}>
                  <Text style={styles.resumenNumero}>{resumen.justificadas}</Text> justificadas
                </Text>
              </View>
            </View>

            {error ? <Aviso texto={error} tipo="error" /> : null}
            {aviso ? <Aviso texto={aviso} tipo="exito" /> : null}

            <Boton onPress={manejarGuardar} titulo="Guardar asistencia" />
          </View>
        ) : (
          <View style={styles.tarjeta}>
            <View style={styles.reporteEncabezado}>
              <View style={styles.reporteTitulos}>
                <Text style={styles.tituloSeccion}>Reporte de la jornada</Text>
                <Text style={styles.leyenda}>
                  {resumen.total} de {participantes.length} participantes con registro
                </Text>
              </View>
              <View style={styles.tasaBloque}>
                <Text style={styles.etiquetaTasa}>Asistencia</Text>
                <Text style={styles.tasaGrande}>{resumen.tasa}</Text>
              </View>
            </View>

            {resumen.total === 0 ? (
              <Aviso
                texto="Todavía no hay registros de asistencia en esta jornada."
                tipo="info"
              />
            ) : (
              <>
                <View style={styles.barraContenedor}>
                  {resumen.presentes > 0 ? (
                    <View
                      style={[
                        styles.barraSegmento,
                        { backgroundColor: colores.presente, flex: resumen.presentes },
                      ]}
                    />
                  ) : null}
                  {resumen.justificadas > 0 ? (
                    <View
                      style={[
                        styles.barraSegmento,
                        { backgroundColor: colores.justificada, flex: resumen.justificadas },
                      ]}
                    />
                  ) : null}
                  {resumen.ausentes > 0 ? (
                    <View
                      style={[
                        styles.barraSegmento,
                        { backgroundColor: colores.ausente, flex: resumen.ausentes },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.leyendaColores}>
                  <View style={styles.leyendaItem}>
                    <View style={[styles.punto, { backgroundColor: colores.presente }]} />
                    <Text style={styles.leyendaItemTexto}>Presentes: {resumen.presentes}</Text>
                  </View>
                  <View style={styles.leyendaItem}>
                    <View style={[styles.punto, { backgroundColor: colores.justificada }]} />
                    <Text style={styles.leyendaItemTexto}>
                      Justificadas: {resumen.justificadas}
                    </Text>
                  </View>
                  <View style={styles.leyendaItem}>
                    <View style={[styles.punto, { backgroundColor: colores.ausente }]} />
                    <Text style={styles.leyendaItemTexto}>Ausentes: {resumen.ausentes}</Text>
                  </View>
                </View>

                <View style={styles.lista}>
                  {participantes.map((participante) => {
                    const item = mapa[participante.id];
                    const estadoAsistencia = item?.estado
                      ? ESTADO_ASISTENCIA[item.estado]
                      : undefined;

                    return (
                      <View key={participante.id} style={styles.filaReporte}>
                        <View style={styles.infoParticipante}>
                          <Text numberOfLines={1} style={styles.nombreParticipante}>
                            {participante.nombre}
                          </Text>
                          {item?.estado === 'justificada' && item.motivo.trim() ? (
                            <Text numberOfLines={2} style={styles.motivoReporte}>
                              Motivo: {item.motivo.trim()}
                            </Text>
                          ) : null}
                        </View>
                        <Estado
                          etiqueta={estadoAsistencia?.etiqueta}
                          tono={estadoAsistencia?.tono ?? 'sinRegistro'}
                        />
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.notaPie}>
                  La tasa cuenta solo a quienes tienen registro. Las ausencias justificadas
                  mantienen su motivo visible.
                </Text>
              </>
            )}
          </View>
        )}
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
    flexGrow: 1,
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  vacioContenedor: {
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  botonVolver: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: espaciados.xs,
    minHeight: 44,
  },
  presionado: {
    opacity: 0.75,
  },
  textoVolver: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
  },
  encabezado: {
    gap: espaciados.sm,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.display,
    fontFamily: fuentes.fuerte,
    letterSpacing: -0.4,
    lineHeight: tipografia.display + 4,
  },
  descripcionJornada: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  metaGrupo: {
    gap: espaciados.xs,
    marginTop: espaciados.xs,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  metaTexto: {
    color: colores.tintaSuave,
    flex: 1,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 18,
  },
  pestanas: {
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.campo,
    flexDirection: 'row',
    padding: 4,
  },
  pestana: {
    alignItems: 'center',
    borderRadius: radios.campo - 4,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  pestanaActiva: {
    backgroundColor: colores.acento,
  },
  pestanaTexto: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.medio,
  },
  pestanaTextoActiva: {
    color: colores.superficie,
    fontFamily: fuentes.fuerte,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  tituloFila: {
    gap: espaciados.xs,
  },
  tituloSeccion: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  leyenda: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 15,
  },
  lista: {
    marginTop: espaciados.xs,
  },
  filaParticipante: {
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    paddingVertical: espaciados.md,
  },
  filaSuperior: {
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
    fontFamily: fuentes.medio,
  },
  correoParticipante: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  grupoBotones: {
    flexDirection: 'row',
    gap: 6,
  },
  botonEstado: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.campo,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  textoEstado: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.medio,
  },
  campoMotivo: {
    marginTop: espaciados.sm,
  },
  resumen: {
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.md,
    paddingTop: espaciados.md,
  },
  resumenItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs + 2,
  },
  punto: {
    borderRadius: radios.pill,
    height: 8,
    width: 8,
  },
  resumenTexto: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  resumenNumero: {
    ...cifrasTabulares,
    color: colores.tinta,
    fontFamily: fuentes.fuerte,
  },
  reporteEncabezado: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espaciados.md,
    justifyContent: 'space-between',
  },
  reporteTitulos: {
    flex: 1,
    gap: 2,
  },
  tasaBloque: {
    alignItems: 'flex-end',
  },
  etiquetaTasa: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tasaGrande: {
    ...cifrasTabulares,
    color: colores.tinta,
    fontSize: tipografia.display,
    fontFamily: fuentes.fuerte,
    letterSpacing: -0.4,
  },
  barraContenedor: {
    backgroundColor: colores.borde,
    borderRadius: radios.pill,
    flexDirection: 'row',
    height: 12,
    marginTop: espaciados.xs,
    overflow: 'hidden',
  },
  barraSegmento: {
    height: '100%',
  },
  leyendaColores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.md,
  },
  leyendaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs + 2,
  },
  leyendaItemTexto: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.medio,
  },
  filaReporte: {
    alignItems: 'center',
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
    paddingVertical: espaciados.md,
  },
  motivoReporte: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
});
