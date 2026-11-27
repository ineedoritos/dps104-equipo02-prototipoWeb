import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Icono } from '@/components/ui/Icono';
import { crearCuenta, iniciarSesion, obtenerSesionActual } from '@/lib/gruposStore';
import { mostrarControlesDePrueba } from '@/lib/opcionesPrueba';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const anchoAmplio = width >= 600;
  const correoRef = useRef<ComponentRef<typeof TextInput>>(null);
  const contrasenaRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  useEffect(() => {
    if (obtenerSesionActual()) {
      router.replace('/(tabs)');
    }
  }, [router]);

  const limpiarErrores = () => {
    setErrorGeneral('');
    setErrorNombre('');
    setErrorCorreo('');
    setErrorContrasena('');
  };

  const cambiarModo = () => {
    limpiarErrores();
    setModoRegistro((prev) => !prev);
  };

  const manejarEnvio = () => {
    if (cargando) return;
    limpiarErrores();
    const correoLimpio = correo.trim();
    const nombreLimpio = nombre.trim();
    let valido = true;

    if (modoRegistro && !nombreLimpio) {
      setErrorNombre('Ingresa tu nombre completo.');
      valido = false;
    }

    if (!REGEX_CORREO.test(correoLimpio)) {
      setErrorCorreo('Ingresa un correo electrónico válido.');
      valido = false;
    }

    if (contrasena.length < 6) {
      setErrorContrasena('La contraseña debe tener al menos 6 caracteres.');
      valido = false;
    }

    if (!valido) {
      return;
    }

    setCargando(true);
    setTimeout(() => {
      try {
        if (modoRegistro) {
          crearCuenta(nombreLimpio, correoLimpio, contrasena);
        } else {
          iniciarSesion(correoLimpio, contrasena);
        }
        setCargando(false);
        router.replace('/(tabs)');
      } catch (err) {
        setCargando(false);
        if (err instanceof ErrorDominio) {
          setErrorGeneral(err.message);
        } else {
          setErrorGeneral('No pudimos completar el acceso. Intenta de nuevo.');
        }
      }
    }, 200);
  };

  const entrarComoDemo = () => {
    setCorreo('carlos@ejemplo.com');
    setContrasena('123456');
    limpiarErrores();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.marco}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'height' : undefined}
        style={styles.pantalla}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentContainerStyle={[styles.contenido, anchoAmplio && styles.contenidoAmplio]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.panel, anchoAmplio && styles.panelAmplio]}>
            <View style={styles.encabezado}>
              <Text accessibilityRole="header" style={styles.titulo}>
                {modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
              </Text>
              <Text style={styles.nombreApp}>Registro de actividades</Text>
            </View>

            {errorGeneral ? <Aviso texto={errorGeneral} tipo="error" /> : null}

            <View style={styles.formulario}>
              {modoRegistro ? (
                <CampoTexto
                  autoCapitalize="words"
                  error={errorNombre}
                  etiqueta="Nombre completo"
                  onChangeText={(valor) => {
                    setNombre(valor);
                    if (errorNombre) setErrorNombre('');
                  }}
                  onSubmitEditing={() => correoRef.current?.focus()}
                  placeholder="Ej. Carlos González"
                  returnKeyType="next"
                  submitBehavior="submit"
                  value={nombre}
                />
              ) : null}

              <CampoTexto
                autoCapitalize="none"
                autoComplete="email"
                error={errorCorreo}
                etiqueta="Correo"
                keyboardType="email-address"
                onChangeText={(valor) => {
                  setCorreo(valor);
                  if (errorCorreo) setErrorCorreo('');
                }}
                onSubmitEditing={() => contrasenaRef.current?.focus()}
                placeholder="correo@ejemplo.com"
                ref={correoRef}
                returnKeyType="next"
                submitBehavior="submit"
                value={correo}
              />

              <CampoTexto
                accesorio={
                  <Pressable
                    accessibilityLabel={
                      mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    accessibilityRole="button"
                    onPress={() => setMostrarContrasena((visible) => !visible)}
                    style={({ pressed }) => [styles.botonVer, pressed && { opacity: 0.65 }]}
                  >
                    <Icono
                      color={colores.tintaSuave}
                      nombre={mostrarContrasena ? 'ocultar' : 'ver'}
                      tamano={22}
                    />
                  </Pressable>
                }
                autoCapitalize="none"
                autoComplete={modoRegistro ? 'new-password' : 'current-password'}
                error={errorContrasena}
                etiqueta="Contraseña"
                onChangeText={(valor) => {
                  setContrasena(valor);
                  if (errorContrasena) setErrorContrasena('');
                }}
                onSubmitEditing={manejarEnvio}
                placeholder={modoRegistro ? 'Mínimo 6 caracteres' : undefined}
                ref={contrasenaRef}
                returnKeyType="go"
                secureTextEntry={!mostrarContrasena}
                value={contrasena}
              />

              <Boton
                cargando={cargando}
                estilo={styles.boton}
                onPress={manejarEnvio}
                titulo={modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
              />

              <Pressable
                accessibilityRole="button"
                disabled={cargando}
                onPress={cambiarModo}
                style={styles.enlaceSecundario}
              >
                <Text style={styles.textoEnlace}>
                  {modoRegistro
                    ? '¿Ya tienes cuenta? Iniciar sesión'
                    : '¿No tienes cuenta? Crear cuenta'}
                </Text>
              </Pressable>

              {mostrarControlesDePrueba && !modoRegistro ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={entrarComoDemo}
                  style={styles.atajoDemo}
                >
                  <Text style={styles.textoAtajo}>Usar cuenta de prueba (carlos@ejemplo.com)</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  marco: { backgroundColor: colores.papel, flex: 1 },
  pantalla: {
    backgroundColor: colores.papel,
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    alignItems: 'center',
    gap: espaciados.lg,
    justifyContent: 'center',
    paddingHorizontal: espaciados.lg,
    paddingVertical: espaciados.xl,
  },
  contenidoAmplio: {
    padding: espaciados.xxl,
  },
  encabezado: {
    gap: espaciados.xs,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.display,
    fontWeight: pesos.encabezado,
    letterSpacing: -0.6,
  },
  nombreApp: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpo,
  },
  panel: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.modal,
    borderWidth: 1,
    gap: espaciados.xl,
    maxWidth: 480,
    padding: espaciados.xl,
    width: '100%',
  },
  panelAmplio: {
    padding: espaciados.xxl,
  },
  formulario: {
    gap: espaciados.lg,
  },
  botonVer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  boton: {
    marginTop: espaciados.xs,
  },
  enlaceSecundario: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: espaciados.sm,
  },
  textoEnlace: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  atajoDemo: {
    alignItems: 'center',
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    paddingTop: espaciados.sm,
  },
  textoAtajo: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
  },
});
