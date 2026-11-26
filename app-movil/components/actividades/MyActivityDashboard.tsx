import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActivityRow } from '@/components/actividades/ActivityRow';
import { FiltrosModal } from '@/components/actividades/FiltrosModal';
import { TodayCard } from '@/components/actividades/TodayCard';
import { Boton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { Seccion } from '@/components/ui/Seccion';
import { fechaEnZona } from '@/lib/fecha';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
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

type FiltroEstado = EstadoActividad | 'all';

const OPCIONES_ESTADO: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: 'all', etiqueta: 'Todas' },
  { valor: 'upcoming', etiqueta: 'Próximas' },
  { valor: 'current', etiqueta: 'En curso' },
  { valor: 'completed', etiqueta: 'Finalizadas' },
];

const FILTROS_INICIALES: FiltrosActividades = { status: 'all', dateFrom: '', dateTo: '' };

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function contarJornadas(total: number): string {
  return `${total} ${total === 1 ? 'jornada' : 'jornadas'}`;
}

export function MyActivityDashboard({
  user,
  activities,
  onSelectActivity,
  onCreateActivity,
}: MyActivityDashboardProps) {
  const [filtros, setFiltros] = useState<FiltrosActividades>(FILTROS_INICIALES);
  const [modalAbierto, setModalAbierto] = useState(false);

  const hoyISO = fechaEnZona();

  const actividadesFiltradas = activities.filter((actividad) => {
    const coincideEstado = filtros.status === 'all' || actividad.status === filtros.status;
    const coincideDesde = !filtros.dateFrom || actividad.date >= filtros.dateFrom;
    const coincideHasta = !filtros.dateTo || actividad.date <= filtros.dateTo;

    return coincideEstado && coincideDesde && coincideHasta;
  });

  const hoyDestacada =
    actividadesFiltradas.find((actividad) => actividad.date === hoyISO) ??
    actividadesFiltradas.find((actividad) => actividad.status === 'current');

  const resto = actividadesFiltradas.filter((actividad) => actividad.id !== hoyDestacada?.id);

  const hayFiltros =
    filtros.status !== 'all' || filtros.dateFrom !== '' || filtros.dateTo !== '';
  const hayFiltroFecha = filtros.dateFrom !== '' || filtros.dateTo !== '';

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setModalAbierto(false);
  };

  const nombre = capitalizar(user.name);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.sobreTitulo}>Registro de jornadas</Text>
        <Text accessibilityRole="header" style={styles.nombre}>
          {nombre}
        </Text>
        <Text style={styles.subtitulo}>Revisa tus jornadas y registra la asistencia del grupo.</Text>

        {onCreateActivity ? (
          <Boton
            estilo={styles.botonNueva}
            icono="nueva"
            onPress={onCreateActivity}
            titulo="Nueva jornada"
          />
        ) : null}
      </View>

      {hoyDestacada ? (
        <Seccion estilo={styles.seccion} titulo="Hoy">
          <TodayCard
            activity={hoyDestacada}
            onPress={
              onSelectActivity ? () => onSelectActivity(hoyDestacada) : undefined
            }
          />
        </Seccion>
      ) : null}

      <Seccion
        accion={
          hayFiltros ? (
            <Boton
              onPress={limpiarFiltros}
              tamano="sm"
              titulo="Limpiar filtros"
              variante="fantasma"
            />
          ) : undefined
        }
        detalle={contarJornadas(resto.length)}
        estilo={styles.seccion}
        titulo={hoyDestacada ? 'Próximas y anteriores' : 'Todas las jornadas'}
      >
        <ScrollView
          contentContainerStyle={styles.filtros}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {OPCIONES_ESTADO.map((opcion) => {
            const activa = filtros.status === opcion.valor;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                key={opcion.valor}
                onPress={() => setFiltros((previos) => ({ ...previos, status: opcion.valor }))}
                style={({ pressed }) => [
                  styles.chip,
                  activa && styles.chipActivo,
                  pressed && styles.chipPresionado,
                ]}
              >
                <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                  {opcion.etiqueta}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            accessibilityLabel="Filtrar por fechas"
            accessibilityRole="button"
            accessibilityState={{ selected: hayFiltroFecha }}
            onPress={() => setModalAbierto(true)}
            style={({ pressed }) => [
              styles.chip,
              styles.chipFecha,
              hayFiltroFecha && styles.chipFechaActivo,
              pressed && styles.chipPresionado,
            ]}
          >
            <Icono
              color={hayFiltroFecha ? colores.acento : colores.tintaSuave}
              nombre="filtro"
              tamano={16}
            />
            <Text style={[styles.chipTexto, hayFiltroFecha && styles.chipFechaTextoActivo]}>
              Fechas
            </Text>
          </Pressable>
        </ScrollView>

        {resto.length > 0 ? (
          <View style={styles.lista}>
            {resto.map((actividad) => (
              <ActivityRow
                activity={actividad}
                key={actividad.id}
                onPress={onSelectActivity ? () => onSelectActivity(actividad) : undefined}
              />
            ))}
          </View>
        ) : (
          <EstadoVacio
            accion={
              hayFiltros ? (
                <Boton onPress={limpiarFiltros} titulo="Limpiar filtros" variante="secundario" />
              ) : onCreateActivity ? (
                <Boton
                  icono="nueva"
                  onPress={onCreateActivity}
                  titulo="Crear la primera jornada"
                />
              ) : undefined
            }
            descripcion={
              hayFiltros
                ? 'Prueba con otro estado o con un rango de fechas distinto.'
                : 'Cuando crees una jornada aparecerá aquí con su estado y horario.'
            }
            icono="sinEventos"
            titulo={hayFiltros ? 'No hay jornadas con esos filtros' : 'Aún no hay jornadas'}
          />
        )}
      </Seccion>

      <FiltrosModal
        filtros={filtros}
        onChange={setFiltros}
        onClose={() => setModalAbierto(false)}
        onLimpiar={() => setFiltros(FILTROS_INICIALES)}
        visible={modalAbierto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.xl,
  },
  encabezado: {
    gap: espaciados.xs,
  },
  sobreTitulo: {
    color: colores.acento,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nombre: {
    color: colores.tinta,
    fontSize: tipografia.display,
    fontWeight: pesos.fuerte,
    letterSpacing: -0.4,
    lineHeight: tipografia.display + 4,
    marginTop: 2,
  },
  subtitulo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
  },
  botonNueva: {
    marginTop: espaciados.md,
  },
  seccion: {
    gap: espaciados.md,
  },
  filtros: {
    gap: espaciados.sm,
    paddingRight: espaciados.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espaciados.xs + 2,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: espaciados.md + 2,
  },
  chipActivo: {
    backgroundColor: colores.tinta,
    borderColor: colores.tinta,
  },
  chipPresionado: {
    opacity: 0.8,
  },
  chipTexto: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  chipTextoActivo: {
    color: colores.superficie,
    fontWeight: pesos.fuerte,
  },
  chipFecha: {
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  chipFechaActivo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
    borderStyle: 'solid',
  },
  chipFechaTextoActivo: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  lista: {
    gap: espaciados.md,
  },
});
