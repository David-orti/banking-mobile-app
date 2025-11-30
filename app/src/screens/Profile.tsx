import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("session_user"); // 🔥 CORREGIDO
    if (data) setUser(JSON.parse(data));
  };

  const logout = async () => {
    await AsyncStorage.removeItem("session_user"); // 🔥 CORREGIDO
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {user && (
        <>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>
            {user.firstname} {user.lastname}
          </Text>

          <Text style={styles.label}>Correo</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Número</Text>
          <Text style={styles.value}>{user.mobile_number}</Text>
        </>
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#0f172a", // 🔥 Fondo dark
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
    color: "white",
  },
  label: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 15,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  logout: {
    marginTop: 50,
    padding: 15,
    backgroundColor: "#ef4444",
    borderRadius: 10,
  },
  logoutText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
