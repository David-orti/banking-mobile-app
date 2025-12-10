import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    loadUser();
    checkPin();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("session_user");
    if (data) setUser(JSON.parse(data));
  };

  const checkPin = async () => {
    const pin = await AsyncStorage.getItem("security_pin");
    setHasPin(!!pin);
  };

  const logout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("session_user");
          router.replace("../../src/screens/Login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${user.firstname}+${user.lastname}&size=120`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>
          {user.firstname} {user.lastname}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📧 Correo</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📱 Teléfono</Text>
          <Text style={styles.value}>{user.mobile_number}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🏦 Cuenta</Text>
          <Text style={styles.value}>
            **** {user.account_number?.slice(-4) || "****"}
          </Text>
        </View>
      </View>

      {/* Sección de Seguridad */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seguridad</Text>

        <TouchableOpacity
          style={styles.securityBtn}
          onPress={() => router.push("../src/screens/SetupPin")}
        >
          <View style={styles.securityBtnContent}>
            <View>
              <Text style={styles.securityBtnTitle}>
                {hasPin ? "🔒 Cambiar PIN" : "🔓 Configurar PIN"}
              </Text>
              <Text style={styles.securityBtnSubtitle}>
                {hasPin
                  ? "PIN de seguridad activo"
                  : "Protege tus transacciones con un PIN"}
              </Text>
            </View>
            <Text style={styles.securityBtnArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {hasPin && (
          <TouchableOpacity
            style={[styles.securityBtn, { marginTop: 12 }]}
            onPress={() => router.push("../src/screens/VerifyPin")}
          >
            <View style={styles.securityBtnContent}>
              <View>
                <Text style={styles.securityBtnTitle}>🔐 Verificar PIN</Text>
                <Text style={styles.securityBtnSubtitle}>
                  Probar tu PIN de seguridad
                </Text>
              </View>
              <Text style={styles.securityBtnArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#22c55e",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  card: {
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  label: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  securityBtn: {
    backgroundColor: "#334155",
    padding: 16,
    borderRadius: 12,
  },
  securityBtnContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  securityBtnTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  securityBtnSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  securityBtnArrow: {
    fontSize: 24,
    color: "#22c55e",
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: "#ef4444",
    borderRadius: 12,
  },
  logoutText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
});