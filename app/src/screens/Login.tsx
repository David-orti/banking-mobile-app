import AsyncStorage from "@react-native-async-storage/async-storage";
import bcrypt from "bcryptjs";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { supabase } from "../../lib/supabase"; // verifica tu ruta

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email o móvil
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      console.log("[Login] identificador:", identifier);

      const isEmail = identifier.includes("@");
      const field = isEmail ? "email" : "mobile_number";

      console.log("[Login] buscando por:", field);

      const { data: users, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq(field, identifier)
        .limit(1);

      if (userError) {
        console.error("[Login] supabase error:", userError);
        throw userError;
      }

      if (!users || users.length === 0) {
        Alert.alert("Error", "Usuario no encontrado.");
        return;
      }

      const user = users[0];
      console.log("[Login] usuario encontrado:", user.email);

      // Verificar contraseña con bcrypt
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        Alert.alert("Error", "Contraseña incorrecta.");
        return;
      }

      // Traer cuenta principal
      let account = null;
      try {
        const { data: accData } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_email", user.email)
          .limit(1);

        if (accData && accData.length > 0) account = accData[0];
      } catch (accErr) {
        console.warn("[Login] error account:", accErr);
      }

      const userToStore = { ...user, account };
      await AsyncStorage.setItem("session_user", JSON.stringify(userToStore));
      console.log("[Login] sesión guardada");

      Alert.alert("Éxito", "Inicio de sesión correcto.");

      // Navegar al Main
      try {
        router.replace("/src/screens/Main");
      } catch {
        router.replace("/");
      }
    } catch (e: any) {
      console.error("[Login] error:", e);
      Alert.alert("Error", e.message || "Hubo un problema inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo o Número móvil"
          placeholderTextColor="#94a3b8"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/src/screens/Register")}
          style={{ marginTop: 15 }}
        >
          <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí.</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#22c55e",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  link: {
    color: "#38bdf8",
    fontSize: 15,
    textAlign: "center",
  },
});
