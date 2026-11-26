import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
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
                router.replace('/(tabs)');
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

  if (!grupo || rolActual !== 'responsable') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.botonVolver}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
          <Text style={styles.tituloBarra}>Integrantes</Text>
          <View style={styles.espacioDerecha} />
        </View>
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
            texto="Solo un responsable activo puede administrar los integrantes del grupo."
            tipo="error"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <View style={styles.barraSuperior}>
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.botonVolver}
        >
          <Icono color={colores.tinta} nombre="volver" tamano={22} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.tituloBarra}>
          Integrantes
        </Text>
        <View style={styles.espacioDerecha} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.pantalla}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
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

          <View style={styles.selectorRol}>
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

          <Boton cargando={cargando} onPress={manejarAgregar} titulo="Agregar" />
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
                      Tu rol: {item.rol === 'responsable' ? 'Responsable' : 'Participante'} (no se puede cambiar aquí)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.selectorRol}>
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
          Un rol por grupo. El último responsable no puede salir ni ser retirado. Al retirar a
          alguien, su historial se conserva.
        </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  selectorRol: {
    backgroundColor: colores.superficieAlt,
    borderColor: colores.borde,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  opcionRol: {
    alignItems: 'center',
    borderRadius: radios.sm,
    flex: 1,
    paddingVertical: espaciados.sm,
  },
  opcionRolActiva: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
  },
  textoOpcionRol: {
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
    borderRadius: radios.pill,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.xs,
  },
  textoRetirar: {
    color: colores.ausente,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
  },
  notaPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
    textAlign: 'center',
  },
});
