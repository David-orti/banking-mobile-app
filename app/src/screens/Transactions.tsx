import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import supabase from "../lib/supabase";

export default function Transactions() {
  const { account_id } = useLocalSearchParams();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("account_id", account_id)
      .order("created_at", { ascending: false });

    if (!error) setTransactions(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.txItem}>
            <Text style={styles.txType}>{item.type}</Text>
            <Text style={styles.amount}>${item.amount}</Text>
            <Text style={styles.date}>{item.created_at}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  txItem: {
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },
  txType: { fontSize: 16, fontWeight: "bold" },
  amount: { fontSize: 18 },
  date: { fontSize: 12, color: "#777" },
});
