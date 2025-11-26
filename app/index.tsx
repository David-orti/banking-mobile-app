import { useState } from "react";

import Splash from "./src/screens/Splash";
import Register from "./src/screens/Register";
import Login from "./src/screens/Login";

export default function App (){

  const[showSplash, setShowSplash]= useState(true);

 if(showSplash){
   return <Splash onFinish={() => setShowSplash(false)}/>
 }
 return <Register />
}
