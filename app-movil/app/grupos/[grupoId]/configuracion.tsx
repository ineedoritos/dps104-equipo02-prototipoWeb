import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { Icono } from '@/components/ui/Icono';
import {
  actualizarConfiguracionGrupo,
  obtenerGrupoPorId,
  obtenerIntegrantesActivos,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
  salirDelGrupo,
} from '@/lib/gruposStore';
import { colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
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
  const [sucesorId, setSucesorId] = useState<string | null>(null);
  const [errorSalida, setErrorSalida] = useState('');

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
        <Encabezado onVolver={() => router.back()} titulo="Configuración" />
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
            texto="Solo un responsable activo puede editar la configuración del grupo."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const sesion = obtenerSesionActual();
  const otrosIntegrantes = obtenerIntegrantesActivos(grupo.id).filter(
    (i) => i.usuario_id !== sesion?.id,
  );
  const hayOtroResponsable = otrosIntegrantes.some((i) => i.rol === 'responsable');
  const sucesor = otrosIntegrantes.find((i) => i.id === sucesorId);
  const puedeSalir = otrosIntegrantes.length > 0 && (hayOtroResponsable || Boolean(sucesor));

  const confirmarSalida = () => {
    setErrorSalida('');
    Alert.alert(
      'Salir del grupo',
      sucesor
        ? `${sucesor.usuario.nombre} quedará como responsable. Tu historial se conservará.`
        : '¿Seguro que quieres salir de este grupo? Tu historial se conservará.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            try {
              salirDelGrupo(grupo.id, sucesor?.id);
              router.replace('/(tabs)');
            } catch (err) {
              setErrorSalida(
                err instanceof ErrorDominio
                  ? err.message
                  : 'No pudimos sacarte del grupo. Intenta de nuevo.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <Encabezado onVolver={() => router.back()} titulo="Configuración" />

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

        <Boton cargando={guardando} onPress={manejarGuardar} titulo="Guardar cambios" />

        <View style={styles.tarjeta}>
          <Text style={styles.tituloBloque}>Salir del grupo</Text>

          {otrosIntegrantes.length === 0 ? (
            <Text style={styles.descOpcion}>
              Eres el único integrante. Agrega a alguien desde Integrantes antes de salir.
            </Text>
          ) : hayOtroResponsable ? (
            <Text style={styles.descOpcion}>
              Tu historial se conserva. Podrás volver si alguien te agrega de nuevo.
            </Text>
          ) : (
            <>
              <Text style={styles.descOpcion}>
                Eres el único responsable. Elige quién quedará a cargo antes de salir.
              </Text>
              <View accessibilityRole="radiogroup" style={styles.listaSucesores}>
                {otrosIntegrantes.map((integrante) => {
                  const elegido = sucesorId === integrante.id;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: elegido }}
                      key={integrante.id}
                      onPress={() => setSucesorId(integrante.id)}
                      style={[styles.sucesor, elegido && styles.sucesorElegido]}
                    >
                      <View style={styles.opcionTexto}>
                        <Text style={styles.tituloOpcion}>{integrante.usuario.nombre}</Text>
                        <Text style={styles.descOpcion}>{integrante.usuario.correo}</Text>
                      </View>
                      {elegido ? <Icono color={colores.info} nombre="hecho" tamano={20} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {errorSalida ? <Aviso texto={errorSalida} tipo="error" /> : null}

          {otrosIntegrantes.length > 0 ? (
            <Boton
              deshabilitado={!puedeSalir}
              icono="cancelar"
              onPress={confirmarSalida}
              titulo={sucesor ? `Salir y dejar a ${sucesor.usuario.nombre}` : 'Salir del grupo'}
              variante="peligro"
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listaSucesores: {
    gap: espaciados.sm,
  },
  sucesor: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.lg,
    flexDirection: 'row',
    gap: espaciados.md,
    minHeight: 56,
    paddingHorizontal: espaciados.lg,
    paddingVertical: espaciados.sm,
  },
  sucesorElegido: {
    backgroundColor: colores.infoSuave,
  },
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  contenido: {
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  tituloBloque: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  opcion: {
    alignItems: 'flex-start',
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.campo,
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
    fontFamily: fuentes.fuerte,
  },
  descOpcion: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
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
    fontFamily: fuentes.medio,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
});
