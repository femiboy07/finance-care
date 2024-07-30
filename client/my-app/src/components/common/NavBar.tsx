import React, { useState } from "react";
import { Input } from "../../@/components/ui/input";
import { BellRingIcon, CircleUserRoundIcon, MenuIcon, SearchIcon} from "lucide-react";
import { useInnerWidthState } from "../../hooks/useInnerWidthState";
import SearchTransactions from "../Transaction/searchTransactions";
import AuthProvider, { useAuth } from "../../context/userAutthContext";
import { useLoaderData, useRouteLoaderData } from "react-router-dom";
import useRequireAuth from "../../hooks/useRequireAuth";
import { createPortal } from "react-dom";
import UserLoggedOut from "../Modals/UserLoggedOut";





export default function NavBar({handleOpenSideBar}:{handleOpenSideBar:any}){
  const [width]=useInnerWidthState();
  const {token,removeToken,isLoading,setLoading}=useRequireAuth();
  
  const {setAuth}=useAuth();
 
 
  



    return (

        <div className="w-full  h-16  z-[42] bg-background border-b px-2    fixed  text-black">
          <div className=" flex w-full h-full items-center "> 
           <button onClick={handleOpenSideBar} className={` ${width < 1280 ? 'flex' :'hidden'} hover:bg-slate-200 min-h-[45px] flex-col min-w-[45px] justify-center items-center relative`}>
             <MenuIcon className=" w-[24px] h-[24px] self-center  "/>
           </button>
           <div className="ml-auto flex h-full  items-center  pr-5 text-black   ">
               <div className="search-bar relative w-9 flex justify-center items-center   md:w-64 rounded-full  min-h-10 pr-18">
               <Input type="text" placeholder="Search" className="absolute inset-0 pl-8 bg-transparent placeholder:text-gray-400 md:bg-slate-200   rounded-full  h-full "/>
                  <SearchIcon size={18} className="absolute top-1/2 -translate-y-1/2 md:left-2 text-gray-500"/>
               </div>
               <div className="inline-flex  items-center justify-center  pl-3 ">
                 <button className="relative min-w-[45px] min-h-[45px] flex flex-col  justify-center items-center bg-transparent">
                 <BellRingIcon size={25} className="after:border-r-2 divide-cyan-300 flex mr-2 w-[24px] h-[24px] after:border-black absolute left-1/2 -translate-x-1/2  "/>
                 <span className=" absolute flex  right-3 top-3 w-2 h-2 bg-red-400 rounded-full"></span>
                 </button>
                 <div className="  h-9 w-[2px] ml-2 mr-2 bg-slate-300 flex justify-center items-center text-black"></div>
                 {isLoading && createPortal(
                  <UserLoggedOut/>,document.body
                 )}
                 {token !== null ? 
                (
              <button onClick={removeToken}  className="min-h-[45px] font-bold bg-slate-200 outline-none border-none  cursor-pointer min-w-[45px] flex relative justify-center items-center rounded-full">
                <span className="uppercase text-slate-400">O</span>
                </button>):(    
                <CircleUserRoundIcon size={25}/>) } 
               </div>
            </div>
            </div>
        </div>
    )
}