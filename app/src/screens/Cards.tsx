import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function Cards() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // CORRECCIÓN: evitar arrays
  const account_id = Array.isArray(params.account_id)
    ? params.account_id[0]
    : params.account_id;

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("account_id", account_id);

      if (error) throw error;

      setCards(data || []);
    } catch (err) {
      console.log("❌ Error cargando tarjetas:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <Text>Cargando...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarjetas</Text>

      {cards.length === 0 ? (
        <Text style={styles.noData}>No hay tarjetas</Text>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push(
                  `/src/screens/AccountDetails?account_number=${item.account_number}`
                )
              }
            >
              <Text style={styles.cardNumber}>
                **** **** **** {item.last4}
              </Text>
              <Text style={styles.cardType}>{item.card_type}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: "#0f172a",
    borderRadius: 15,
    marginBottom: 15,
  },
  cardNumber: { color: "#fff", fontSize: 20, letterSpacing: 2 },
  cardType: { color: "#cbd5e1", marginTop: 5, fontSize: 16 },
  noData: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#777" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
