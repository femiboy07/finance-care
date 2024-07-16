import React, { ReactElement, useEffect } from 'react';
import { Navigate, Outlet, redirect, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/userAutthContext';






export  function ProtectedPage({children}:{children:React.ReactElement}){
            const {isAuthenticated,setIsAuthenticated}=useAuth();
            const navigate=useNavigate();


    


   

        

          
    return  children 
         
}

