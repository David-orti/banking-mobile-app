import { Tabs } from "expo-router";
import { Text, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1e293b",
          borderTopColor: "#334155",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: () => (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Actividad",
          tabBarIcon: () => (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24 }}>📊</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: "Tarjetas",
          tabBarIcon: () => (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24 }}>💳</Text>
            </View>
          ),
        }}
      />

      {/* ✅ NUEVA TAB DE TRANSFERIR DENTRO DEL <Tabs> */}
      <Tabs.Screen
        name="transfer"
        options={{
          title: "Transferir",
          tabBarIcon: () => (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24 }}>🔁</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: () => (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
