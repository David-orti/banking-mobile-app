// ========================================
// 4️⃣ Cards.tsx - CORREGIDO
// ========================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from '../../lib/supabase';

export default function Cards() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem("session_user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserData(user);
      await fetchCards(user.account_number);
    }
    setLoading(false);
  };

  const fetchCards = async (account_number: string) => {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("account_number", account_number);

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.log("Error cargando tarjetas:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Tarjetas</Text>
      </View>

      {cards.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💳</Text>
          <Text style={styles.noData}>No tienes tarjetas</Text>
          <Text style={styles.noDataSub}>
            Las tarjetas asociadas a tu cuenta aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardChip}>
                <Text style={styles.chipText}>💎</Text>
              </View>

              <Text style={styles.cardNumber}>
                **** **** **** {item.card_number?.slice(-4) || "****"}
              </Text>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>Tipo</Text>
                  <Text style={styles.cardType}>
                    {item.card_type || "Débito"}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cardLabel}>Estado</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Activa</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    color: "#38bdf8",
    fontSize: 16,
    marginBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "white" },
  card: {
    padding: 24,
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    // backgroundColor: "#1e293b",
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardChip: {
    width: 50,
    height: 40,
    backgroundColor: "#fbbf24",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  chipText: { fontSize: 24 },
  cardNumber: {
    color: "#fff",
    fontSize: 22,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  cardType: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#22c55e20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
  },
  noData: {
    fontSize: 18,
    color: "#cbd5e1",
    fontWeight: "600",
    marginTop: 12,
  },
  noDataSub: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64 },
});
