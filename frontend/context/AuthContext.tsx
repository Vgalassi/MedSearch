"use client";
import { API_BASE_URL } from "@/components/appConfig";
import {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useState
} from "react";

type AuthUser = {
   id: string;
   email: string;
   role: "DOCTOR" | "PATIENT" | "CLINIC";
   profileId: string | null;
};

type AuthContextValue = {
   user: AuthUser | null;
   loading: boolean;
   refreshUser: () => Promise<AuthUser | null>;
   logout: () => Promise<void>;
};

const AuthContext =
 createContext({} as AuthContextValue);

export function AuthProvider({
 children
}:{
 children:React.ReactNode
}){

 const [user,setUser]=
 useState<AuthUser | null>(null);

 const [loading,setLoading]=
 useState(true);

 const refreshUser = useCallback(async () => {
   const response = await fetch(
     `${API_BASE_URL}/me`,
     {
        credentials:"include"
     }
   );

      if(!response.ok){
         setUser(null);
         return null;
      }

      const data=
       await response.json();

      setUser(data);
      return data as AuthUser;
 }, []);

 const logout = useCallback(async () => {
   await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      credentials: "include",
   });
   setUser(null);
 }, []);

 useEffect(()=>{
   fetch(
     `${API_BASE_URL}/me`,
     {
        credentials:"include"
     }
   )
   .then(async(response)=>{
      if(!response.ok){
         setUser(null);
         return;
      }

      const data = await response.json();
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
         loading,
         refreshUser,
         logout,
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
