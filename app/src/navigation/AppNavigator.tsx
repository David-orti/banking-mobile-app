// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useUser } from "../contexts/UserContext";

// Auth screens
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import SetupPin from "../screens/auth/SetupPin";
import VerifyPin from "../screens/auth/VerifyPin";

// Main screens
import Main from "../screens/main/Main";
import Profile from "../screens/main/Profile";
import Splash from "../screens/main/Splash";

// Transaction screens
import Transactions from "../screens/transactions/Transactions";
import NewTransaction from "../screens/transactions/NewTransaction";
import Transfer from "../screens/transactions/Transfer";

// Account screens
import Accounts from "../screens/accounts/Accounts";
import AccountDetails from "../screens/accounts/AccountDetails";

// Card screens
import Cards from "../screens/cards/Cards";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useUser();

  // Mostrar splash mientras carga
  if (loading) {
    return <Splash />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // 🔒 Pantallas para usuarios NO autenticados
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="SetupPin" component={SetupPin} />
          <Stack.Screen name="VerifyPin" component={VerifyPin} />
        </>
      ) : (
        // ✅ Pantallas para usuarios AUTENTICADOS
        <>
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="Profile" component={Profile} />
          
          {/* Transacciones */}
          <Stack.Screen name="Transactions" component={Transactions} />
          <Stack.Screen name="NewTransaction" component={NewTransaction} />
          <Stack.Screen name="Transfer" component={Transfer} />
          
          {/* Cuentas */}
          <Stack.Screen name="Accounts" component={Accounts} />
          <Stack.Screen name="AccountDetails" component={AccountDetails} />
          
          {/* Tarjetas */}
          <Stack.Screen name="Cards" component={Cards} />
        </>
      )}
    </Stack.Navigator>
  );
}