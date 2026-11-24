import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActivityCard } from '@/components/actividades/ActivityCard';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { colores, espaciados, radios } from '@/lib/tema';
import type {
  Actividad,
  EstadoActividad,
  FiltrosActividades,
  Usuario,
} from '@/types/actividad';

export interface MyActivityDashboardProps {
  user: Usuario;
  activities: Actividad[];
  onSelectActivity?: (activity: Actividad) => void;
  onCreateActivity?: () => void;
}

const OPCIONES_ESTADO: { valor: EstadoActividad | 'all'; etiqueta: string }[] = [
  { valor: 'all', etiqueta: 'Todos los estados' },
  { valor: 'upcoming', etiqueta: 'Próximas' },
  { valor: 'current', etiqueta: 'En curso' },
  { valor: 'completed', etiqueta: 'Completadas' },
];

export function MyActivityDashboard({
  user,
  activities,
  onSelectActivity,
  onCreateActivity,
}: MyActivityDashboardProps) {
  const [filtros, setFiltros] = useState<FiltrosActividades>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [mostrarEstados, setMostrarEstados] = useState(false);

  const actividadesFiltradas = activities.filter((actividad) => {
    const coincideEstado = filtros.status === 'all' || actividad.status === filtros.status;
    const coincideDesde = !filtros.dateFrom || actividad.date >= filtros.dateFrom;
    const coincideHasta = !filtros.dateTo || actividad.date <= filtros.dateTo;

    return coincideEstado && coincideDesde && coincideHasta;
  });

  const etiquetaEstado =
    OPCIONES_ESTADO.find((opcion) => opcion.valor === filtros.status)?.etiqueta ??
    'Todos los estados';

  const limpiarFiltros = () => {
    setFiltros({ status: 'all', dateFrom: '', dateTo: '' });
    setMostrarEstados(false);
  };

  return (
    <View style={styles.tarjetaPrincipal}>
      <View style={styles.encabezado}>
        <Text style={styles.saludo}>¡Hola, {user.name}! 👋</Text>
        <Text style={styles.descripcionEncabezado}>
          Consulta tus actividades, registra asistencia y revisa tu avance.
        </Text>

        {onCreateActivity ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCreateActivity}
            style={({ pressed }) => [styles.botonPrimario, pressed && styles.campoPresionado]}
          >
            <Text style={styles.botonPrimarioTexto}>+ Nueva actividad</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Filtrar actividades</Text>

        <View style={styles.panelFiltros}>
          <View style={styles.campoGrupo}>
            <Text style={styles.etiqueta}>Estado</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMostrarEstados((visible) => !visible)}
              style={({ pressed }) => [styles.campo, pressed && styles.campoPresionado]}
            >
              <Text style={styles.campoTexto}>{etiquetaEstado}</Text>
              <Text style={styles.chevron}>{mostrarEstados ? '▲' : '▼'}</Text>
            </Pressable>

            {mostrarEstados ? (
              <View style={styles.listaOpciones}>
                {OPCIONES_ESTADO.map((opcion) => {
                  const activa = filtros.status === opcion.valor;

                  return (
                    <Pressable
                      key={opcion.valor}
                      onPress={() => {
                        setFiltros((anteriores) => ({
                          ...anteriores,
                          status: opcion.valor,
                        }));
                        setMostrarEstados(false);
                      }}
                      style={[styles.opcion, activa && styles.opcionActiva]}
                    >
                      <Text style={[styles.opcionTexto, activa && styles.opcionTextoActiva]}>
                        {opcion.etiqueta}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={styles.filaFechas}>
            <View style={styles.campoMitad}>
              <DatePickerField
                label="Desde"
                maxDate={filtros.dateTo || undefined}
                onChange={(valor) =>
                  setFiltros((anteriores) => ({ ...anteriores, dateFrom: valor }))
                }
                value={filtros.dateFrom}
              />
            </View>

            <View style={styles.campoMitad}>
              <DatePickerField
                label="Hasta"
                minDate={filtros.dateFrom || undefined}
                onChange={(valor) =>
                  setFiltros((anteriores) => ({ ...anteriores, dateTo: valor }))
                }
                value={filtros.dateTo}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={limpiarFiltros}
            style={({ pressed }) => [styles.botonSecundario, pressed && styles.campoPresionado]}
          >
            <Text style={styles.botonSecundarioTexto}>Limpiar filtros</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Mis actividades</Text>

        {actividadesFiltradas.length > 0 ? (
          <View style={styles.listaActividades}>
            {actividadesFiltradas.map((actividad) => (
              <ActivityCard
                key={actividad.id}
                activity={actividad}
                onPress={onSelectActivity ? () => onSelectActivity(actividad) : undefined}
                variant={actividad.status}
              />
            ))}
          </View>
        ) : (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioIcono}>🗓️</Text>
            <Text style={styles.estadoVacioTitulo}>No hay actividades con esos filtros</Text>
            <Text style={styles.estadoVacioDescripcion}>
              Prueba con otro estado o rango de fechas para ver más resultados.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={limpiarFiltros}
              style={({ pressed }) => [styles.botonSecundario, pressed && styles.campoPresionado]}
            >
              <Text style={styles.botonSecundarioTexto}>Limpiar filtros</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjetaPrincipal: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.xl,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  encabezado: {
    marginBottom: espaciados.md,
  },
  saludo: {
    color: colores.texto,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  descripcionEncabezado: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 21,
    marginTop: espaciados.xs,
  },
  botonPrimario: {
    alignItems: 'center',
    backgroundColor: colores.primario,
    borderRadius: radios.md,
    marginTop: espaciados.md,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: espaciados.md,
    paddingVertical: 12,
  },
  botonPrimarioTexto: {
    color: colores.superficie,
    fontSize: 15,
    fontWeight: '700',
  },
  seccion: {
    marginTop: espaciados.lg,
  },
  tituloSeccion: {
    color: colores.texto,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  panelFiltros: {
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    gap: espaciados.md,
    marginTop: espaciados.sm + 4,
    padding: espaciados.md,
  },
  campoGrupo: {
    gap: espaciados.sm,
  },
  filaFechas: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  campoMitad: {
    flex: 1,
  },
  etiqueta: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
  campo: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  campoPresionado: {
    opacity: 0.85,
  },
  campoTexto: {
    color: colores.grisTexto,
    flex: 1,
    fontSize: 14,
  },
  chevron: {
    color: colores.textoSuave,
    fontSize: 10,
  },
  listaOpciones: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  opcion: {
    borderTopColor: colores.grisSuave,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  opcionActiva: {
    backgroundColor: colores.primarioSuave,
  },
  opcionTexto: {
    color: colores.grisTexto,
    fontSize: 14,
  },
  opcionTextoActiva: {
    color: colores.primario,
    fontWeight: '700',
  },
  botonSecundario: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: espaciados.md,
    paddingVertical: 12,
  },
  botonSecundarioTexto: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
  listaActividades: {
    gap: espaciados.md,
    marginTop: espaciados.md,
  },
  estadoVacio: {
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    marginTop: espaciados.md,
    padding: espaciados.lg,
  },
  estadoVacioIcono: {
    fontSize: 32,
  },
  estadoVacioTitulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '700',
    marginTop: espaciados.sm,
    textAlign: 'center',
  },
  estadoVacioDescripcion: {
    color: colores.textoSuave,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: espaciados.md,
    marginTop: espaciados.xs,
    textAlign: 'center',
  },
});
