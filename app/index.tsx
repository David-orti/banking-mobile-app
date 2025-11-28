 import { useState } from "react";
import Login from "./src/screens/Login";
import Splash from "./src/screens/Splash";
import Register from "./src/screens/Register";
import Main from "./src/screens/Main";


 export default function App() {

  const [showSplash, setShowSplash] = useState(true);
  if (showSplash){
  return <Splash onFinish={() => setShowSplash(false)} />
    
  }
  return <Login/>         
}
