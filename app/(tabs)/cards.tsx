// app/(tabs)/cards.tsx
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../src/contexts/UserContext';
import { useCards } from '../src/hooks/useCards';
import { COLORS } from '../src/utils/constants';
import { maskCardNumber } from '../src/utils/formatters';

export default function Cards() {
  const { account } = useUser();
  const { cards, loading, blockCard, unblockCard, refresh } = useCards(account?.account_number);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tarjetas</Text>

      {cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>No tienes tarjetas</Text>
          <Text style={styles.emptySubtext}>
            Las tarjetas asociadas a tu cuenta aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.cardVisual}>
                <Text style={styles.cardNumber}>
                  {maskCardNumber(item.card_number)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardExpiry}>Vence: {item.expiration}</Text>
                  <Text style={[
                    styles.cardStatus,
                    item.status === 'active' ? styles.statusActive : styles.statusBlocked
                  ]}>
                    {item.status === 'active' ? '● Activa' : '● Bloqueada'}
                  </Text>
                </View>
              </View>

              {item.status === 'active' ? (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.blockButton]}
                  onPress={() => blockCard(item.id)}
                >
                  <Text style={styles.buttonText}>Bloquear</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.unblockButton]}
                  onPress={() => unblockCard(item.id)}
                >
                  <Text style={styles.buttonText}>Desbloquear</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  cardItem: {
    marginBottom: 20,
  },
  cardVisual: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
  },
  cardNumber: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardExpiry: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusActive: {
    color: COLORS.success,
  },
  statusBlocked: {
    color: COLORS.danger,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  blockButton: {
    backgroundColor: COLORS.danger,
  },
  unblockButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});