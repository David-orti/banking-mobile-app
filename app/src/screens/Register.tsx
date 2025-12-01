 import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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
  View
} from 'react-native';

import bcrypt from 'bcryptjs';
import { supabase } from '../../lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register: React.FC = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFirstname('');
    setLastname('');
    setMobile('');
    setEmail('');
    setPassword('');
    setConfirm('');
  };

  const validate = (): string | null => {
    if (!firstname.trim()) return 'Firstname is required';
    if (!lastname.trim()) return 'Lastname is required';
    if (!mobile.trim()) return 'Mobile number is required';
    if (!email.trim()) return 'Email is required';
    if (!EMAIL_RE.test(email)) return 'Email format is invalid';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const router = useRouter();

const handleRegister = async () => {
  const err = validate();
  if (err) {
    Alert.alert('Validation', err);
    return;
  }

  try {
    setLoading(true);

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const nowIso = new Date().toISOString();
    // genera número de cuenta de 10 dígitos
    const account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // balance inicial (puedes cambiar el valor)
    const initialBalance = 500000; // ejemplo $500.000

    const payload = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      mobile_number: mobile.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      status: true,
      created_at: nowIso,
      updated_at: nowIso,
      deleted_at: null as any,
    };

    // 1) Inserta user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(payload)
      .select()
      .single();

    if (userError) throw userError;

    // 2) Crea la cuenta asociada
    const accountPayload = {
      user_email: email.trim().toLowerCase(),
      account_number,
      account_type: 'savings',
      balance: initialBalance,
    };

    const { error: accErr } = await supabase.from('accounts').insert(accountPayload);
    if (accErr) {
      // si falla la cuenta, elimina user para no dejar datos huérfanos (opcional)
      await supabase.from('users').delete().eq('email', email.trim().toLowerCase());
      throw accErr;
    }

    // 3) Guardar sesión local (opcional: para que entre directo al Main)
    const userToStore = {
      ...userData,
      account_number,
      balance: initialBalance,
    };
    await AsyncStorage.setItem('session_user', JSON.stringify(userToStore));

    Alert.alert('Success', 'User registered successfully');

    resetForm();

    // navegar al Main y pasar user
   router.replace("./Main");


  } catch (e) {
    const s = (e as any)?.message || JSON.stringify(e);
    Alert.alert('Registration failed', s);
  } finally {
    setLoading(false);
  }
};

  
  // Frontend
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>

          <View style={styles.row}>
            <View style={[styles.inputWrap, { marginRight: 6 }]}>
              <Text style={styles.label}>Firstname</Text>
              <TextInput
                value={firstname}
                onChangeText={setFirstname}
                placeholder="Joan C."
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={[styles.inputWrap, { marginLeft: 6 }]}>
              <Text style={styles.label}>Lastname</Text>
              <TextInput
                value={lastname}
                onChangeText={setLastname}
                placeholder="Ayala"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Mobile number</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="3005998866"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="joan@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

          <Text style={styles.helper}>
            By registering you accept our terms and privacy policy.
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
    backgroundColor: '#0f172a', // slate-900
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111827', // gray-900
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
  row: {
    flexDirection: 'row',
  },
  inputWrap: {
    flex: 1,
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
});

export default Register;