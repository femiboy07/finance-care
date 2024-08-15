import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/userAutthContext";
import { useEffect, useState } from "react";
import { apiClient } from "../context/LoadingContext";
import axios from "axios";




const useRequireAuth=()=>{
    // const {auth,setAuth}=useAuth();
    const token=localStorage.getItem('userAuthToken');
    const access_token=JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.access_token;
    const [isLoading,setLoading]=useState(false);
    // const [authToken,setAuthToken]=useState<string | null>(null);

    const removeToken = async () => {
      setLoading(true);
  
      try {
          // Simulate a delay with a promise
          await new Promise<void>((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay
          // Remove the token from local storage
          // Perform the logout request
          await apiClient.post('/auth/logout',null,{withCredentials:true})

      } catch (error) {
          console.error('Error during logout:', error);
      } finally {
          // Set loading state to false after all operations
          localStorage.removeItem("userAuthToken"); 
          setLoading(false);
          
      }
  };
    
    const navigate=useNavigate();

    

   

    useEffect(()=>{
       if(!token){
        navigate('/auth/login');
        
       }
    },[navigate,token]);

    return {token,removeToken,isLoading,setLoading};
}

export default useRequireAuth;