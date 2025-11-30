// src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/Login";
import Register from "../screens/Register";
import Main from "../screens/Main";
import Accounts from "../screens/Accounts";
import AccountDetails from "../screens/AccountDetails";
import Transactions from "../screens/Transactions";
import NewTransaction from "../screens/NewTransaction";
import Cards from "../screens/Cards";
import Profile from "../screens/Profile";

const Stack = createNativeStackNavigator();

type Props = {
  initialRouteName: "Login" | "Main" | string;
};

export default function AppNavigator({ initialRouteName }: Props) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Accounts" component={Accounts} />
      <Stack.Screen name="AccountDetails" component={AccountDetails} />
      <Stack.Screen name="Transactions" component={Transactions} />
      <Stack.Screen name="NewTransaction" component={NewTransaction} />
      <Stack.Screen name="Cards" component={Cards} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
