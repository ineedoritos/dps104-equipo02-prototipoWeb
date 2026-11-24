import { useRouter } from 'expo-router';
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

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.pantalla}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.encabezado}>
            <View style={styles.insignia}>
              <Text style={styles.insigniaTexto}>UDB · DPS104</Text>
            </View>
            <Text style={styles.titulo}>Registro de actividades</Text>
            <Text style={styles.subtitulo}>
              Organiza jornadas, pases de lista y horas de servicio desde tu teléfono.
            </Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tituloFormulario}>Iniciar sesión</Text>

            <Text style={styles.etiqueta}>Correo electrónico</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colores.textoSuave}
              style={styles.campo}
            />

            <Text style={styles.etiqueta}>Contraseña</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colores.textoSuave}
              secureTextEntry
              style={styles.campo}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(tabs)')}
              style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
            >
              <Text style={styles.textoBoton}>Entrar a la demo</Text>
            </Pressable>

            <Text style={styles.nota}>
              La autenticación con correo y contraseña estará disponible muy pronto.
            </Text>
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
  insignia: {
    alignSelf: 'flex-start',
    backgroundColor: colores.primarioSuave,
    borderRadius: radios.sm,
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.xs,
  },
  insigniaTexto: {
    color: colores.primario,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  titulo: {
    color: colores.texto,
    fontSize: 30,
    fontWeight: '800',
    marginTop: espaciados.md,
  },
  subtitulo: {
    color: colores.textoSuave,
    fontSize: 16,
    lineHeight: 23,
    marginTop: espaciados.sm,
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
  nota: {
    color: colores.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    marginTop: espaciados.md,
    textAlign: 'center',
  },
});
