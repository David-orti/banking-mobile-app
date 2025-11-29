import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="screens/Login" />
      <Stack.Screen name="screens/Register" />
      <Stack.Screen name="screens/Main" />

      {/* Nuevas pantallas */}
      <Stack.Screen name="screens/Accounts" />
      <Stack.Screen name="screens/AccountDetails" />
      <Stack.Screen name="screens/Transactions" />
      <Stack.Screen name="screens/NewTransaction" />
      <Stack.Screen name="screens/Cards" />
      <Stack.Screen name="screens/Profile" />
    </Stack>
  );
}
