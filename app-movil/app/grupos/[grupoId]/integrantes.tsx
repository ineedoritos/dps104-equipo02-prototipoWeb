import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { type ComponentRef, useCallback, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PestanasGrupo } from '@/components/grupos/PestanasGrupo';
import { Aviso } from '@/components/ui/Aviso';
import { BarraSuperior } from '@/components/ui/BarraSuperior';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Icono } from '@/components/ui/Icono';
import {
  agregarIntegrantePorCorreo,
  cambiarRolIntegrante,
  obtenerGrupoPorId,
  obtenerIntegrantesActivos,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
  retirarIntegrante,
  suscribirStore,
  transferirResponsableYSalir,
} from '@/lib/gruposStore';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio, type IntegranteConUsuario, type RolGrupo } from '@/types/dominio';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IntegrantesScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  const [integrantes, setIntegrantes] = useState<IntegranteConUsuario[]>(() =>
    grupoId ? obtenerIntegrantesActivos(grupoId) : [],
  );
  const [rolActual, setRolActual] = useState<RolGrupo | null>(() =>
    grupoId ? obtenerMiRolEnGrupo(grupoId) : null,
  );
  const [correoNuevo, setCorreoNuevo] = useState('');
  const [rolInicial, setRolInicial] = useState<RolGrupo>('participante');
  const [cargando, setCargando] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const formularioScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [errorSucesor, setErrorSucesor] = useState('');
  const [modalSucesor, setModalSucesor] = useState(false);
  const [sucesorId, setSucesorId] = useState<string | null>(null);

  const sesion = obtenerSesionActual();
  const grupo = grupoId ? obtenerGrupoPorId(grupoId) : undefined;

  const recargar = useCallback(() => {
    if (!grupoId) {
      return;
    }
    setIntegrantes(obtenerIntegrantesActivos(grupoId));
    setRolActual(obtenerMiRolEnGrupo(grupoId));
  }, [grupoId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
      return suscribirStore(recargar);
    }, [recargar]),
  );

  const manejarAgregar = () => {
    if (!grupoId) {
      return;
    }
    setErrorAccion('');
    const correoLimpio = correoNuevo.trim();
    if (!REGEX_CORREO.test(correoLimpio)) {
      setErrorCorreo('Ingresa un correo electrónico válido.');
      return;
    }

    setErrorCorreo('');
    setCargando(true);

    setTimeout(() => {
      try {
        agregarIntegrantePorCorreo(grupoId, correoLimpio, rolInicial);
        setCorreoNuevo('');
        setRolInicial('participante');
        setCargando(false);
        recargar();
      } catch (err) {
        setCargando(false);
        if (err instanceof ErrorDominio) {
          setErrorAccion(err.message);
        } else {
          setErrorAccion('No pudimos agregar a la persona. Intenta de nuevo.');
        }
      }
    }, 200);
  };

  const manejarCambiarRol = (integrante: IntegranteConUsuario, nuevoRol: RolGrupo) => {
    if (!grupoId || integrante.rol === nuevoRol) {
      return;
    }
    setErrorAccion('');
    try {
      cambiarRolIntegrante(grupoId, integrante.id, nuevoRol);
      recargar();
    } catch (err) {
      if (err instanceof ErrorDominio) {
        setErrorAccion(err.message);
      }
    }
  };

  const confirmarRetiro = (integrante: IntegranteConUsuario) => {
    if (!grupoId) {
      return;
    }
    const esPropio = integrante.usuario_id === sesion?.id;
    const totalResponsables = integrantes.filter((i) => i.rol === 'responsable').length;
    const esUltimoResponsable = esPropio && integrante.rol === 'responsable' && totalResponsables <= 1;

    if (esUltimoResponsable) {
      setSucesorId(null);
      setErrorSucesor('');
      setModalSucesor(true);
      return;
    }

    Alert.alert(
      esPropio ? 'Salir del grupo' : 'Retirar integrante',
      esPropio
        ? '¿Seguro que quieres salir de este grupo? Tu historial se conservará.'
        : `¿Seguro que quieres retirar a ${integrante.usuario.nombre}? Su historial se conservará.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: esPropio ? 'Salir' : 'Retirar',
          style: 'destructive',
          onPress: () => {
            setErrorAccion('');
            try {
              retirarIntegrante(grupoId, integrante.id);
              if (esPropio) {
                router.dismissTo('/(tabs)');
                return;
              }
              recargar();
            } catch (err) {
              if (err instanceof ErrorDominio) {
                setErrorAccion(err.message);
              }
            }
          },
        },
      ],
    );
  };

  const manejarDesignarYSalir = () => {
    if (!grupoId || !sucesorId) {
      return;
    }
    setErrorSucesor('');
    try {
      transferirResponsableYSalir(grupoId, sucesorId);
      setModalSucesor(false);
      router.dismissTo('/(tabs)');
    } catch (err) {
      setErrorSucesor(
        err instanceof ErrorDominio
          ? err.message
          : 'No pudimos transferir el rol. Intenta de nuevo.',
      );
    }
  };

  if (!grupo || rolActual !== 'responsable') {
    return (
      <SafeAreaView edges={['bottom']} style={styles.pantalla}>
        <BarraSuperior titulo="Integrantes" />
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
            texto="Solo un responsable activo puede administrar los integrantes del grupo."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  const candidatosSucesor = integrantes.filter((i) => i.usuario_id !== sesion?.id);
  const sucesorVigente = candidatosSucesor.some(({ id }) => id === sucesorId);

  return (
    <SafeAreaView edges={['bottom']} style={styles.pantalla}>
      <BarraSuperior titulo={grupo.nombre} />
      <PestanasGrupo actual="integrantes" esResponsable grupoId={grupo.id} />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        ref={formularioScroll}
      >
        {errorAccion ? <Aviso texto={errorAccion} tipo="error" /> : null}

        <View style={styles.tarjeta}>
          <Text style={styles.tituloBloque}>Agregar por correo</Text>

          <CampoTexto
            autoCapitalize="none"
            autoComplete="email"
            error={errorCorreo}
            etiqueta="Correo de cuenta existente"
            keyboardType="email-address"
            onChangeText={(valor) => {
              setCorreoNuevo(valor);
              if (errorCorreo) setErrorCorreo('');
            }}
            placeholder="persona@ejemplo.com"
            value={correoNuevo}
          />

          <View accessibilityRole="radiogroup" style={styles.selectorRol}>
            {(['participante', 'responsable'] as const).map((rolOpcion) => {
              const activo = rolInicial === rolOpcion;
              return (
                <Pressable
                  key={rolOpcion}
                  accessibilityRole="button"
                  onPress={() => setRolInicial(rolOpcion)}
                  style={[styles.opcionRol, activo && styles.opcionRolActiva]}
                >
                  <Text style={[styles.textoOpcionRol, activo && styles.textoOpcionRolActiva]}>
                    {rolOpcion === 'participante' ? 'Participante' : 'Responsable'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Boton cargando={cargando} icono="agregarPersona" onPress={manejarAgregar} titulo="Agregar integrante" />
        </View>

        <View style={styles.encabezadoLista}>
          <Text style={[styles.contador, cifrasTabulares]}>
            {integrantes.length} {integrantes.length === 1 ? 'integrante' : 'integrantes'}
          </Text>
        </View>

        <View style={styles.lista}>
          {integrantes.map((item) => {
            const esPropio = item.usuario_id === sesion?.id;
            return (
              <View key={item.id} style={styles.tarjetaIntegrante}>
                <View style={styles.filaInfo}>
                  <View style={styles.datosPersona}>
                    <Text style={styles.nombrePersona}>
                      {item.usuario.nombre}
                      {esPropio ? ' (tú)' : ''}
                    </Text>
                    <Text style={styles.correoPersona}>{item.usuario.correo}</Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => confirmarRetiro(item)}
                    style={styles.botonRetirar}
                  >
                    <Text style={styles.textoRetirar}>
                      {esPropio ? 'Salir del grupo' : 'Retirar'}
                    </Text>
                  </Pressable>
                </View>

                {esPropio ? (
                  <View style={styles.rolPropioFijo}>
                    <Text style={styles.textoRolPropio}>
                      Tu rol: {item.rol === 'responsable' ? 'Responsable' : 'Participante'}
                    </Text>
                  </View>
                ) : (
                  <View accessibilityRole="radiogroup" style={styles.selectorRol}>
                    {(['participante', 'responsable'] as const).map((rolOpcion) => {
                      const activo = item.rol === rolOpcion;
                      return (
                        <Pressable
                          key={rolOpcion}
                          accessibilityRole="button"
                          onPress={() => manejarCambiarRol(item, rolOpcion)}
                          style={[styles.opcionRol, activo && styles.opcionRolActiva]}
                        >
                          <Text
                            style={[styles.textoOpcionRol, activo && styles.textoOpcionRolActiva]}
                          >
                            {rolOpcion === 'participante' ? 'Participante' : 'Responsable'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.notaPie}>
          El grupo debe conservar al menos una persona responsable.
        </Text>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setModalSucesor(false)}
        transparent
        visible={modalSucesor}
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.veloModal}>
          <View accessibilityViewIsModal style={styles.tarjetaModal}>
            <Text accessibilityRole="header" style={styles.tituloModal}>Salir del grupo</Text>
            {candidatosSucesor.length > 0 ? (
              <>
                <Text style={styles.cuerpoModal}>
                  Elige quién quedará a cargo del grupo antes de salir.
                </Text>
                <ScrollView contentContainerStyle={styles.listaSucesores}>
                  {candidatosSucesor.map((cand) => {
                    const elegido = sucesorId === cand.id;
                    return (
                      <Pressable
                        key={cand.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: elegido }}
                        onPress={() => {
                          setSucesorId(cand.id);
                          setErrorSucesor('');
                        }}
                        style={[styles.opcionSucesor, elegido && styles.opcionSucesorActiva]}
                      >
                        <Icono
                          color={elegido ? colores.acento : colores.tintaSuave}
                          nombre={elegido ? 'hecho' : 'cuenta'}
                          tamano={20}
                        />
                        <View style={styles.datosPersona}>
                          <Text style={styles.nombrePersona}>{cand.usuario.nombre}</Text>
                          <Text style={styles.correoPersona}>{cand.usuario.correo}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                {errorSucesor ? <Aviso texto={errorSucesor} tipo="error" /> : null}
                <View style={styles.botonesModal}>
                  <Boton
                    estilo={styles.botonModal}
                    onPress={() => setModalSucesor(false)}
                    titulo="Cancelar"
                    variante="secundario"
                  />
                  <Boton
                    deshabilitado={!sucesorVigente}
                    estilo={styles.botonModal}
                    icono="salir"
                    onPress={manejarDesignarYSalir}
                    titulo="Designar y salir"
                    variante="peligro"
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.cuerpoModal}>
                  Primero agrega a otra persona para que el grupo pueda quedar a su cargo.
                </Text>
                <Boton
                  icono="agregarPersona"
                  onPress={() => {
                    setModalSucesor(false);
                    formularioScroll.current?.scrollTo({ y: 0, animated: false });
                  }}
                  titulo="Ir a agregar integrante"
                />
                <Boton onPress={() => setModalSucesor(false)} titulo="Cancelar" variante="fantasma" />
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  selectorRol: {
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    padding: espaciados.xs,
  },
  opcionRol: {
    alignItems: 'center',
    borderRadius: radios.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    padding: espaciados.xs,
  },
  opcionRolActiva: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
  },
  textoOpcionRol: {
    textAlign: 'center',
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  textoOpcionRolActiva: {
    color: colores.acento,
    fontWeight: pesos.fuerte,
  },
  rolPropioFijo: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
    borderRadius: radios.campo,
    borderWidth: 1,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  textoRolPropio: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  encabezadoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contador: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  lista: {
    gap: espaciados.md,
  },
  tarjetaIntegrante: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  filaInfo: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'space-between',
  },
  datosPersona: {
    flex: 1,
    gap: 2,
  },
  nombrePersona: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontWeight: pesos.fuerte,
  },
  correoPersona: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  botonRetirar: {
    backgroundColor: colores.ausenteSuave,
    borderRadius: radios.campo,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: espaciados.sm,
    maxWidth: '42%',
  },
  textoRetirar: {
    color: colores.ausente,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
    fontWeight: pesos.fuerte,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
    textAlign: 'center',
  },
  veloModal: {
    alignItems: 'center',
    backgroundColor: colores.velo,
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  tarjetaModal: {
    maxHeight: '100%',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
    width: '100%',
  },
  tituloModal: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  cuerpoModal: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
  listaSucesores: {
    gap: espaciados.sm,
  },
  opcionSucesor: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espaciados.md,
    minHeight: 48,
    padding: espaciados.md,
  },
  opcionSucesorActiva: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
  },
  botonesModal: {
    flexDirection: 'row',
    gap: espaciados.md,
  },
  botonModal: {
    flex: 1,
  },
});
