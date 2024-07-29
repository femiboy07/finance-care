import React from 'react';
import { createPortal } from "react-dom";
import useRequireAuth from "../../hooks/useRequireAuth"
import { Loader } from 'lucide-react';











export default function UserLoggedOut(){

    

    
     return(
        <>
        <div className='fixed top-0 lef-0 right-0 bottom-0 bg-gray-300 w-full h-full opacity-15  z-50'></div>
        <div className="fixed   mx-auto container w-full x-3 lg:px-9 top-1/2 flex flex-col items-center -translate-x-1/2 left-1/2 -translate-y-1/2 ">
        <div className=" w-64 h-64 shadow-2xl bg-white px-5 py-2 rounded-md">
            <div className="py-2 flex flex-col text-black justify-center items-center h-full text-center ">
               
            <Loader className='animate-spin '/>
            <div className='mt-2'>
            <h1>Logging out User pls wait </h1> 
            <p>Thank you have a wonderfull day</p>
            </div>
            </div>  
        </div>
        </div>
      </>
      
    )
    

 
}