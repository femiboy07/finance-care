import React, { ReactElement, ReactNode, useEffect } from 'react';
import { Navigate, Outlet, OutletProps, redirect, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/userAutthContext';
import useRequireAuth from '../../hooks/useRequireAuth';





interface ProtectedPageProps {
    children: React.ReactNode;
  }
  
  const ProtectedPage: React.FC <ProtectedPageProps>= ({children}) => {
    // const auth = useRequireAuth();
    const {auth}=useAuth();
    const location=useLocation();
    const navigate=useNavigate();
    
    console.log(auth)
   useEffect(()=>{
  

    if (!auth) {
         navigate('/auth/login',{replace:true});
     }
    //  navigate('/dashboard',{replace:true})
},[navigate, auth])

   console.log(auth)
 
    return  (<>{children}</>)
  };
  
  export default ProtectedPage;