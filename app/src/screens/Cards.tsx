import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import supabase from "../lib/supabase";

export default function Cards() {
  const { account_id } = useLocalSearchParams();
  const router = useRouter();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("account_id", account_id);

    if (!error) setCards(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarjetas</Text>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/AccountDetails?account_id=${item.account_id}`)}
          >
            <Text style={styles.cardNumber}>**** **** **** {item.last4}</Text>
            <Text style={styles.cardType}>{item.card_type}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: "#000",
    borderRadius: 15,
    marginBottom: 15,
  },
  cardNumber: { color: "#fff", fontSize: 20 },
  cardType: { color: "#ccc", marginTop: 5 },
});
