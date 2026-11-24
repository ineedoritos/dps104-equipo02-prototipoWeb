import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DatePickerField } from '@/components/ui/DatePickerField';
import {
  obtenerActividades,
  obtenerParticipantes,
  obtenerTodasLasAsistencias,
} from '@/lib/mockStore';
import { colores, espaciados, radios } from '@/lib/tema';
import type { Actividad, RegistroAsistencia } from '@/types/actividad';

type Periodo = '7d' | 'mes' | 'todo' | 'rango';

const PERIODOS: { id: Periodo; etiqueta: string }[] = [
  { id: '7d', etiqueta: '7 días' },
  { id: 'mes', etiqueta: 'Este mes' },
  { id: 'todo', etiqueta: 'Todo' },
  { id: 'rango', etiqueta: 'Rango' },
];

export default function ReportesScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('todo');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>(() => obtenerActividades());
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>(() =>
    obtenerTodasLasAsistencias(),
  );

  const participantes = obtenerParticipantes();

  useFocusEffect(
    useCallback(() => {
      setActividades(obtenerActividades());
      setAsistencias(obtenerTodasLasAsistencias());
    }, []),
  );

  const actividadesEnPeriodo = useMemo(() => {
    const hoy = dayjs();
    return actividades.filter((actividad) => {
      if (periodo === '7d') {
        const limite = hoy.subtract(7, 'day').format('YYYY-MM-DD');
        return actividad.date >= limite;
      }
      if (periodo === 'mes') {
        const inicioMes = hoy.startOf('month').format('YYYY-MM-DD');
        return actividad.date >= inicioMes;
      }
      if (periodo === 'rango') {
        const okDesde = !desde || actividad.date >= desde;
        const okHasta = !hasta || actividad.date <= hasta;
        return okDesde && okHasta;
      }
      return true;
    });
  }, [actividades, periodo, desde, hasta]);

  const idsPermitidos = useMemo(
    () => new Set(actividadesEnPeriodo.map((actividad) => actividad.id)),
    [actividadesEnPeriodo],
  );

  const asistenciasFiltradas = useMemo(
    () => asistencias.filter((registro) => idsPermitidos.has(registro.actividadId)),
    [asistencias, idsPermitidos],
  );

  const totales = useMemo(() => {
    let presentes = 0;
    let justificadas = 0;
    let sinMotivo = 0;

    for (const registro of asistenciasFiltradas) {
      if (registro.estado === 'presente') {
        presentes += 1;
      } else if (registro.estado === 'justificada') {
        justificadas += 1;
      } else {
        sinMotivo += 1;
      }
    }

    return {
      presentes,
      justificadas,
      sinMotivo,
      total: presentes + justificadas + sinMotivo,
    };
  }, [asistenciasFiltradas]);

  const filasParticipantes = useMemo(() => {
    return participantes.map((participante) => {
      const propios = asistenciasFiltradas.filter(
        (registro) => registro.participanteId === participante.id,
      );
      const presentes = propios.filter((r) => r.estado === 'presente').length;
      const justificadas = propios.filter((r) => r.estado === 'justificada');
      const sinMotivo = propios.filter((r) => r.estado === 'ausente').length;
      const ausenciasTotales = justificadas.length + sinMotivo;
      const denominador = presentes + ausenciasTotales;
      const tasa = denominador > 0 ? `${Math.round((presentes / denominador) * 100)}%` : '—';

      return {
        participante,
        presentes,
        ausenciasTotales,
        justificadas,
        sinMotivo,
        tasa,
      };
    });
  }, [participantes, asistenciasFiltradas]);

  return (
    <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
      <View style={styles.tarjeta}>
        <Text style={styles.tituloSeccion}>Período</Text>
        <View style={styles.chips}>
          {PERIODOS.map((item) => {
            const activo = periodo === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setPeriodo(item.id)}
                style={[styles.chip, activo && styles.chipActivo]}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                  {item.etiqueta}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {periodo === 'rango' ? (
          <View style={styles.filaFechas}>
            <View style={styles.campoMitad}>
              <DatePickerField
                label="Desde"
                maxDate={hasta || undefined}
                onChange={setDesde}
                value={desde}
              />
            </View>
            <View style={styles.campoMitad}>
              <DatePickerField
                label="Hasta"
                minDate={desde || undefined}
                onChange={setHasta}
                value={hasta}
              />
            </View>
          </View>
        ) : null}
      </View>

      {totales.total === 0 ? (
        <View style={styles.estadoVacio}>
          <Text style={styles.estadoVacioTitulo}>
            No hay registros de asistencia en el período seleccionado
          </Text>
          <Text style={styles.estadoVacioTexto}>
            Prueba seleccionando «Todo» o registra asistencia en una actividad.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>Resumen de participación</Text>
            <Text style={styles.subtitulo}>
              {actividadesEnPeriodo.length} actividades · {totales.total} registros
            </Text>

            <View style={styles.barraContenedor}>
              {totales.presentes > 0 ? (
                <View style={[styles.barraSegmento, styles.barraPresente, { flex: totales.presentes }]} />
              ) : null}
              {totales.justificadas > 0 ? (
                <View
                  style={[styles.barraSegmento, styles.barraJustificada, { flex: totales.justificadas }]}
                />
              ) : null}
              {totales.sinMotivo > 0 ? (
                <View style={[styles.barraSegmento, styles.barraAusente, { flex: totales.sinMotivo }]} />
              ) : null}
            </View>

            <View style={styles.leyenda}>
              <View style={styles.leyendaItem}>
                <View style={[styles.punto, styles.barraPresente]} />
                <Text style={styles.leyendaTexto}>Presentes: {totales.presentes}</Text>
              </View>
              <View style={styles.leyendaItem}>
                <View style={[styles.punto, styles.barraJustificada]} />
                <Text style={styles.leyendaTexto}>Justificadas: {totales.justificadas}</Text>
              </View>
              <View style={styles.leyendaItem}>
                <View style={[styles.punto, styles.barraAusente]} />
                <Text style={styles.leyendaTexto}>Sin motivo: {totales.sinMotivo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>Detalle por participante</Text>
            <Text style={styles.subtitulo}>Toca una fila para ver motivos de ausencia</Text>

            <View style={styles.tablaEncabezado}>
              <Text style={[styles.colNombre, styles.textoEncabezado]}>Participante</Text>
              <Text style={[styles.colNum, styles.textoEncabezado]}>Pres.</Text>
              <Text style={[styles.colNum, styles.textoEncabezado]}>Aus.</Text>
              <Text style={[styles.colTasa, styles.textoEncabezado]}>Tasa</Text>
            </View>

            {filasParticipantes.map((fila) => {
              const abierto = expandidoId === fila.participante.id;
              return (
                <View key={fila.participante.id} style={styles.filaContenedor}>
                  <Pressable
                    onPress={() =>
                      setExpandidoId(abierto ? null : fila.participante.id)
                    }
                    style={styles.fila}
                  >
                    <Text style={styles.colNombre}>{fila.participante.nombre}</Text>
                    <Text style={styles.colNum}>{fila.presentes}</Text>
                    <Text style={styles.colNum}>{fila.ausenciasTotales}</Text>
                    <Text style={[styles.colTasa, styles.tasaTexto]}>{fila.tasa}</Text>
                  </Pressable>

                  {abierto ? (
                    <View style={styles.detalleDesplegable}>
                      <Text style={styles.detalleTexto}>
                        {fila.justificadas.length} justificadas · {fila.sinMotivo} sin motivo
                      </Text>
                      {fila.justificadas.length > 0 ? (
                        fila.justificadas.map((item, idx) => (
                          <Text key={`${item.actividadId}-${idx}`} style={styles.motivoItem}>
                            • {item.motivo || 'Sin detalle'}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.motivoItem}>Sin ausencias justificadas.</Text>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}

            <Text style={styles.notaPie}>
              Tasa = presentes ÷ (presentes + ausencias) × 100. Las justificadas cuentan como
              ausencia con motivo visible. Solo lectura.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: colores.fondo,
    flexGrow: 1,
    gap: espaciados.md,
    padding: espaciados.md,
    paddingBottom: espaciados.xl,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  tituloSeccion: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitulo: {
    color: colores.textoSuave,
    fontSize: 13,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
    marginTop: espaciados.md,
  },
  chip: {
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActivo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  chipTexto: {
    color: colores.grisTexto,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: colores.superficie,
  },
  filaFechas: {
    flexDirection: 'row',
    gap: espaciados.sm,
    marginTop: espaciados.md,
  },
  campoMitad: {
    flex: 1,
  },
  barraContenedor: {
    borderRadius: radios.sm,
    flexDirection: 'row',
    height: 18,
    marginTop: espaciados.md,
    overflow: 'hidden',
  },
  barraSegmento: {
    height: '100%',
  },
  barraPresente: {
    backgroundColor: colores.exitoPunto,
  },
  barraJustificada: {
    backgroundColor: '#F59E0B',
  },
  barraAusente: {
    backgroundColor: '#EF4444',
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.md,
    marginTop: espaciados.md,
  },
  leyendaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  punto: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  leyendaTexto: {
    color: colores.grisTexto,
    fontSize: 13,
    fontWeight: '600',
  },
  tablaEncabezado: {
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: espaciados.md,
    paddingBottom: espaciados.sm,
  },
  textoEncabezado: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '700',
  },
  filaContenedor: {
    borderBottomColor: colores.grisSuave,
    borderBottomWidth: 1,
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
  },
  colNombre: {
    color: colores.texto,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  colNum: {
    color: colores.grisTexto,
    fontSize: 14,
    textAlign: 'center',
    width: 44,
  },
  colTasa: {
    fontSize: 14,
    textAlign: 'right',
    width: 52,
  },
  tasaTexto: {
    color: colores.primario,
    fontWeight: '700',
  },
  detalleDesplegable: {
    backgroundColor: colores.fondo,
    borderRadius: radios.sm,
    marginBottom: espaciados.sm,
    padding: espaciados.sm + 2,
  },
  detalleTexto: {
    color: colores.texto,
    fontSize: 12,
    fontWeight: '600',
  },
  motivoItem: {
    color: colores.textoSuave,
    fontSize: 12,
    marginTop: 4,
  },
  notaPie: {
    color: colores.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    marginTop: espaciados.md,
  },
  estadoVacio: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  estadoVacioTitulo: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  estadoVacioTexto: {
    color: colores.textoSuave,
    fontSize: 13,
    marginTop: espaciados.xs,
    textAlign: 'center',
  },
});
