import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Main() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido 🎉</Text>
      <Text style={styles.subtitle}>Login sin autenticación listo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    marginBottom: 10,
  },
  subtitle: {
    color: '#ccc',
  },
});
