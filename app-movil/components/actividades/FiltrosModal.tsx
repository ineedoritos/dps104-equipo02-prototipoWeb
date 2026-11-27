import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton } from '@/components/ui/Boton';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { Icono } from '@/components/ui/Icono';
import { colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import type { FiltrosActividades } from '@/types/actividad';

export interface FiltrosModalProps {
  visible: boolean;
  filtros: FiltrosActividades;
  onChange: (filtros: FiltrosActividades) => void;
  onClose: () => void;
  onLimpiar: () => void;
}

/** Los filtros por fecha viven fuera del flujo: el dato manda, no el filtro. */
export function FiltrosModal({
  visible,
  filtros,
  onChange,
  onClose,
  onLimpiar,
}: FiltrosModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.velo}>
        <Pressable
          accessibilityLabel="Cerrar filtros"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.areaCierre}
        />

        <View style={[styles.hoja, { paddingBottom: espaciados.lg + insets.bottom }]}>
          <View style={styles.cabecera}>
            <View style={styles.titulos}>
              <Text accessibilityRole="header" style={styles.titulo}>
                Filtrar por fechas
              </Text>
              <Text style={styles.descripcion}>
                Elige el rango que quieres revisar. Puedes dejarlo vacío.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar filtros"
              accessibilityRole="button"
              hitSlop={4}
              onPress={onClose}
              style={styles.botonCerrar}
            >
              <Icono color={colores.tintaSuave} nombre="cerrar" tamano={20} />
            </Pressable>
          </View>

          <View style={styles.fila}>
            <View style={styles.mitad}>
              <DatePickerField
                label="Desde"
                maxDate={filtros.dateTo || undefined}
                onChange={(valor) => onChange({ ...filtros, dateFrom: valor })}
                value={filtros.dateFrom}
              />
            </View>
            <View style={styles.mitad}>
              <DatePickerField
                label="Hasta"
                minDate={filtros.dateFrom || undefined}
                onChange={(valor) => onChange({ ...filtros, dateTo: valor })}
                value={filtros.dateTo}
              />
            </View>
          </View>

          <View style={styles.acciones}>
            <Boton estilo={styles.flexible} onPress={onLimpiar} titulo="Limpiar" variante="secundario" />
            <Boton estilo={styles.flexible} onPress={onClose} titulo="Listo" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: {
    backgroundColor: colores.velo,
    flex: 1,
    justifyContent: 'flex-end',
  },
  areaCierre: {
    flex: 1,
  },
  hoja: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: radios.tarjeta,
    borderTopRightRadius: radios.tarjeta,
    gap: espaciados.lg,
    paddingHorizontal: espaciados.lg,
    paddingTop: espaciados.lg,
  },
  cabecera: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espaciados.md,
  },
  titulos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  descripcion: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 18,
  },
  botonCerrar: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  fila: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  mitad: {
    flex: 1,
  },
  acciones: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  flexible: {
    flex: 1,
  },
});
