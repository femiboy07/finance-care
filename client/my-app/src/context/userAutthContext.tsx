import { Dispatch } from "@reduxjs/toolkit";
import React, { ReactElement, ReactNode, SetStateAction, createContext,useContext, useEffect, useState } from "react";
import { Outlet, OutletProps } from "react-router-dom";
import { tokenToString } from "typescript";


// // interface UserData {
// //    auth:string | null
// //  }
 
 interface UserAuth {
   auth: string | null ;
   setAuth: React.Dispatch<React.SetStateAction<string | null >>;
 }
 
 const UserContextAuth = createContext<UserAuth | undefined>(undefined);
 
 export const useAuth = (): UserAuth => {
   const context = useContext(UserContextAuth);
   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 };
 
 const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const [auth, setAuth] = useState<string | null>(null);
 
   useEffect(() => {
     const tokenString = localStorage.getItem("userAuthToken");
     if (tokenString) {
       try {
         const token = tokenString;
         // Optionally validate token here, e.g., check expiration
         setAuth(token);
       } catch (error) {
         console.error('Error parsing token:', error);
         setAuth(null);
       }
     } else {
      
       setAuth(null);
     }
   }, []);
 
   return (
     <UserContextAuth.Provider value={{ auth, setAuth }}>
       {children}
     </UserContextAuth.Provider>
   );
 };


export default AuthProvider;



