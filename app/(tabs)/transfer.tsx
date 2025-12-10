// app/(tabs)/transfer.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../src/contexts/UserContext';
import { transactionService } from '../src/services/transactionService';
import { COLORS, TRANSFER_LIMITS } from '../src/utils/constants';
import { formatCurrency } from '../src/utils/formatters';
import { validators } from '../src/utils/validators';

export default function Transfer() {
  const { account, user, refreshAccount } = useUser();
  
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    // Validaciones
    if (!destinationAccount || !amount || !description) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!validators.accountNumber(destinationAccount)) {
      Alert.alert('Error', 'Número de cuenta inválido (10 dígitos)');
      return;
    }

    const amountNum = parseFloat(amount);
    const validation = validators.amount(amountNum, account?.balance);
    
    if (!validation.valid) {
      Alert.alert('Error', validation.error!);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await transactionService.transfer(
        account!.account_number,
        {
          destinationAccount,
          amount: amountNum,
          description,
        },
        user!.email
      );

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      Alert.alert(
        '¡Éxito!',
        `Transferencia de ${formatCurrency(amountNum)} completada`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDestinationAccount('');
              setAmount('');
              setDescription('');
              refreshAccount();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Transferir Dinero</Text>

        {/* Saldo disponible */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(account?.balance || 0)}
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cuenta destino</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el número de cuenta"
              placeholderTextColor={COLORS.textSecondary}
              value={destinationAccount}
              onChangeText={setDestinationAccount}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monto</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>
              Mínimo: {formatCurrency(TRANSFER_LIMITS.MIN)}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Pago de renta"
              placeholderTextColor={COLORS.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Límites */}
          <View style={styles.limitsCard}>
            <Text style={styles.limitsTitle}>💡 Límites de transferencia</Text>
            <Text style={styles.limitText}>
              • Mínimo: {formatCurrency(TRANSFER_LIMITS.MIN)}
            </Text>
            <Text style={styles.limitText}>
              • Máximo por transacción: {formatCurrency(TRANSFER_LIMITS.MAX_PER_TRANSACTION)}
            </Text>
            <Text style={styles.limitText}>
              • Límite diario: {formatCurrency(TRANSFER_LIMITS.MAX_DAILY)}
            </Text>
          </View>

          {/* Botón */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleTransfer}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.buttonText}>Transferir</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.text,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  limitsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  limitsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  limitText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});