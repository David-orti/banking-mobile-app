import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from 'react-native';

// Componente Splash inline
function Splash() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar style="light" />
      <Image 
        source={require('./src/assets/images/main_logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const saved = await AsyncStorage.getItem("session_user");

      setTimeout(() => {
        setShowSplash(false);

        if (saved) {
          router.replace("/src/screens/Main");
        } else {
          router.replace("/src/screens/Login");
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 250,
    height: 250,
  },
});