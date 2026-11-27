import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useSyncExternalStore } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Encabezado } from '@/components/ui/Encabezado';
import { Icono } from '@/components/ui/Icono';
import { type OpcionSelector, SelectorSegmentado } from '@/components/ui/SelectorSegmentado';
import {
  actualizarConfiguracionGrupo,
  obtenerGrupoPorId,
  obtenerIntegrantesActivos,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
  salirDelGrupo,
  suscribirStore,
} from '@/lib/gruposStore';
import { colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import { ErrorDominio, type ModalidadAsistencia, type ModoFotos } from '@/types/dominio';

const OPCIONES_MODALIDAD: readonly OpcionSelector<ModalidadAsistencia>[] = [
  {
    valor: 'manual',
    etiqueta: 'Manual',
    descripcion: 'El responsable pasa lista como presente, ausente o justificada.',
  },
  {
    valor: 'qr',
    etiqueta: 'Por QR',
    descripcion: 'Cada participante escanea un código temporal y el responsable puede corregir.',
  },
];

const OPCIONES_MODO_FOTOS: readonly OpcionSelector<ModoFotos>[] = [
  {
    valor: 'no_permitidas',
    etiqueta: 'No se usan',
    descripcion: 'Nadie puede subir fotos en las jornadas.',
  },
  {
    valor: 'opcionales',
    etiqueta: 'Opcionales',
    descripcion: 'Los integrantes pueden agregar fotos como evidencia.',
  },
  {
    valor: 'obligatorias',
    etiqueta: 'Obligatorias',
    descripcion: 'Cada integrante debe subir al menos una foto para que su asistencia cuente.',
  },
];

export default function ConfiguracionGrupoScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const leerGrupo = () => obtenerGrupoPorId(grupoId);
  const grupo = useSyncExternalStore(suscribirStore, leerGrupo, leerGrupo);
  const rol = grupoId ? obtenerMiRolEnGrupo(grupoId) : null;

  type Cambio = Partial<Parameters<typeof actualizarConfiguracionGrupo>[1]>;
  const [fallo, setFallo] = useState<{ mensaje: string; cambio: Cambio } | null>(null);
  const [sucesorId, setSucesorId] = useState<string | null>(null);
  const [errorSalida, setErrorSalida] = useState('');

  const guardarCambio = (cambio: Cambio) => {
    const actual = leerGrupo();
    if (!actual) return;

    try {
      actualizarConfiguracionGrupo(grupoId, { ...actual, ...cambio });
      setFallo(null);
    } catch (err) {
      setFallo({
        cambio,
        mensaje: err instanceof ErrorDominio
          ? err.message
          : 'No pudimos guardar el cambio. Intenta de nuevo.',
      });
    }
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

  const {
    modalidad_asistencia: modalidad,
    control_horas: controlHoras,
    gps_habilitado: gpsHabilitado,
    modo_fotos: modoFotos,
    requiere_validacion: requiereValidacion,
  } = grupo;

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
        {fallo ? (
          <Aviso
            accion={<Boton onPress={() => guardarCambio(fallo.cambio)} tamano="sm" titulo="Reintentar" variante="secundario" />}
            texto={fallo.mensaje}
            tipo="error"
          />
        ) : null}

        <View style={styles.tarjeta}>
          <Text style={styles.tituloBloque}>¿Cómo se registra la asistencia?</Text>
          <SelectorSegmentado
            accessibilityLabel="Cómo se registra la asistencia"
            onChange={(valor) => guardarCambio({ modalidad_asistencia: valor })}
            opciones={OPCIONES_MODALIDAD}
            valor={modalidad}
          />
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
              onValueChange={(valor) => guardarCambio({ control_horas: valor })}
              thumbColor={colores.superficie}
              trackColor={{ false: colores.bordeFuerte, true: colores.acento }}
              value={controlHoras}
            />
          </View>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloBloque}>Modo de fotografías</Text>
          <SelectorSegmentado
            accessibilityLabel="Modo de fotografías"
            onChange={(valor) => guardarCambio({ modo_fotos: valor })}
            opciones={OPCIONES_MODO_FOTOS}
            valor={modoFotos}
          />
        </View>

        <View style={styles.tarjeta}>
          <Pressable
            accessibilityLabel="Comprobar cercanía por GPS (solo QR)"
            accessibilityRole="switch"
            accessibilityState={{
              checked: modalidad === 'qr' ? gpsHabilitado : false,
              disabled: modalidad === 'manual',
            }}
            disabled={modalidad === 'manual'}
            onPress={() => guardarCambio({ gps_habilitado: !gpsHabilitado })}
            style={styles.filaSwitch}
          >
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloBloque}>Comprobar cercanía por GPS (solo QR)</Text>
              <Text style={styles.descOpcion}>
                {modalidad === 'manual'
                  ? 'Disponible solo cuando la asistencia es por QR.'
                  : 'Verifica al escanear que el participante esté a 100 m o menos del lugar.'}
              </Text>
            </View>
            <Switch
              disabled={modalidad === 'manual'}
              onValueChange={(valor) => guardarCambio({ gps_habilitado: valor })}
              thumbColor={colores.superficie}
              trackColor={{ false: colores.bordeFuerte, true: colores.acento }}
              value={modalidad === 'qr' ? gpsHabilitado : false}
            />
          </Pressable>
        </View>

        <View style={styles.tarjeta}>
          <Pressable
            accessibilityLabel="Exigir validación"
            accessibilityRole="switch"
            accessibilityState={{ checked: requiereValidacion }}
            onPress={() => guardarCambio({ requiere_validacion: !requiereValidacion })}
            style={styles.filaSwitch}
          >
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloBloque}>Exigir validación</Text>
              <Text style={styles.descOpcion}>
                Los registros cuentan cuando un responsable los aprueba.
              </Text>
            </View>
            <Switch
              onValueChange={(valor) => guardarCambio({ requiere_validacion: valor })}
              thumbColor={colores.superficie}
              trackColor={{ false: colores.bordeFuerte, true: colores.acento }}
              value={requiereValidacion}
            />
          </Pressable>
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
              <Text style={styles.tituloOpcion}>Notificaciones</Text>
              <Text style={styles.descOpcion}>Avisos de cambios en asistencia o revisiones.</Text>
            </View>
            <Switch disabled thumbColor={colores.superficie} trackColor={{ false: colores.borde, true: colores.acento }} value={false} />
          </View>
        </View>

        <Text style={styles.notaPie}>
          Los cambios aplican a jornadas nuevas. Los registros anteriores no cambian.
        </Text>


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
