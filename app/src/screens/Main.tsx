// app/src/screens/Main.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Main() {
  const router = useRouter();
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("session_user");
        if (stored) {
          setUserData(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error cargando usuario:", e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("session_user");
    router.replace("/src/screens/Login");
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando...</Text>
      </View>
    );

  if (!userData)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>No hay sesión activa.</Text>
        <TouchableOpacity onPress={() => router.replace("/src/screens/Login")}>
          <Text style={{ color: "#38bdf8", marginTop: 12 }}>Ir al login</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.name}>{userData.firstname} 👋</Text>
        </View>

        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${userData.firstname}`,
          }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cuenta Principal</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Número:</Text>
          <Text style={styles.value}>{userData.account_number ?? "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>Ahorros</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Saldo:</Text>
          <Text style={styles.balance}>${userData.balance ?? 0}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={styles.value}>Activa</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  greeting: { color: "#94a3b8", fontSize: 18 },
  name: { color: "white", fontSize: 26, fontWeight: "700" },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { color: "#94a3b8", fontSize: 14 },
  value: { color: "white", fontSize: 16, fontWeight: "600" },
  balance: { color: "#22c55e", fontSize: 20, fontWeight: "800" },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 40,
    alignItems: "center",
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "700" },
});