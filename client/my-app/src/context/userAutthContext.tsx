import { Dispatch } from "@reduxjs/toolkit";
import { ReactElement, createContext,useContext, useEffect, useState } from "react";

interface UserAuth{
    isAuthenticated:boolean,
    setIsAuthenticated:any;
    
}

const userContextAuth=createContext<UserAuth>({isAuthenticated:false,setIsAuthenticated:null})




export const AuthProvider=({children}:{children:ReactElement})=>{
        
         const [isAuthenticated,setIsAuthenticated]=useState(false);
        
         

          useEffect(()=>{
            const token=localStorage.getItem("userAuthToken");
             if(token){
                setIsAuthenticated(true)
             }else{
             setIsAuthenticated(false);
             }
          },[isAuthenticated])
       

   return (
       <userContextAuth.Provider value={{isAuthenticated,setIsAuthenticated}}>
          {children}
       </userContextAuth.Provider>
   )
}

export const useAuth=()=>useContext(userContextAuth);

