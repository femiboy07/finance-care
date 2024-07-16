import React, { SetStateAction, Suspense, useEffect, useState } from "react";
import SideBar from "../components/common/sideBar";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/common/NavBar";
import { Toaster } from "../@/components/ui/toaster";
import { addMonths, subMonths } from "date-fns";
import { useAuth } from "../context/userAutthContext";
import { useInnerWidthState } from "../hooks/useInnerWidthState";



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
    params:any;
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
    const token = localStorage.getItem('userAuthToken');
    const navigate=useNavigate();
    const nextMonth=addMonths(today , 0);
  
    const [months,setMonth]=useState(nextMonth);
    const [searchParams, setSearchParams] = useSearchParams();
    const params = new URLSearchParams();
    const [name,setName]=useState(searchParams.get('name') || "");
    const [category,setCategory]=useState(searchParams.get("category") || "");
    const [width]=useInnerWidthState();
    const [page,setPage]=useState(1);
    const [currentPage,setCurrentPage]=useState<number>(page);
    // const params = useMemo(()=>new URLSearchParams(),[]);
    const monthNames = [
     "January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"
   ];

   const monthString=monthNames[months.getMonth()];
   
   function NextMonth(){
       setMonth(addMonths(months,1));
   }

   function PrevMonth(){
     setMonth(subMonths(months,1));
  }
  
   const year=months.getFullYear();
   const month=months.getMonth();

   useEffect(()=>{
    if(!token){
      navigate('/auth/login')
    }
   },[navigate,token])
  
   
    return(
        <div className="h-full w-full flex   ">
           {/* so this is for the side bar */}
         <NavBar/>  
         <SideBar/> 
         <div className={ `flex   flex-col  h-full w-full max-['768px']:ml-5 lg:px-2 ml-auto  ${width <= 1200 ? 'ml-0':'ml-64'}`}>
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
        params,category
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