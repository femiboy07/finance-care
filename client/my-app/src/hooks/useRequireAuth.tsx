import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/userAutthContext";
import { useEffect, useState } from "react";




const useRequireAuth=()=>{
    // const {auth,setAuth}=useAuth();
    const token=localStorage.getItem('userAuthToken');
    const [isLoading,setLoading]=useState(false);
    // const [authToken,setAuthToken]=useState<string | null>(null);

    const removeToken = () => {
        setLoading(true);
    
        // Simulate a delay with a promise
        new Promise<void>((resolve) => {
          setTimeout(() => {
            // Remove the token from local storage
            localStorage.removeItem("userAuthToken");
    
            // Resolve the promise
            resolve();
          }, 5000); // 5 seconds delay
        }).then(() => {
          // Set loading state to false after delay
          setLoading(false);
        });
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