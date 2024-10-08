import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { getAccounts } from "../../api/apiRequest";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Card } from "../../@/components/ui/card";
import peerIcon from "../../assets/peercoin.png"
import { AccountTable, columns } from "../../components/Account/accountsTable";
import AddAccounts from "../../components/Account/AddAccounts";
import { AlignLeftIcon, ArrowLeftToLine, ArrowRightIcon, HomeIcon, LucideArrowLeft, MoveLeft, MoveLeftIcon, MoveRightIcon, PanelLeftIcon, PlusIcon } from "lucide-react";
import { useInnerWidthState } from "../../hooks/useInnerWidthState";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import { createPortal } from "react-dom";






export default function AccountPage(){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const {hideOver,setHideOver}=useOutletContext<ContextType>()
    const [isAddAccounts,setIsAddAccounts]=useState(false);
    const [width]=useInnerWidthState()
    const {data,isPending,error}=useQuery({
         queryKey:['allaccounts'],
         queryFn:getAccounts
    })
    
    if(isPending){
        return <div className="text-green-600 mt-20 mb-20">Loading...</div>
    }

    if(error){
        return (
            <div className=" text-red-600 w-full mt-20">Error check your internet connection</div>
        )
    }

    const handleOpenSideBar=()=>{
        setIsAddAccounts(true);
        
      }

    if(data && data.allAccounts && data?.allAccounts.length === 0){
        return (
            <div className="flex flex-col justify-center w-full place-items-center  items-center mt-20 mb-10">
               <Card className="flex flex-col h-full items-center justify-center p-4 space-y-3">
                <img src={peerIcon} width={100} alt="account"/>
               <span>You need to create An account..to make transcations</span>
               <Button onClick={handleOpenSideBar} className={buttonVariants({className:" bg-orange-400 lg:py-6 hover:bg-slate-300 flex justify-center rounded-full items-center hover:opacity-45 lg:h-13  py-7   lg:rounded-md"})}>
                 <PlusIcon className="w-[25px]  h-[25px] self-center"/>
                 <span className=" lg:block hidden">Add</span> 
                </Button>
               </Card> 
            </div>
        )
    }
    const modifiedData=data.allAccounts.map((item:any)=>{
        const {name,type,balance}=item;

        return item;
    })
    
       function handleHideOver(){
        setHideOver((prev:boolean)=>!prev);

      
    }
    return (
    <div className="w-full px-3 h-full lg:px-9 mt-20 mb-10">
        <h1 className="text-black text-4xl">Accounts</h1>
        <div className="mt-10 ">
        <div className="flex w-full justify-between"> 
        <div className="ml-auto flex items-center gap-2" >
                 <Button onClick={handleOpenSideBar} className={buttonVariants({className:" bg-orange-400 lg:py-6 hover:bg-slate-300 flex justify-center rounded-full items-center hover:opacity-45 lg:h-13  py-7   lg:rounded-md"})}>
                 <PlusIcon className="w-[25px]  h-[25px] self-center"/>
                 <span className=" lg:block hidden">Add</span> 
                </Button>
           <Button className={buttonVariants({variant:"default",className:` px-4 bg-orange-400  hidden md:flex ${hideOver ? 'md:flex':'hidden'}`})} onClick={handleHideOver}>
             <MoveLeftIcon className=" w-4 h-4"/>
           </Button>
           </div>
        </div>
          <div className="flex mt-[18px] lg:pb-[1em]">
          <div className=" flex-grow transition transform">
          <Card className="border-0 px-3 py-3">
          <AccountTable columns={columns} data={modifiedData}/>
          </Card>
         </div>  
         {isAddAccounts && 
               (
              createPortal(   
              <div className="fixed right-0  top-0 left-0 z-[48] lg:z[9999]  w-full h-full flex justify-end "> 
             <AddAccounts isAddAccounts={isAddAccounts} setIsAddAccounts={setIsAddAccounts}/>
             </div>,document.body)
           )}  
         {width >= 768 && <div style={{minWidth:`calc(260px + 1rem)`}} className={`${hideOver ? `flex`:`hidden`} flex flex-col items-end pl-[1rem]`}>
          <div className="w-full bg-red-300 h-0"></div>
          <div id="sticky mb-[4rem]">
          <Card className=" relative flex-col hidden md:flex leading-7 items-center mb-[1em] mx-auto max-w-[260px] w-[260px] p-[0.75em]">
            <HomeIcon/>
            <h1>REVIEW ACCOUNTS</h1>
            <h6>Everything looks good</h6> 
          </Card>

          <Card className="relative flex-col hidden md:flex leading-7 items-center mb-[1em] mx-auto max-w-[260px] w-[260px] p-[0.75em]">
            <HomeIcon/>
            <h1>REVIEW ACCOUNTS</h1>
            <h6>Everything looks good</h6> 
          </Card>
          </div>
         </div>}
          </div>
          
         
          </div>
        </div>
    )
}