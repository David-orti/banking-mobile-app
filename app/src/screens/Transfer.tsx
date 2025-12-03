import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase"; // AJUSTADO A TU RUTA

const Transfer = () => {
  const [userData, setUserData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar usuario almacenado
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    };
    loadUser();
  }, []);

  // -------------------------------
  // 🔥 FUNCIÓN PRINCIPAL DE TRANSFERENCIA
  // -------------------------------
  const handleTransfer = async () => {
    if (!amount || !destinationAccount) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert("Error", "Monto inválido.");
      return;
    }

    if (!userData) {
      Alert.alert("Error", "No se encontró información del usuario.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Obtener la cuenta origen del usuario
      const { data: originAcc, error: originErr } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_number", userData.account_number)
        .single();

      if (originErr || !originAcc) {
        setLoading(false);
        Alert.alert("Error", "No se encontró tu cuenta.");
        return;
      }

      // 2️⃣ Validar fondos
      if (originAcc.balance < transferAmount) {
        setLoading(false);
        Alert.alert("Fondos insuficientes", "No tienes saldo disponible.");
        return;
      }

      // 3️⃣ Verificar cuenta destino
      const { data: destAcc, error: destErr } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_number", destinationAccount)
        .single();

      if (destErr || !destAcc) {
        setLoading(false);
        Alert.alert("Error", "La cuenta destino no existe.");
        return;
      }

      // 4️⃣ Registrar transacción – RETIRO en origen
      await supabase.from("transactions").insert({
        account_number: originAcc.account_number,
        type: "withdrawal",
        amount: transferAmount,
        description: `Transferencia enviada a ${destinationAccount}`,
      });

      // 5️⃣ Registrar transacción – DEPÓSITO en destino
      await supabase.from("transactions").insert({
        account_number: destAcc.account_number,
        type: "deposit",
        amount: transferAmount,
        description: `Transferencia recibida de ${originAcc.account_number}`,
      });

      // 6️⃣ ACTUALIZAR SALDOS
      await supabase
        .from("accounts")
        .update({ balance: originAcc.balance - transferAmount })
        .eq("account_number", originAcc.account_number);

      await supabase
        .from("accounts")
        .update({ balance: destAcc.balance + transferAmount })
        .eq("account_number", destAcc.account_number);

      // 7️⃣ Actualizar AsyncStorage
      const updatedUser = {
        ...userData,
        balance: originAcc.balance - transferAmount,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);

      setLoading(false);
      Alert.alert(
        "Transferencia Exitosa",
        `Has enviado $${transferAmount} a la cuenta ${destinationAccount}`
      );

      setAmount("");
      setDestinationAccount("");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transferencia Bancaria</Text>

      <Text style={styles.label}>Cuenta destino</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de cuenta"
        keyboardType="numeric"
        value={destinationAccount}
        onChangeText={setDestinationAccount}
      />

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleTransfer}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Procesando..." : "Transferir"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Transfer;

// -----------------------------------------------
// 🎨 MISMO ESTILO QUE NEWTRANSACTION
// -----------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  label: {
    color: "#cbd5e1",
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    color: "white",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});
