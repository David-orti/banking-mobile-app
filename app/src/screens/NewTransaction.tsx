import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function NewTransaction() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Convertir correctamente parámetros
  const account_number =
    Array.isArray(params.account_number)
      ? params.account_number[0]
      : params.account_number;

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");

  const handleTransaction = async () => {
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      Alert.alert("Error", "Monto inválido");
      return;
    }

    // Obtener la cuenta real
    const { data: account, error: accErr } = await supabase
      .from("accounts")
      .select("*")
      .eq("account_number", account_number)
      .single();

    if (accErr || !account) {
      Alert.alert("Error", "Cuenta no encontrada");
      return;
    }

    // Calcular nuevo balance
    const newBalance =
      type === "deposit"
        ? Number(account.balance) + value
        : Number(account.balance) - value;

    if (newBalance < 0) {
      Alert.alert("Error", "Saldo insuficiente");
      return;
    }

    // Registrar transacción
    const { error: insertErr } = await supabase.from("transactions").insert([
      {
        account_number: account_number,
        amount: value,
        type: type,
        description: type === "deposit" ? "Depósito" : "Retiro",
      },
    ]);

    if (insertErr) {
      Alert.alert("Error creando transacción", insertErr.message);
      return;
    }

    // Actualizar balance
    await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("account_number", account_number);

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
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.btn} onPress={handleTransaction}>
        <Text style={styles.btnText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#0f172a" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    color: "white",
    fontSize: 18,
  },
  btn: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  btnText: { color: "#0f172a", textAlign: "center", fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  typeBtn: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  active: {
    backgroundColor: "#22c55e",
  },
  typeText: { color: "white", fontSize: 16, fontWeight: "600" },
});
