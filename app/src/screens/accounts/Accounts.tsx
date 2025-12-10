// ========================================
// 3️⃣ Accounts.tsx - CORREGIDO
// ========================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from '../../lib/supabase';

export default function Accounts() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem("session_user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserData(user);
      await fetchAccounts(user.email);
    }
    setLoading(false);
  };

  const fetchAccounts = async (email: string) => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_email", email)
      .is("deleted_at", null);

    if (error) {
      console.log("Error:", error);
      return;
    }

    setAccounts(data || []);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Cuentas</Text>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏦</Text>
          <Text style={styles.emptyText}>No tienes cuentas registradas</Text>
        </View>
      ) : (
        accounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "./src/screens/AccountDetails",
                params: { account_number: acc.account_number },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>Cuenta {acc.account_type}</Text>
                <Text style={styles.accNumber}>**** {acc.account_number.slice(-4)}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Activa</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <Text style={styles.accBalance}>${acc.balance}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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
  backBtn: {
    color: "#38bdf8",
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 4,
  },
  accNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statusBadge: {
    backgroundColor: "#22c55e20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  balanceLabel: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 6,
  },
  accBalance: {
    fontSize: 24,
    color: "#22c55e",
    fontWeight: "800",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
  },
});