import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Transactions() {
  const params = useLocalSearchParams();

  // CORRECCIÓN: asegurar que sea string siempre
  const account_id = Array.isArray(params.account_id)
    ? params.account_id[0]
    : params.account_id;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", account_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (err) {
      console.log("❌ Error cargando transacciones:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones</Text>

      {transactions.length === 0 ? (
        <Text style={styles.noData}>No hay transacciones</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <Text style={styles.txType}>
                {item.type === "deposit" ? "Depósito" : "Retiro"}
              </Text>

              <Text
                style={[
                  styles.amount,
                  { color: item.type === "deposit" ? "#22c55e" : "#ef4444" },
                ]}
              >
                {item.type === "deposit" ? "+" : "-"}${item.amount}
              </Text>

              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  txItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  txType: { fontSize: 16, fontWeight: "bold" },
  amount: { fontSize: 18, marginTop: 3 },
  date: { fontSize: 12, color: "#777", marginTop: 5 },
  noData: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 40,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
