import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Accounts() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .is("deleted_at", null); // Solo cuentas NO eliminadas

    if (error) {
      console.log(error);
      return;
    }

    setAccounts(data || []);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cuentas</Text>

      {accounts.map((acc) => (
        <TouchableOpacity
          key={acc.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "../AccountDetails",
              params: { account_number: acc.account_number },
            })
          }
        >
          <Text style={styles.accNumber}>{acc.account_number}</Text>
          <Text style={styles.accType}>{acc.account_type}</Text>
          <Text style={styles.accBalance}>${acc.balance}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#0f172a",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  accNumber: { fontSize: 18, fontWeight: "700", color: "white" },
  accType: { color: "#94a3b8", marginTop: 5 },
  accBalance: { fontSize: 20, marginTop: 10, color: "#22c55e", fontWeight: "800" },
});
