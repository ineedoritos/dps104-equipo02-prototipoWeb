import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PestanasGrupo } from '@/components/grupos/PestanasGrupo';
import { Aviso } from '@/components/ui/Aviso';
import { BarraApilada } from '@/components/ui/BarraApilada';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { Icono } from '@/components/ui/Icono';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { fechaEnZona } from '@/lib/fecha';
import {
  obtenerGrupoPorId,
  obtenerMiRolEnGrupo,
  obtenerReporteGrupo,
  suscribirStore,
  type PeriodoReporte,
} from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

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
  const { width, fontScale } = useWindowDimensions();
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
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Reportes" />
        <View style={styles.contenido}>
          <Aviso
            accion={
              <Boton
                icono="inicio"
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
      </SafeAreaView>
    );
  }

  const totalRegistros =
    reporte.totalPresentes + reporte.totalJustificadas + reporte.totalAusentesSinMotivo;
  const sinDatos = estadoVista === 'vacio' || totalRegistros === 0;
  const fechasEnFila = width >= 400 * Math.max(1, fontScale);

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior accessibilityLabelVolver="Volver a Jornadas" titulo={grupo.nombre} />
      <PestanasGrupo actual="reportes" esResponsable grupoId={grupo.id} />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>

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

        <View style={styles.tarjetaFiltros}>
          <Text style={styles.tituloFiltros}>Período del reporte</Text>
          <View style={styles.gridPeriodos}>
            {OPCIONES_PERIODO.map((opcion) => {
              const activo = periodo === opcion.id;
              return (
                <Pressable
                  key={opcion.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  onPress={() => {
                    setPeriodo(opcion.id);
                    setExpandidoId(null);
                  }}
                  style={[styles.chipPeriodo, activo && styles.chipPeriodoActivo]}
                >
                  <Text style={[styles.textoPeriodo, activo && styles.textoPeriodoActivo]}>
                    {opcion.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {periodo === 'personalizado' ? (
            <View style={[styles.fechas, fechasEnFila && styles.fechasEnFila]}>
              <View style={fechasEnFila ? styles.colFecha : undefined}>
                <DatePickerField
                  label="Desde"
                  maxDate={hasta}
                  onChange={setDesde}
                  permitirLimpiar={false}
                  value={desde}
                />
              </View>
              <View style={fechasEnFila ? styles.colFecha : undefined}>
                <DatePickerField
                  label="Hasta"
                  maxDate={fechaEnZona()}
                  minDate={desde}
                  onChange={setHasta}
                  permitirLimpiar={false}
                  value={hasta}
                />
              </View>
            </View>
          ) : null}
        </View>

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
            descripcion="Prueba otro período. Las asistencias registradas aparecerán aquí."
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
              <Text accessibilityRole="header" style={styles.encabezadoTabla}>Por integrante</Text>

              {reporte.filas.map((fila) => {
                const expandida = expandidoId === fila.participante.id;
                const totalAusencias = fila.ausentesSinMotivo + fila.justificadas;

                return (
                  <Pressable
                    key={fila.participante.id}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: expandida }}
                    onPress={() =>
                      setExpandidoId(expandida ? null : fila.participante.id)
                    }
                    style={({ pressed }) => [styles.filaTabla, pressed && styles.filaPresionada]}
                  >
                    <View style={styles.filaResumen}>
                      <Text style={styles.textoNombre}>{fila.participante.nombre}</Text>
                      <Icono
                        color={colores.tintaSuave}
                        nombre={expandida ? 'contraer' : 'expandir'}
                      />
                    </View>

                    <View style={styles.metricas}>
                      <Text style={[styles.textoDato, cifrasTabulares]}>{fila.presentes} presentes</Text>
                      <Text style={[styles.textoDato, cifrasTabulares]}>{totalAusencias} ausencias</Text>
                      <Text style={[styles.textoTasa, cifrasTabulares]}>
                        {fila.tasaAsistencia === null ? 'Tasa —' : fila.tasaAsistencia + '% de asistencia'}
                      </Text>
                      {grupo.control_horas ? (
                        <Text style={[styles.textoDato, cifrasTabulares]}>
                          {formatearHorasDesdeMinutos(fila.minutosReconocidos)} reconocidas
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
    paddingBottom: espaciados.xxxl,
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
  tarjetaFiltros: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.md,
  },
  tituloFiltros: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
    letterSpacing: 0.2,
  },
  gridPeriodos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
  },
  chipPeriodo: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.sm,
  },
  chipPeriodoActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  textoPeriodo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  textoPeriodoActivo: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  fechas: { gap: espaciados.sm },
  fechasEnFila: { flexDirection: 'row' },
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
    fontSize: tipografia.cuerpoSm,
  },
  tabla: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    overflow: 'hidden',
  },
  encabezadoTabla: {
    backgroundColor: colores.superficieAlt,
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
    padding: espaciados.md,
  },
  filaTabla: {
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    gap: espaciados.xs,
    minHeight: 48,
    padding: espaciados.md,
  },
  filaPresionada: { backgroundColor: colores.superficieAlt },
  filaResumen: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: espaciados.md,
    rowGap: espaciados.xs,
  },
  textoNombre: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  textoDato: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  textoTasa: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
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
    fontSize: tipografia.micro,
    lineHeight: 16,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    lineHeight: 17,
  },
});
