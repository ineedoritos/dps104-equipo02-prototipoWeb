import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Icono } from '@/components/ui/Icono';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  const manejarInicioSesion = () => {
    const correoLimpio = correo.trim();
    let valido = true;

    if (!REGEX_CORREO.test(correoLimpio)) {
      setErrorCorreo('Ingresa un correo electrónico válido.');
      valido = false;
    } else {
      setErrorCorreo('');
    }

    if (contrasena.length < 6) {
      setErrorContrasena('La contraseña debe tener al menos 6 caracteres.');
      valido = false;
    } else {
      setErrorContrasena('');
    }

    if (!valido) {
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.pantalla}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.encabezado}>
            <View style={styles.marca}>
              <Icono color={colores.acento} nombre="gente" tamano={26} />
            </View>
            <Text accessibilityRole="header" style={styles.titulo}>
              Registro de jornadas
            </Text>
            <Text style={styles.subtitulo}>
              Consulta tus grupos y registra la asistencia de cada jornada.
            </Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tituloFormulario}>Iniciar sesión</Text>

            <View style={styles.formulario}>
              <CampoTexto
                autoCapitalize="none"
                autoComplete="email"
                error={errorCorreo}
                etiqueta="Correo electrónico"
                keyboardType="email-address"
                onChangeText={(valor) => {
                  setCorreo(valor);
                  if (errorCorreo) {
                    setErrorCorreo('');
                  }
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
                  if (errorContrasena) {
                    setErrorContrasena('');
                  }
                }}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry={!mostrarContrasena}
                value={contrasena}
              />

              <Boton estilo={styles.boton} onPress={manejarInicioSesion} titulo="Entrar" />
            </View>
          </View>
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
    borderRadius: radios.tarjeta,
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
    lineHeight: tipografia.display + 4,
  },
  subtitulo: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.lg,
    padding: espaciados.lg,
  },
  tituloFormulario: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  formulario: {
    gap: espaciados.md,
  },
  botonVer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: espaciados.md,
  },
  textoVer: {
    color: colores.acento,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  boton: {
    marginTop: espaciados.xs,
  },
});
