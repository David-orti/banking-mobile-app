import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SetupPin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(1); // 1 = crear, 2 = confirmar

  const handleNumberPress = (num: string) => {
    if (step === 1) {
      if (pin.length < 4) {
        setPin(pin + num);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(confirmPin + num);
      }
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleContinue = async () => {
    if (step === 1 && pin.length === 4) {
      setStep(2);
    } else if (step === 2 && confirmPin.length === 4) {
      if (pin === confirmPin) {
        await AsyncStorage.setItem("security_pin", pin);
        Alert.alert("✅ PIN Configurado", "Tu PIN ha sido creado exitosamente");
        router.back();
      } else {
        Alert.alert("Error", "Los PINs no coinciden");
        setConfirmPin("");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {step === 1 ? "Crear PIN de Seguridad" : "Confirmar PIN"}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? "Ingresa 4 dígitos para tu PIN"
            : "Vuelve a ingresar tu PIN"}
        </Text>
      </View>

      {/* PIN Display */}
      <View style={styles.pinDisplay}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              (step === 1 ? pin.length : confirmPin.length) > i &&
                styles.pinDotFilled,
            ]}
          />
        ))}
      </View>

      {/* Number Pad */}
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
                  if (num === "⌫") handleDelete();
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

      {/* Continue Button */}
      {((step === 1 && pin.length === 4) ||
        (step === 2 && confirmPin.length === 4)) && (
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>
            {step === 1 ? "Continuar" : "Confirmar"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
  },
  pinDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 60,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "transparent",
  },
  pinDotFilled: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  numberPad: {
    gap: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  numberText: {
    fontSize: 28,
    color: "white",
    fontWeight: "600",
  },
  continueBtn: {
    backgroundColor: "#22c55e",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  continueBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});