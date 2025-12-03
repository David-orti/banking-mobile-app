// app/(tabs)/index.tsx
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.name}>{userData.firstname} 👋</Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/src/screens/Profile")}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${userData.firstname}`,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balance}>${userData.balance ?? 0}</Text>
        <Text style={styles.accountNumber}>
          **** {userData.account_number?.slice(-4) ?? "****"}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/src/screens/NewTransaction")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#22c55e" }]}>
            <Text style={styles.actionEmoji}>💸</Text>
          </View>
          <Text style={styles.actionText}>Transferir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/src/screens/Transactions")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#3b82f6" }]}>
            <Text style={styles.actionEmoji}>📊</Text>
          </View>
          <Text style={styles.actionText}>Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/src/screens/Cards")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#8b5cf6" }]}>
            <Text style={styles.actionEmoji}>💳</Text>
          </View>
          <Text style={styles.actionText}>Tarjetas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/src/screens/Accounts")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#f59e0b" }]}>
            <Text style={styles.actionEmoji}>🏦</Text>
          </View>
          <Text style={styles.actionText}>Cuentas</Text>
        </TouchableOpacity>
      </View>

      {/* Account Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mi Cuenta</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Número de cuenta</Text>
          <Text style={styles.value}>{userData.account_number ?? "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tipo</Text>
          <Text style={styles.value}>Ahorros</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ Activa</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={() => router.push("/src/screens/AccountDetails")}
        >
          <Text style={styles.viewDetailsText}>Ver detalles completos →</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Preview */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Actividad reciente</Text>
          <TouchableOpacity
            onPress={() => router.push("/src/screens/Transactions")}
          >
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            <Text>📥</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>Depósito inicial</Text>
            <Text style={styles.transactionDate}>Hoy</Text>
          </View>
          <Text style={styles.transactionAmount}>+${userData.balance ?? 0}</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
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
  balanceCard: {
    backgroundColor: "#1e293b",
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#334155",
  },
  balanceLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 8,
  },
  balance: {
    color: "#22c55e",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  accountNumber: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: { color: "#94a3b8", fontSize: 14 },
  value: { color: "white", fontSize: 15, fontWeight: "600" },
  statusBadge: {
    backgroundColor: "#22c55e20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "600",
  },
  viewDetailsBtn: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  viewDetailsText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  transactionDate: {
    color: "#94a3b8",
    fontSize: 13,
  },
  transactionAmount: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "700" },
});