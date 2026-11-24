import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores, espaciados, radios } from '@/lib/tema';

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
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.pantalla}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Registro de actividades</Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tituloFormulario}>Iniciar sesión</Text>

            <Text style={styles.etiqueta}>Correo electrónico</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={(valor) => {
                setCorreo(valor);
                if (errorCorreo) {
                  setErrorCorreo('');
                }
              }}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colores.textoSuave}
              style={[styles.campo, errorCorreo ? styles.campoError : null]}
              value={correo}
            />
            {errorCorreo ? <Text style={styles.textoError}>{errorCorreo}</Text> : null}

            <Text style={styles.etiqueta}>Contraseña</Text>
            <View style={[styles.campoContrasena, errorContrasena ? styles.campoError : null]}>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={(valor) => {
                  setContrasena(valor);
                  if (errorContrasena) {
                    setErrorContrasena('');
                  }
                }}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colores.textoSuave}
                secureTextEntry={!mostrarContrasena}
                style={styles.inputContrasena}
                value={contrasena}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setMostrarContrasena((visible) => !visible)}
                style={styles.botonVer}
              >
                <Text style={styles.textoVer}>{mostrarContrasena ? 'Ocultar' : 'Ver'}</Text>
              </Pressable>
            </View>
            {errorContrasena ? <Text style={styles.textoError}>{errorContrasena}</Text> : null}

            <Pressable
              accessibilityRole="button"
              onPress={manejarInicioSesion}
              style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
            >
              <Text style={styles.textoBoton}>Entrar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espaciados.lg,
  },
  encabezado: {
    marginBottom: espaciados.lg,
  },
  titulo: {
    color: colores.texto,
    fontSize: 28,
    fontWeight: '800',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  tituloFormulario: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: espaciados.md,
  },
  etiqueta: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: espaciados.xs,
    marginTop: espaciados.sm,
  },
  campo: {
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    color: colores.texto,
    fontSize: 16,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm + 4,
  },
  campoContrasena: {
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    flexDirection: 'row',
  },
  inputContrasena: {
    color: colores.texto,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm + 4,
  },
  botonVer: {
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm + 4,
  },
  textoVer: {
    color: colores.primario,
    fontSize: 13,
    fontWeight: '600',
  },
  campoError: {
    borderColor: '#DC2626',
  },
  textoError: {
    color: '#B91C1C',
    fontSize: 12,
    marginTop: espaciados.xs,
  },
  boton: {
    alignItems: 'center',
    backgroundColor: colores.primario,
    borderRadius: radios.md,
    marginTop: espaciados.lg,
    paddingVertical: espaciados.md,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  textoBoton: {
    color: colores.superficie,
    fontSize: 16,
    fontWeight: '700',
  },
});
