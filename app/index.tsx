import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Login from "./src/screens/Login";
import Main from "./src/screens/Main";
import Splash from "./src/screens/Splash";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      const saved = await AsyncStorage.getItem("session_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
      setShowSplash(false);
    };

    loadSession();
  }, []);

  if (showSplash) {
    return <Splash onFinish={() => {}} />;
  }

  return user ? <Main user={user} /> : <Login />;
}
