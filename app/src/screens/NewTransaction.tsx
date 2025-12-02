// ========================================
// 1️⃣ NewTransaction.tsx - CORREGIDO
// ========================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [userData, setUserData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const stored = await AsyncStorage.getItem("session_user");
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  };

  const handleTransaction = async () => {
    if (!userData?.account_number) {
      Alert.alert("Error", "No se encontró número de cuenta");
      return;
    }

    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      Alert.alert("Error", "Monto inválido");
      return;
    }

    setLoading(true);

    try {
      // Obtener cuenta actual
      const { data: account, error: accErr } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_number", userData.account_number)
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
          account_number: userData.account_number,
          amount: value,
          type: type,
          description: type === "deposit" ? "Depósito" : "Retiro",
        },
      ]);

      if (insertErr) {
        Alert.alert("Error", insertErr.message);
        return;
      }

      // Actualizar balance
      await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("account_number", userData.account_number);

      // Actualizar AsyncStorage
      const updatedUser = { ...userData, balance: newBalance };
      await AsyncStorage.setItem("session_user", JSON.stringify(updatedUser));

      Alert.alert("Éxito", "Transacción realizada correctamente");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Transacción</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.typeBtn, type === "deposit" && styles.active]}
          onPress={() => setType("deposit")}
        >
          <Text style={[styles.typeText, type === "deposit" && styles.activeText]}>
            Depositar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === "withdraw" && styles.activeWithdraw]}
          onPress={() => setType("withdraw")}
        >
          <Text style={[styles.typeText, type === "withdraw" && styles.activeText]}>
            Retirar
          </Text>
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

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleTransaction}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.btnText}>Confirmar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#0f172a" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    color: "white",
    fontSize: 20,
  },
  btn: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeBtn: {
    padding: 16,
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  active: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  activeWithdraw: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  typeText: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
  activeText: { color: "white" },
});

