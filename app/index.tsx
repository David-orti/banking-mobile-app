import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Splash from "../splash";

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const saved = await AsyncStorage.getItem("user");

      setTimeout(() => {
        setShowSplash(false);

        if (saved) {
          router.replace("./main");
        } else {
          router.replace("./login");
        }
      }, 2000);
    };

    checkLogin();
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return null;
}
