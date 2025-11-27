/*
  Login.tsx
  Corregido para usar bcryptjs y autenticar contra la tabla users
*/

import 'react-native-get-random-values';

import bcrypt from "bcryptjs"; // 👈❗ IMPORTANTE
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<string>('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const emailError = (): string | null => {
    if (!email.trim()) return 'Email requerido';
    if (!EMAIL_RE.test(email)) return 'Formato de email inválido';
    return null;
  };

  const passwordError = (): string | null => {
    if (!password) return 'Contraseña requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const validateAll = (): string | null => {
    const errs = [emailError(), passwordError()].filter(Boolean);
    return errs.length > 0 ? (errs[0] as string) : null;
  };

  const inputBorderColor = (name: string) =>
    focused === name ? styles.inputFocus.borderColor : styles.input.borderColor;

  // 🚀 LOGIN REAL
  const handleSignIn = async () => {
    setTouched({ email: true, password: true });

    const err = validateAll();
    if (err) {
      Alert.alert("Validación", err);
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Buscar usuario por email
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (error || !user) {
        Alert.alert("Error", "Usuario no encontrado");
        return;
      }

      // 2️⃣ Comparar contraseñas con bcrypt
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        Alert.alert("Error", "Contraseña incorrecta");
        return;
      }

      // 3️⃣ Login exitoso
      Alert.alert("Success", "Inicio de sesión exitoso");
      router.push("/src/screens/Main");

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Hubo un problema al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/src/screens/Register');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>

          <Text style={styles.title}>Sign in</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="jane@example.com"
              placeholderTextColor="#FFFFFF99"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { borderColor: inputBorderColor('email') }]}
              onFocus={() => setFocused('email')}
              onBlur={() => { setFocused(''); setTouched(t => ({ ...t, email: true })); }}
            />
            {touched.email && emailError() && (
              <Text style={styles.errorText}>{emailError()}</Text>
            )}
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#FFFFFF99"
              secureTextEntry
              style={[styles.input, { borderColor: inputBorderColor('password') }]}
              onFocus={() => setFocused('password')}
              onBlur={() => { setFocused(''); setTouched(t => ({ ...t, password: true })); }}
            />
            {touched.password && passwordError() && (
              <Text style={styles.errorText}>{passwordError()}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>

          <Text style={styles.helper}>
            Don't have an account? <Text style={styles.link} onPress={goToRegister}>Sign up</Text>
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputWrap: {
    marginVertical: 6,
  },
  label: {
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: 'white',
  },
  inputFocus: {
    borderColor: '#16a34a',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#0b1421',
    fontWeight: '700',
    fontSize: 16,
  },
  helper: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  link: {
    color: '#93c5fd',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#f87171',
    marginTop: 6,
    fontSize: 13,
  },
});

export default Login;