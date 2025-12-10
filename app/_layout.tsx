
// app/_layout.tsx
import { Stack } from "expo-router";
import { UserProvider } from "../src/contexts/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </UserProvider>
  );
}