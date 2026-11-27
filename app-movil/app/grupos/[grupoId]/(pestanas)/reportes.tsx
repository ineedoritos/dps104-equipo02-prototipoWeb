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

import { Aviso } from '@/components/ui/Aviso';
import { BarraApilada } from '@/components/ui/BarraApilada';
import { Boton } from '@/components/ui/Boton';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { fechaEnZona } from '@/lib/fecha';
import {
  obtenerGrupoPorId,
  obtenerMiRolEnGrupo,
  obtenerReporteGrupo,
  suscribirStore,
  type PeriodoReporte,
} from '@/lib/gruposStore';
import {cifrasTabulares, colores, espaciados, fuentes, radios, tipografia} from '@/lib/tema';

type EstadoVista = 'normal' | 'cargando' | 'vacio' | 'error';

const OPCIONES_PERIODO: readonly { id: PeriodoReporte; etiqueta: string }[] = [
  { id: '7d', etiqueta: 'Últimos 7 días' },
  { id: 'mes', etiqueta: 'Este mes' },
  { id: 'todo', etiqueta: 'Todo' },
  { id: 'personalizado', etiqueta: 'Personalizado' },
];

function formatearHorasDesdeMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas} h ${resto} m`;
}

export default function ReportesGrupoScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const [periodo, setPeriodo] = useState<PeriodoReporte>('mes');
  const [desde, setDesde] = useState(() => fechaEnZona().slice(0, 8) + '01');
  const [hasta, setHasta] = useState(() => fechaEnZona());
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('normal');
  const [tick, setTick] = useState(0);

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;

  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
      return suscribirStore(() => setTick((t) => t + 1));
    }, []),
  );

  const reporte = useMemo(() => {
    void tick;
    if (!grupo || rol !== 'responsable') {
      return null;
    }
    return obtenerReporteGrupo(grupo.id, { periodo, desde, hasta });
  }, [desde, grupo, hasta, periodo, rol, tick]);

  if (!grupo || rol !== 'responsable' || !reporte) {
    return (
      <View style={styles.pantalla}>
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
            texto="Solo un responsable activo puede consultar los reportes de participación del grupo."
            tipo="error"
          />
        </View>
      </View>
    );
  }

  const totalRegistros =
    reporte.totalPresentes + reporte.totalJustificadas + reporte.totalAusentesSinMotivo;
  const sinDatos = estadoVista === 'vacio' || totalRegistros === 0;

  return (
    <View style={styles.pantalla}>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>


        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filaPeriodos}>
            {OPCIONES_PERIODO.map((opcion) => {
              const activo = periodo === opcion.id;
              return (
                <Pressable
                  key={opcion.id}
                  accessibilityRole="button"
                  onPress={() => setPeriodo(opcion.id)}
                  style={[styles.chipPeriodo, activo && styles.chipPeriodoActivo]}
                >
                  <Text style={[styles.textoPeriodo, activo && styles.textoPeriodoActivo]}>
                    {opcion.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {periodo === 'personalizado' ? (
          <View style={styles.filaFechas}>
            <View style={styles.colFecha}>
              <DatePickerField label="Desde" onChange={setDesde} value={desde} />
            </View>
            <View style={styles.colFecha}>
              <DatePickerField label="Hasta" onChange={setHasta} value={hasta} />
            </View>
          </View>
        ) : null}

        {estadoVista === 'cargando' ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator color={colores.acento} size="large" />
            <Text style={styles.textoCarga}>Calculando reporte del período…</Text>
          </View>
        ) : null}

        {estadoVista === 'error' ? (
          <Aviso
            accion={
              <Boton
                onPress={() => setEstadoVista('normal')}
                tamano="sm"
                titulo="Reintentar"
                variante="secundario"
              />
            }
            texto="No pudimos cargar el reporte del grupo. Intenta de nuevo."
            tipo="error"
          />
        ) : null}

        {estadoVista !== 'cargando' && estadoVista !== 'error' && sinDatos ? (
          <EstadoVacio
            descripcion="Cambia el rango de fechas o registra asistencias para ver las métricas del grupo."
            icono="calendario"
            titulo="No hay registros de asistencia en el período seleccionado"
          />
        ) : null}

        {estadoVista === 'normal' && !sinDatos ? (
          <>
            <BarraApilada
              ausentesSinMotivo={reporte.totalAusentesSinMotivo}
              justificadas={reporte.totalJustificadas}
              presentes={reporte.totalPresentes}
            />

            <View style={styles.tabla}>
              <View style={styles.encabezadoTabla}>
                <Text style={[styles.colNombre, styles.textoEncabezado]}>Integrante</Text>
                <Text style={[styles.colNum, styles.textoEncabezado]}>Pres.</Text>
                <Text style={[styles.colNum, styles.textoEncabezado]}>Aus.</Text>
                <Text style={[styles.colTasa, styles.textoEncabezado]}>Tasa</Text>
                {grupo.control_horas ? (
                  <Text style={[styles.colHoras, styles.textoEncabezado]}>Horas</Text>
                ) : null}
              </View>

              {reporte.filas.map((fila) => {
                const expandida = expandidoId === fila.participante.id;
                const totalAusencias = fila.ausentesSinMotivo + fila.justificadas;

                return (
                  <Pressable
                    key={fila.participante.id}
                    accessibilityRole="button"
                    onPress={() =>
                      setExpandidoId(expandida ? null : fila.participante.id)
                    }
                    style={styles.filaTabla}
                  >
                    <View style={styles.filaResumen}>
                      <Text numberOfLines={1} style={[styles.colNombre, styles.textoNombre]}>
                        {fila.participante.nombre}
                      </Text>
                      <Text style={[styles.colNum, styles.textoDato, cifrasTabulares]}>
                        {fila.presentes}
                      </Text>
                      <Text style={[styles.colNum, styles.textoDato, cifrasTabulares]}>
                        {totalAusencias}
                      </Text>
                      <Text style={[styles.colTasa, styles.textoTasa, cifrasTabulares]}>
                        {fila.tasaAsistencia !== null ? `${fila.tasaAsistencia}%` : '—'}
                      </Text>
                      {grupo.control_horas ? (
                        <Text style={[styles.colHoras, styles.textoHoras, cifrasTabulares]}>
                          {formatearHorasDesdeMinutos(fila.minutosReconocidos)}
                        </Text>
                      ) : null}
                    </View>

                    {expandida ? (
                      <View style={styles.detalleExpandido}>
                        <Text style={[styles.textoDetalle, cifrasTabulares]}>
                          {fila.justificadas} justificadas
                          {fila.motivosJustificadas.length > 0
                            ? `: ${fila.motivosJustificadas.join(', ')}`
                            : ''}
                          {' · '}
                          {fila.ausentesSinMotivo} sin motivo
                        </Text>
                        {grupo.control_horas ? (
                          <Text style={[styles.textoDetalle, cifrasTabulares]}>
                            Registrado: {formatearHorasDesdeMinutos(fila.minutosRegistrados)} ·
                            Reconocido: {formatearHorasDesdeMinutos(fila.minutosReconocidos)}
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.notaPie}>
              Tasa = presentes ÷ (presentes + ausencias) × 100. Las justificadas cuentan como
              ausencia, pero se ve su motivo. Se excluyen jornadas canceladas y asistencias sin
              registrar. Solo lectura.
            </Text>
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
    paddingBottom: espaciados.xxxl,
  },
  filaPeriodos: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  chipPeriodo: {
    backgroundColor: colores.superficie,
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  chipPeriodoActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoPeriodo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.medio,
  },
  textoPeriodoActivo: {
    color: colores.acento,
    fontFamily: fuentes.fuerte,
  },
  filaFechas: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  colFecha: {
    flex: 1,
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
  tabla: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    overflow: 'hidden',
  },
  encabezadoTabla: {
    backgroundColor: colores.superficieAlt,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  textoEncabezado: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
  },
  filaTabla: {
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.md,
  },
  filaResumen: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  colNombre: {
    flex: 2,
    paddingRight: espaciados.xs,
  },
  colNum: {
    textAlign: 'center',
    width: 40,
  },
  colTasa: {
    textAlign: 'right',
    width: 48,
  },
  colHoras: {
    textAlign: 'right',
    width: 68,
  },
  textoNombre: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
  },
  textoDato: {
    color: colores.tinta,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  textoTasa: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
  },
  textoHoras: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  detalleExpandido: {
    backgroundColor: colores.papel,
    borderRadius: radios.sm,
    gap: espaciados.xs,
    marginTop: espaciados.sm,
    padding: espaciados.sm,
  },
  textoDetalle: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  notaPie: {
    color: colores.tintaTenue,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
    lineHeight: 17,
  },
});
