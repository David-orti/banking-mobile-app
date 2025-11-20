import { useState } from "react";

import Splash from "./src/screens/Splash";
export default function App (){

  const[showSplash, setShowSplash]= useState(true);

 if(showSplash){
   return <Splash onFinish={() => setShowSplash(false)}/>
 }
  
}