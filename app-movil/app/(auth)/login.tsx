import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Icono } from '@/components/ui/Icono';
import { crearCuenta, iniciarSesion, obtenerSesionActual } from '@/lib/gruposStore';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import { ErrorDominio } from '@/types/dominio';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();

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
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.pantalla}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.encabezado}>
            <View style={styles.marca}>
              <Icono color={colores.acento} nombre="gente" tamano={26} />
            </View>
            <Text accessibilityRole="header" style={styles.titulo}>
              Registro de actividades
            </Text>
            <Text style={styles.subtitulo}>Tu asistencia y tus horas, el mismo día.</Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tituloFormulario}>
              {modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
            </Text>

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
                  placeholder="Ej. Carlos González"
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
                placeholder="correo@ejemplo.com"
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
                    style={styles.botonVer}
                  >
                    <Text style={styles.textoVer}>{mostrarContrasena ? 'Ocultar' : 'Ver'}</Text>
                  </Pressable>
                }
                autoCapitalize="none"
                autoComplete="password"
                error={errorContrasena}
                etiqueta="Contraseña"
                onChangeText={(valor) => {
                  setContrasena(valor);
                  if (errorContrasena) setErrorContrasena('');
                }}
                placeholder="Mínimo 6 caracteres"
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

              {__DEV__ && !modoRegistro ? (
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

          <Text style={styles.notaPie}>
            Hay un solo tipo de cuenta. Tu rol depende de cada grupo.
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
  contenido: {
    flexGrow: 1,
    gap: espaciados.xl,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  encabezado: {
    gap: espaciados.sm,
  },
  marca: {
    alignItems: 'center',
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    marginBottom: espaciados.xs,
    width: 52,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.display,
    fontWeight: pesos.fuerte,
    letterSpacing: -0.4,
  },
  subtitulo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpo,
    lineHeight: 22,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.md,
    padding: espaciados.lg,
  },
  tituloFormulario: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.fuerte,
  },
  formulario: {
    gap: espaciados.md,
  },
  botonVer: {
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.xs,
  },
  textoVer: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  boton: {
    marginTop: espaciados.xs,
  },
  enlaceSecundario: {
    alignItems: 'center',
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
  notaPie: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
});
