import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (fechaISO: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'] as const;

function formatearISO(anio: number, mes: number, dia: number): string {
  const mesStr = String(mes + 1).padStart(2, '0');
  const diaStr = String(dia).padStart(2, '0');
  return `${anio}-${mesStr}-${diaStr}`;
}

function formatearLegible(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split('-');
  if (!anio || !mes || !dia) {
    return fechaISO;
  }
  return `${dia}/${mes}/${anio}`;
}

function parsearISO(fechaISO: string): { anio: number; mes: number } {
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
    const [anioStr, mesStr] = fechaISO.split('-');
    const anio = Number(anioStr);
    const mes = Number(mesStr) - 1;
    if (!Number.isNaN(anio) && mes >= 0 && mes <= 11) {
      return { anio, mes };
    }
  }
  const hoy = new Date();
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar',
  minDate,
  maxDate,
}: DatePickerFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const inicial = parsearISO(value);
  const [anioVista, setAnioVista] = useState(inicial.anio);
  const [mesVista, setMesVista] = useState(inicial.mes);

  const hoyISO = useMemo(() => {
    const ahora = new Date();
    return formatearISO(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  }, []);

  const abrirModal = () => {
    const base = parsearISO(value);
    setAnioVista(base.anio);
    setMesVista(base.mes);
    setAbierto(true);
  };

  const cambiarMes = (delta: number) => {
    const nuevaFecha = new Date(anioVista, mesVista + delta, 1);
    setAnioVista(nuevaFecha.getFullYear());
    setMesVista(nuevaFecha.getMonth());
  };

  const celdasMes = useMemo(() => {
    const primerDiaSemana = new Date(anioVista, mesVista, 1).getDay();
    const totalDias = new Date(anioVista, mesVista + 1, 0).getDate();
    const celdas: (number | null)[] = [];

    for (let i = 0; i < primerDiaSemana; i += 1) {
      celdas.push(null);
    }
    for (let dia = 1; dia <= totalDias; dia += 1) {
      celdas.push(dia);
    }
    while (celdas.length % 7 !== 0) {
      celdas.push(null);
    }

    return celdas;
  }, [anioVista, mesVista]);

  const seleccionarDia = (fechaISO: string) => {
    onChange(fechaISO);
    setAbierto(false);
  };

  const hoyPermitido = (!minDate || hoyISO >= minDate) && (!maxDate || hoyISO <= maxDate);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{label}</Text>
      <View style={styles.campoContenedor}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar fecha ${label}`}
          onPress={abrirModal}
          style={({ pressed }) => [styles.campo, pressed && styles.campoPresionado]}
        >
          <Text style={[styles.campoTexto, !value && styles.placeholder]}>
            {value ? formatearLegible(value) : placeholder}
          </Text>
          {!value ? <Text style={styles.iconoCalendario}>📅</Text> : null}
        </Pressable>
        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Limpiar fecha ${label}`}
            onPress={() => onChange('')}
            style={({ pressed }) => [styles.botonLimpiar, pressed && styles.campoPresionado]}
          >
            <Text style={styles.textoLimpiar}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={abierto}
        onRequestClose={() => setAbierto(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalTarjeta}>
            <View style={styles.modalEncabezado}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mes anterior"
                onPress={() => cambiarMes(-1)}
                style={styles.botonMes}
              >
                <Text style={styles.botonMesTexto}>‹</Text>
              </Pressable>
              <Text style={styles.tituloMes}>
                {MESES[mesVista]} {anioVista}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mes siguiente"
                onPress={() => cambiarMes(1)}
                style={styles.botonMes}
              >
                <Text style={styles.botonMesTexto}>›</Text>
              </Pressable>
            </View>

            <View style={styles.filaSemana}>
              {DIAS_SEMANA.map((dia) => (
                <Text key={dia} style={styles.diaSemana}>
                  {dia}
                </Text>
              ))}
            </View>

            <View style={styles.cuadriculaDias}>
              {celdasMes.map((dia, indice) => {
                if (dia === null) {
                  return <View key={`vacio-${indice}`} style={styles.celdaDia} />;
                }

                const fechaISO = formatearISO(anioVista, mesVista, dia);
                const deshabilitado =
                  (Boolean(minDate) && fechaISO < (minDate as string)) ||
                  (Boolean(maxDate) && fechaISO > (maxDate as string));
                const seleccionado = value === fechaISO;
                const esHoy = hoyISO === fechaISO;

                return (
                  <Pressable
                    key={fechaISO}
                    disabled={deshabilitado}
                    onPress={() => seleccionarDia(fechaISO)}
                    style={[
                      styles.celdaDia,
                      esHoy && !seleccionado && styles.celdaHoy,
                      seleccionado && styles.celdaSeleccionada,
                      deshabilitado && styles.celdaDeshabilitada,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoDia,
                        esHoy && !seleccionado && styles.textoHoy,
                        seleccionado && styles.textoSeleccionado,
                        deshabilitado && styles.textoDeshabilitado,
                      ]}
                    >
                      {dia}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalAcciones}>
              <Pressable
                disabled={!hoyPermitido}
                onPress={() => seleccionarDia(hoyISO)}
                style={[styles.botonAccion, !hoyPermitido && styles.celdaDeshabilitada]}
              >
                <Text style={styles.textoAccionPrimaria}>Hoy</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onChange('');
                  setAbierto(false);
                }}
                style={styles.botonAccion}
              >
                <Text style={styles.textoAccion}>Limpiar</Text>
              </Pressable>
              <Pressable onPress={() => setAbierto(false)} style={styles.botonAccion}>
                <Text style={styles.textoAccion}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.sm,
  },
  etiqueta: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
  campoContenedor: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 44,
  },
  campo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  campoPresionado: {
    opacity: 0.75,
  },
  campoTexto: {
    color: colores.grisTexto,
    fontSize: 14,
  },
  placeholder: {
    color: colores.textoSuave,
  },
  iconoCalendario: {
    fontSize: 15,
  },
  botonLimpiar: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  textoLimpiar: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: '700',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  modalTarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.lg,
    maxWidth: 360,
    padding: espaciados.md,
    width: '100%',
  },
  modalEncabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: espaciados.md,
  },
  botonMes: {
    alignItems: 'center',
    backgroundColor: colores.grisSuave,
    borderRadius: radios.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  botonMesTexto: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '700',
  },
  tituloMes: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  filaSemana: {
    flexDirection: 'row',
    marginBottom: espaciados.xs,
  },
  diaSemana: {
    color: colores.textoSuave,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cuadriculaDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celdaDia: {
    alignItems: 'center',
    borderRadius: radios.sm,
    height: 40,
    justifyContent: 'center',
    width: '14.2857%',
  },
  celdaHoy: {
    backgroundColor: colores.primarioSuave,
  },
  celdaSeleccionada: {
    backgroundColor: colores.primario,
  },
  celdaDeshabilitada: {
    opacity: 0.35,
  },
  textoDia: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '500',
  },
  textoHoy: {
    color: colores.primario,
    fontWeight: '700',
  },
  textoSeleccionado: {
    color: colores.superficie,
    fontWeight: '700',
  },
  textoDeshabilitado: {
    color: colores.textoSuave,
  },
  modalAcciones: {
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: espaciados.sm,
    marginTop: espaciados.md,
    paddingTop: espaciados.sm,
  },
  botonAccion: {
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.xs + 2,
  },
  textoAccionPrimaria: {
    color: colores.primario,
    fontSize: 14,
    fontWeight: '700',
  },
  textoAccion: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
});
