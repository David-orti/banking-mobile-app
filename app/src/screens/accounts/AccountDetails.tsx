import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { supabase } from '../../lib/supabase';

export default function AccountDetails() {
  const params = useLocalSearchParams();

  // ⭐ CORRECCIÓN: asegurar que sea string siempre
  const account_number = Array.isArray(params.account_number)
    ? params.account_number[0]
    : params.account_number;

  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountDetails();
  }, []);

  const loadAccountDetails = async () => {
    try {
      // 1️⃣ Obtener la cuenta
      const { data: accountData, error: accError } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_number", account_number)
        .single();

      if (accError) throw accError;
      setAccount(accountData);

      // 2️⃣ Obtener transacciones
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_number", account_number)
        .order("created_at", { ascending: false });

      if (transError) throw transError;

      setTransactions(transData || []);

    } catch (error) {
      console.log("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={40} color="#22c55e" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se encontró la cuenta.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Detalles de la Cuenta</Text>

        <Text style={styles.label}>Número de Cuenta</Text>
        <Text style={styles.value}>{account.account_number}</Text>

        <Text style={styles.label}>Tipo</Text>
        <Text style={styles.value}>{account.account_type}</Text>

        <Text style={styles.label}>Balance</Text>
        <Text style={styles.balance}>${account.balance}</Text>

        <Text style={styles.label}>Fecha de Creación</Text>
        <Text style={styles.value}>
          {new Date(account.created_at).toLocaleString()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Transacciones</Text>

        {transactions.length === 0 ? (
          <Text style={styles.noTrans}>No hay transacciones.</Text>
        ) : (
          transactions.map((t, index) => (
            <View key={index} style={styles.transactionItem}>
              <Text style={styles.transType}>
                {t.type === "deposit" ? "Depósito" : "Retiro"}
              </Text>

              <Text
                style={[
                  styles.transAmount,
                  { color: t.type === "deposit" ? "#22c55e" : "#ef4444" },
                ]}
              >
                {t.type === "deposit" ? "+" : "-"}${t.amount}
              </Text>

              <Text style={styles.transDate}>
                {new Date(t.created_at).toLocaleString()}
              </Text>

              <Text style={styles.transDesc}>{t.description}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  balance: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    marginVertical: 5,
  },
  transactionItem: {
    paddingVertical: 12,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  transType: {
    fontWeight: "bold",
    fontSize: 16,
  },
  transAmount: {
    fontSize: 18,
    marginTop: 2,
  },
  transDate: {
    color: "#666",
    fontSize: 12,
  },
  transDesc: {
    fontSize: 14,
    marginTop: 3,
  },
  noTrans: {
    textAlign: "center",
    paddingVertical: 20,
    color: "#888",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
