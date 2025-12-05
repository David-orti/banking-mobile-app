import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

const Transfer = () => {
  const [userData, setUserData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinationUser, setDestinationUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("session_user");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    };
    loadUser();
  }, []);

  // Buscar destinatario
  const searchDestination = async () => {
    if (!destinationAccount.trim()) return;

    try {
      const { data: destAcc, error } = await supabase
        .from("accounts")
        .select("*, users:user_email(firstname, lastname)")
        .eq("account_number", destinationAccount)
        .single();

      if (error || !destAcc) {
        Alert.alert("Error", "Cuenta no encontrada");
        setDestinationUser(null);
        return;
      }

      setDestinationUser(destAcc);
    } catch (e) {
      console.log(e);
    }
  };

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

    if (destinationAccount === userData.account_number) {
      Alert.alert("Error", "No puedes transferir a tu misma cuenta.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Obtener cuenta origen
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
        type: "withdraw",
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

      await AsyncStorage.setItem("session_user", JSON.stringify(updatedUser));
      setUserData(updatedUser);

      setLoading(false);
      Alert.alert(
        "✅ Transferencia Exitosa",
        `Has enviado $${transferAmount} a ${destinationUser?.users?.firstname || "la cuenta"}`
      );

      setAmount("");
      setDestinationAccount("");
      setDestinationUser(null);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transferir Dinero</Text>
        {userData && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <Text style={styles.balance}>${userData.balance || 0}</Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Cuenta destino</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Número de cuenta"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={destinationAccount}
            onChangeText={setDestinationAccount}
            onBlur={searchDestination}
          />
        </View>

        {destinationUser && (
          <View style={styles.destinationCard}>
            <Text style={styles.destinationLabel}>Destinatario:</Text>
            <Text style={styles.destinationName}>
              {destinationUser.users?.firstname} {destinationUser.users?.lastname}
            </Text>
            <Text style={styles.destinationAccount}>
              Cuenta: {destinationUser.account_number}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Monto a transferir</Text>
        <TextInput
          style={styles.input}
          placeholder="$0.00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleTransfer}
          disabled={loading || !destinationUser}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Transferir</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Transfer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  balanceLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    color: "#22c55e",
    fontSize: 32,
    fontWeight: "800",
  },
  form: {
    padding: 20,
  },
  label: {
    color: "#cbd5e1",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  destinationCard: {
    backgroundColor: "#22c55e20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  destinationLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  destinationName: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  destinationAccount: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});