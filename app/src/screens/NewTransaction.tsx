import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import supabase from "../lib/supabase";

export default function NewTransaction() {
  const router = useRouter();
  const { account_id } = useLocalSearchParams();

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");

  const handleTransaction = async () => {
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      Alert.alert("Error", "Monto inválido");
      return;
    }

    const { data: account } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    const newBalance =
      type === "deposit"
        ? account.balance + value
        : account.balance - value;

    if (newBalance < 0) {
      Alert.alert("Error", "Saldo insuficiente");
      return;
    }

    await supabase.from("transactions").insert([
      {
        account_id: account_id,
        amount: value,
        type: type,
      },
    ]);

    await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account_id);

    Alert.alert("Éxito", "Transacción realizada");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Transacción</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.typeBtn, type === "deposit" && styles.active]}
          onPress={() => setType("deposit")}
        >
          <Text style={styles.typeText}>Depositar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === "withdraw" && styles.active]}
          onPress={() => setType("withdraw")}
        >
          <Text style={styles.typeText}>Retirar</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Monto"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.btn} onPress={handleTransaction}>
        <Text style={styles.btnText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  btn: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  btnText: { color: "#fff", textAlign: "center", fontSize: 18 },
  row: { flexDirection: "row", justifyContent: "space-around" },
  typeBtn: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  active: {
    backgroundColor: "black",
  },
  typeText: { color: "white" },
});
