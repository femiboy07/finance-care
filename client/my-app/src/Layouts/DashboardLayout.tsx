import React, { SetStateAction, Suspense, useEffect, useState } from "react";
import SideBar from "../components/common/sideBar";
import { Navigate, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/common/NavBar";
import { Toaster } from "../@/components/ui/toaster";
import { addMonths, subMonths } from "date-fns";
import { useInnerWidthState } from "../hooks/useInnerWidthState";
import MobileSideBar from "../components/common/mobileSideBar";
import { useAuth } from "../context/userAutthContext";
import useRequireAuth from "../hooks/useRequireAuth";
import UserLoggedOut from "../components/Modals/UserLoggedOut";
import { createPortal } from "react-dom";




export type ContextType={
    PrevMonth:()=>any;
    NextMonth:()=>any;
    monthString?:string;
    months:Date;
    month:any;
    year:any;
    setMonth:any;
    searchParams:any;
    setSearchParams:any;
    category:any;
    name:any;
    setCategory:any;
    setName:any;
    page:number;
    currentPage:number;
    setPage:any;
    setCurrentPage:any
    
}

export default function DashBoardLayout(){
    const today=new Date();
    const nextMonth=addMonths(today , 0);
    const [months,setMonth]=useState(nextMonth);
    const [searchParams, setSearchParams] = useSearchParams();
    const [name,setName]=useState(searchParams.get('name') || "");
    const [category,setCategory]=useState(searchParams.get("category") || "");
    const [width]=useInnerWidthState();
    const [page,setPage]=useState(1);
    const navigate=useNavigate();
    const [currentPage,setCurrentPage]=useState<number>(page);
    // const {auth}=useAuth();
    // const token = localStorage.getItem("userAuthToken");
    const {token,removeToken,isLoading,setLoading} =useRequireAuth();
    // const token=JSON.stringify(auth)
    
     useEffect(()=>{
      if(token === null){
        navigate('/auth/login',{replace:true});
      }
     },[navigate,token])
  
    const monthNames = [
     "January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"
   ];
   const [open,setOpen]=useState(false);
   
  const handleOpenSideBar=()=>{
    setOpen(true);
   }

   const monthString=monthNames[months.getMonth()];
   
   function NextMonth(){
       setMonth(addMonths(months,1));
   }

   function PrevMonth(){
     setMonth(subMonths(months,1));
  }
  
   const year=months.getFullYear();
   const month=months.getMonth();


  
   
    return(
  
    <div className="h-full w-full flex  relative ">
           {/* so this is for the side bar */}
         <NavBar handleOpenSideBar={handleOpenSideBar}/>  
         <SideBar setOpen={setOpen} open={open}/> 
        {width  < 1280 && <MobileSideBar open={open} setOpen={setOpen}/>}
         
        <div className={ `flex flex-col h-full w-full   mx-auto xl:ml-64 `}>
        <Outlet 
        context=
        {{PrevMonth,
        NextMonth,
        months,
        monthString,
        month,year,
        setMonth,
        searchParams,
        setSearchParams,
        category
        ,name
        ,setCategory
        ,setName,
         setCurrentPage,
         setPage,
         page,
         currentPage,
        } satisfies ContextType}  /> 
       <Toaster/>
      </div>
      </div>
      
      
    )
};