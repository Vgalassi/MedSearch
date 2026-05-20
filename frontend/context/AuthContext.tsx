"use client";
import { API_BASE_URL } from "@/components/appConfig";
import {
 createContext,
 useContext,
 useEffect,
 useState
} from "react";

const AuthContext =
 createContext({} as any);

export function AuthProvider({
 children
}:{
 children:React.ReactNode
}){

 const [user,setUser]=
 useState(null);

 const [loading,setLoading]=
 useState(true);

 useEffect(()=>{

   fetch(
     `${API_BASE_URL}/me`,
     {
        credentials:"include"
     }
   )
   .then(async(r)=>{

      if(!r.ok){

         setUser(null);
         return;
      }

      const data=
       await r.json();

      setUser(data);

   })
   .finally(()=>{

      setLoading(false);

   });

 },[]);

 return(
   <AuthContext.Provider
      value={{
         user,
         loading
      }}
   >
      {children}
   </AuthContext.Provider>
 );

}

export function useAuth(){
   return useContext(
      AuthContext
   );
}