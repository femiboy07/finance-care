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
  // const [auth]=useRequireAuth();
  // const [loading,setLoading]=useState(false);
  const {token,removeToken,isLoading,setLoading}=useRequireAuth();
  
  const {setAuth}=useAuth();
 
 
  



    return (

        <div className="w-full  h-16  z-[42] bg-background border-b px-2    fixed  text-black">
          <div className=" flex w-full h-full items-center "> 
           <button onClick={handleOpenSideBar} className={` ${width < 1280 ? 'flex' :'hidden'} hover:bg-slate-200 min-h-[45px] flex-col min-w-[45px] justify-center items-center relative`}>
             <MenuIcon className=" w-[24px] h-[24px] self-center  "/>
           </button>
           <div className="ml-auto flex h-full  items-center justify-end pr-5 text-black   ">
               <div className="search-bar relative w-9 flex justify-center items-center   md:w-64 rounded-full  min-h-12 pr-18">
               <Input type="text" placeholder="Search" className="absolute inset-0 pl-8 bg-transparent md:bg-white   rounded-full  h-full "/>
                  <SearchIcon size={18} className="absolute top-1/2 -translate-y-1/2 md:left-2   text-black"/>
               </div>
               <div className="flex pl-5 items-center">
                 <BellRingIcon size={25} className="after:border-r-2 divide-cyan-300 flex mr-2 after:border-black  "/>
                 <div className=" divide-y-4 divide-x-reverse"></div>
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