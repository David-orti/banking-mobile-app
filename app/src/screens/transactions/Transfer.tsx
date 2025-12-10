import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

const Transfer = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinationUser, setDestinationUser] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Límites
  const DAILY_LIMIT = 5000000;
  const MIN_AMOUNT = 1000;
  const MAX_AMOUNT = 2000000;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const stored = await AsyncStorage.getItem("session_user");
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  };

  const searchDestination = async () => {
    if (!destinationAccount.trim()) return;

    try {
      const { data: destAcc, error } = await supabase
        .from("accounts")
        .select(`
          *,
          users!accounts_user_email_fkey(firstname, lastname, email)
        `)
        .eq("account_number", destinationAccount)
        .single();

      if (error || !destAcc) {
        Alert.alert("❌ Error", "Cuenta no encontrada");
        setDestinationUser(null);
        return;
      }

      setDestinationUser(destAcc);
    } catch (e) {
      console.log(e);
    }
  };

  const validateTransfer = () => {
    const transferAmount = parseFloat(amount);

    if (!amount || !destinationAccount) {
      Alert.alert("Error", "Completa todos los campos");
      return false;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert("Error", "Monto inválido");
      return false;
    }

    if (transferAmount < MIN_AMOUNT) {
      Alert.alert("Error", `El monto mínimo es $${MIN_AMOUNT.toLocaleString()}`);
      return false;
    }

    if (transferAmount > MAX_AMOUNT) {
      Alert.alert("Error", `El monto máximo por transferencia es $${MAX_AMOUNT.toLocaleString()}`);
      return false;
    }

    if (destinationAccount === userData.account_number) {
      Alert.alert("Error", "No puedes transferir a tu misma cuenta");
      return false;
    }

    if (!destinationUser) {
      Alert.alert("Error", "Primero busca la cuenta destino");
      return false;
    }

    return true;
  };

  const handlePrepareTransfer = () => {
    if (!validateTransfer()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirmModal(false);
    
    // Verificar si tiene PIN configurado
    const savedPin = await AsyncStorage.getItem("security_pin");
    
    if (savedPin) {
      setShowPinModal(true);
    } else {
      executeTransfer();
    }
  };

  const handlePinSubmit = async () => {
    const savedPin = await AsyncStorage.getItem("security_pin");

    if (pin === savedPin) {
      setShowPinModal(false);
      setPin("");
      executeTransfer();
    } else {
      Alert.alert("❌ PIN Incorrecto", "Intenta nuevamente");
      setPin("");
    }
  };

  const executeTransfer = async () => {
    const transferAmount = parseFloat(amount);
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
        Alert.alert("Error", "No se encontró tu cuenta");
        return;
      }

      // 2️⃣ Validar fondos
      if (originAcc.balance < transferAmount) {
        setLoading(false);
        Alert.alert("❌ Fondos Insuficientes", "No tienes saldo disponible");
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
        Alert.alert("Error", "La cuenta destino no existe");
        return;
      }

      // 4️⃣ Generar ID único
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 5️⃣ Registrar transacción – RETIRO en origen
      const { data: withdrawTx } = await supabase
        .from("transactions")
        .insert({
          account_number: originAcc.account_number,
          type: "withdraw",
          amount: transferAmount,
          description: `Transferencia enviada a ${destinationUser.users?.firstname || destinationAccount}`,
          destination_account: destinationAccount,
          status: "completed",
          category: "transfer",
          transaction_id: transactionId,
        })
        .select()
        .single();

      // 6️⃣ Registrar transacción – DEPÓSITO en destino
      await supabase.from("transactions").insert({
        account_number: destAcc.account_number,
        type: "deposit",
        amount: transferAmount,
        description: `Transferencia recibida de ${userData.firstname} ${userData.lastname}`,
        destination_account: originAcc.account_number,
        status: "completed",
        category: "transfer",
        transaction_id: transactionId,
      });

      // 7️⃣ ACTUALIZAR SALDOS
      await supabase
        .from("accounts")
        .update({ balance: originAcc.balance - transferAmount })
        .eq("account_number", originAcc.account_number);

      await supabase
        .from("accounts")
        .update({ balance: destAcc.balance + transferAmount })
        .eq("account_number", destAcc.account_number);

      // 8️⃣ Actualizar AsyncStorage
      const updatedUser = {
        ...userData,
        balance: originAcc.balance - transferAmount,
      };
      await AsyncStorage.setItem("session_user", JSON.stringify(updatedUser));
      setUserData(updatedUser);

      setLoading(false);

      // 9️⃣ Mostrar comprobante
      setReceiptData({
        transactionId,
        amount: transferAmount,
        from: `${userData.firstname} ${userData.lastname}`,
        fromAccount: originAcc.account_number,
        to: destinationUser.users?.firstname
          ? `${destinationUser.users.firstname} ${destinationUser.users.lastname}`
          : "Cuenta destino",
        toAccount: destinationAccount,
        date: new Date().toLocaleString("es-ES"),
        newBalance: originAcc.balance - transferAmount,
      });

      setShowReceipt(true);
      setAmount("");
      setDestinationAccount("");
      setDestinationUser(null);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleDeletePin = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transferir Dinero</Text>
        {userData && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <Text style={styles.balance}>${userData.balance?.toLocaleString() || 0}</Text>
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
            <Text style={styles.destinationLabel}>✅ Destinatario encontrado:</Text>
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
          placeholder="$0"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <View style={styles.limitsCard}>
          <Text style={styles.limitsTitle}>💡 Límites de transferencia:</Text>
          <Text style={styles.limitsText}>• Mínimo: ${MIN_AMOUNT.toLocaleString()}</Text>
          <Text style={styles.limitsText}>• Máximo por transacción: ${MAX_AMOUNT.toLocaleString()}</Text>
          <Text style={styles.limitsText}>• Límite diario: ${DAILY_LIMIT.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handlePrepareTransfer}
          disabled={loading || !destinationUser}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Continuar →</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal visible={showConfirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔍 Confirmar Transferencia</Text>

            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Monto:</Text>
              <Text style={styles.confirmValue}>${parseFloat(amount || "0").toLocaleString()}</Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Para:</Text>
              <Text style={styles.confirmValue}>
                {destinationUser?.users?.firstname} {destinationUser?.users?.lastname}
              </Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Cuenta:</Text>
              <Text style={styles.confirmValue}>{destinationAccount}</Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Tu nuevo saldo:</Text>
              <Text style={styles.confirmValue}>
                ${(userData?.balance - parseFloat(amount || "0")).toLocaleString()}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmTransfer}>
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE PIN */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔒 Verificar PIN</Text>
            <Text style={styles.modalSubtitle}>Ingresa tu PIN de seguridad</Text>

            <View style={styles.pinDisplay}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.pinDot, pin.length > i && styles.pinDotFilled]}
                />
              ))}
            </View>

            <View style={styles.numberPad}>
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                ["", "0", "⌫"],
              ].map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={styles.numberButton}
                      onPress={() => {
                        if (num === "⌫") handleDeletePin();
                        else if (num) handleNumberPress(num);
                      }}
                      disabled={!num}
                    >
                      <Text style={styles.numberText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {pin.length === 4 && (
              <TouchableOpacity style={styles.confirmBtn} onPress={handlePinSubmit}>
                <Text style={styles.confirmBtnText}>Verificar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowPinModal(false);
                setPin("");
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE COMPROBANTE */}
      <Modal visible={showReceipt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContent}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptIcon}>✅</Text>
              <Text style={styles.receiptTitle}>Transferencia Exitosa</Text>
            </View>

            <View style={styles.receiptAmount}>
              <Text style={styles.receiptAmountLabel}>Monto transferido</Text>
              <Text style={styles.receiptAmountValue}>
                ${receiptData?.amount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.receiptDetails}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>ID de transacción:</Text>
                <Text style={styles.receiptValue}>{receiptData?.transactionId}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>De:</Text>
                <Text style={styles.receiptValue}>{receiptData?.from}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Cuenta origen:</Text>
                <Text style={styles.receiptValue}>{receiptData?.fromAccount}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Para:</Text>
                <Text style={styles.receiptValue}>{receiptData?.to}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Cuenta destino:</Text>
                <Text style={styles.receiptValue}>{receiptData?.toAccount}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Fecha:</Text>
                <Text style={styles.receiptValue}>{receiptData?.date}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Tu nuevo saldo:</Text>
                <Text style={[styles.receiptValue, { color: "#22c55e" }]}>
                  ${receiptData?.newBalance.toLocaleString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setShowReceipt(false);
                router.replace("/(tabs)");
              }}
            >
              <Text style={styles.doneBtnText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  limitsCard: {
    backgroundColor: "#3b82f620",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  limitsTitle: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  limitsText: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  confirmLabel: {
    color: "#94a3b8",
    fontSize: 14,
  },
  confirmValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#334155",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  confirmBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  pinDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "transparent",
  },
  pinDotFilled: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  numberPad: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
  },
  receiptContent: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  receiptIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  receiptAmount: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#22c55e20",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  receiptAmountLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 4,
  },
  receiptAmountValue: {
    color: "#22c55e",
    fontSize: 36,
    fontWeight: "800",
  },
  receiptDetails: {
    gap: 12,
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  receiptLabel: {
    color: "#94a3b8",
    fontSize: 13,
    flex: 1,
  },
  receiptValue: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  doneBtn: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});