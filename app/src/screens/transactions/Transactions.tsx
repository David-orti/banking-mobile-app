// ========================================
// 2️⃣ Transactions.tsx - CORREGIDO
// ========================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from '../../../lib/supabase';

export default function Transactions() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem("session_user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserData(user);
      await fetchTransactions(user.account_number);
    }
    setLoading(false);
  };

  const fetchTransactions = async (account_number: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_number", account_number)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.log("Error cargando transacciones:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transacciones</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.noData}>No hay transacciones</Text>
          <Text style={styles.noDataSub}>
            Realiza tu primera transacción para verla aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <View style={styles.txIcon}>
                <Text style={styles.txEmoji}>
                  {item.type === "deposit" ? "💰" : "💸"}
                </Text>
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txType}>
                  {item.description || (item.type === "deposit" ? "Depósito" : "Retiro")}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <Text
                style={[
                  styles.amount,
                  { color: item.type === "deposit" ? "#22c55e" : "#ef4444" },
                ]}
              >
                {item.type === "deposit" ? "+" : "-"}${item.amount}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
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
  title: { fontSize: 28, fontWeight: "bold", color: "white" },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  txIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txEmoji: { fontSize: 24 },
  txInfo: { flex: 1 },
  txType: { fontSize: 16, fontWeight: "600", color: "white" },
  amount: { fontSize: 18, fontWeight: "800" },
  date: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  noData: {
    fontSize: 18,
    color: "#cbd5e1",
    fontWeight: "600",
    marginTop: 12,
  },
  noDataSub: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
});
