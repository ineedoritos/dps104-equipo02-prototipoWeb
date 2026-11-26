import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import {
  actualizarConfiguracionGrupo,
  obtenerGrupoPorId,
  obtenerMiRolEnGrupo,
} from '@/lib/gruposStore';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio, type ModalidadAsistencia } from '@/types/dominio';

export default function ConfiguracionGrupoScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;

  const [modalidad, setModalidad] = useState<ModalidadAsistencia>(
    grupo?.modalidad_asistencia ?? 'manual',
  );
  const [controlHoras, setControlHoras] = useState<boolean>(grupo?.control_horas ?? false);
  const [gpsHabilitado, setGpsHabilitado] = useState<boolean>(grupo?.gps_habilitado ?? false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cambiarModalidad = (nueva: ModalidadAsistencia) => {
    setModalidad(nueva);
    if (nueva === 'manual') {
      setGpsHabilitado(false);
    }
  };

  const manejarGuardar = () => {
    if (!grupoId) {
      return;
    }
    setError('');
    setGuardando(true);

    setTimeout(() => {
      try {
        actualizarConfiguracionGrupo(grupoId, {
          modalidad_asistencia: modalidad,
          control_horas: controlHoras,
          gps_habilitado: modalidad === 'qr' ? gpsHabilitado : false,
        });
        setGuardando(false);
        router.back();
      } catch (err) {
        setGuardando(false);
        if (err instanceof ErrorDominio) {
          setError(err.message);
        } else {
          setError('No pudimos guardar los cambios. Intenta de nuevo.');
        }
      }
    }, 200);
  };

  if (!grupo || rol !== 'responsable') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Configuración" />
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
            texto="Solo un responsable activo puede editar la configuración del grupo."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior titulo="Configuración" />

      <ScrollView contentContainerStyle={styles.contenido}>
        {error ? (
          <Aviso
            accion={<Boton onPress={manejarGuardar} tamano="sm" titulo="Reintentar" variante="secundario" />}
            texto={error}
            tipo="error"
          />
        ) : null}

        <View style={styles.tarjeta}>
          <Text style={styles.tituloBloque}>¿Cómo se registra la asistencia?</Text>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: modalidad === 'manual' }}
            disabled={guardando}
            onPress={() => cambiarModalidad('manual')}
            style={[styles.opcion, modalidad === 'manual' && styles.opcionActiva]}
          >
            <View style={styles.radio}>
              {modalidad === 'manual' ? <View style={styles.radioCentro} /> : null}
            </View>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>Manual</Text>
              <Text style={styles.descOpcion}>
                El responsable pasa lista como presente, ausente o justificada.
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: modalidad === 'qr' }}
            disabled={guardando}
            onPress={() => cambiarModalidad('qr')}
            style={[styles.opcion, modalidad === 'qr' && styles.opcionActiva]}
          >
            <View style={styles.radio}>
              {modalidad === 'qr' ? <View style={styles.radioCentro} /> : null}
            </View>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>Por QR</Text>
              <Text style={styles.descOpcion}>
                Cada participante escanea un código temporal y el responsable puede corregir.
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.filaSwitch}>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloBloque}>Control de horas</Text>
              <Text style={styles.descOpcion}>
                Registra entrada, salida y horas reconocidas (funciona en manual y por QR).
              </Text>
            </View>
            <Switch
              disabled={guardando}
              onValueChange={setControlHoras}
              thumbColor={colores.superficie}
              trackColor={{ false: colores.bordeFuerte, true: colores.acento }}
              value={controlHoras}
            />
          </View>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.encabezadoOpcional}>
            <Text style={styles.tituloBloque}>Funciones opcionales</Text>
            <View style={styles.etiquetaProximamente}>
              <Text style={styles.textoProximamente}>Próximamente</Text>
            </View>
          </View>

          <View style={styles.filaSwitch}>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>Comprobar cercanía por GPS (solo QR)</Text>
              <Text style={styles.descOpcion}>
                {modalidad === 'manual'
                  ? 'Disponible solo cuando la asistencia es por QR.'
                  : 'Verifica que el escaneo ocurra cerca del punto de la jornada.'}
              </Text>
            </View>
            <Switch
              disabled
              thumbColor={colores.superficie}
              trackColor={{ false: colores.borde, true: colores.acento }}
              value={modalidad === 'qr' ? gpsHabilitado : false}
            />
          </View>

          <View style={[styles.filaSwitch, styles.filaSeparada]}>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>Notificaciones</Text>
              <Text style={styles.descOpcion}>Avisos de cambios en asistencia o revisiones.</Text>
            </View>
            <Switch disabled thumbColor={colores.superficie} trackColor={{ false: colores.borde, true: colores.acento }} value={false} />
          </View>

          <View style={[styles.filaSwitch, styles.filaSeparada]}>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>Permitir fotos</Text>
              <Text style={styles.descOpcion}>Evidencia fotográfica opcional por jornada.</Text>
            </View>
            <Switch disabled thumbColor={colores.superficie} trackColor={{ false: colores.borde, true: colores.acento }} value={false} />
          </View>

          <View style={[styles.filaSwitch, styles.filaSeparada]}>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>Exigir validación</Text>
              <Text style={styles.descOpcion}>Aprobación previa del responsable antes de acreditar.</Text>
            </View>
            <Switch disabled thumbColor={colores.superficie} trackColor={{ false: colores.borde, true: colores.acento }} value={false} />
          </View>
        </View>

        <Text style={styles.notaPie}>
          Los cambios aplican a jornadas nuevas. Los registros anteriores no cambian.
        </Text>

        <Boton cargando={guardando} icono="guardar" onPress={manejarGuardar} titulo="Guardar cambios" />
      </ScrollView>
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
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  botonVolver: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tituloBarra: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  espacioDerecha: {
    width: 40,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  tituloBloque: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  opcion: {
    alignItems: 'flex-start',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espaciados.md,
    padding: espaciados.md,
  },
  opcionActiva: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  radio: {
    alignItems: 'center',
    borderColor: colores.acento,
    borderRadius: radios.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    width: 20,
  },
  radioCentro: {
    backgroundColor: colores.acento,
    borderRadius: radios.pill,
    height: 10,
    width: 10,
  },
  opcionTexto: {
    flex: 1,
    gap: 2,
  },
  tituloOpcion: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  descOpcion: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
  },
  filaSwitch: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.md,
    justifyContent: 'space-between',
  },
  filaSeparada: {
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    paddingTop: espaciados.md,
  },
  encabezadoOpcional: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etiquetaProximamente: {
    backgroundColor: colores.completadaSuave,
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.sm,
    paddingVertical: 2,
  },
  textoProximamente: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.medio,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
});
