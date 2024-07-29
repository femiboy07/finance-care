import React, { Children, Suspense, useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "../../@/components/ui/card";
import { Button, buttonVariants } from "../../@/components/ui/button";
import AddExpense from "../../components/Transaction/addExpense";
import AddIncome from "../../components/Transaction/addIncome";
import LatestTranscations from "../../components/Transaction/latestTranscations";
import CreateBudget from "../../components/Budget/createBudget";
import { ArrowDown, ArrowUp, DollarSign, LocateFixedIcon, LucideHome } from "lucide-react";
import StatsGraph from "../../components/Transaction/statsTable";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getMetrics, getUser } from "../../api/apiRequest";
import { formatAmount } from "../../utils/formatAmount";
import ReacentTransactions from "../../components/Transaction/RecentTransactions";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import useRequireAuth from "../../hooks/useRequireAuth";
import { createPortal } from "react-dom";
import UserLoggedOut from "../../components/Modals/UserLoggedOut";





export default function DashBoard(){
            const [loading,setLoading]=useState(false);
            const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
            const auth=useRequireAuth()
            const navigate=useNavigate();
            const {removeToken,isLoading}=useRequireAuth();
            const [searchParam,setSearchParam]=useSearchParams();
            const {isPending,error,data}=useQuery({
              queryKey:['metrics'],
              queryFn: getMetrics,
             
            })

            const {data:usernameData}=useQuery({
              queryKey:['username'],
              queryFn:getUser
            })

     

      
      if(isPending){
        return (
            <div className="bg-green-600 mt-20">
                 Loading...
            </div>
          )
      }
            if (error) 
              return (
              <div className=" w-full h-full flex justify-center bg-red-600 mt-20">
              {'An error has occurred: ' + error.message};
              </div>
            )
            console.log(data);
            console.log(usernameData)

return (
    <div className=" w-full px-3 lg:px-9 h-full mt-20 mb-10">
        <div className=" w-full h-full space-y-8 ">
         
        {usernameData &&  
         <div className="user-welcome text-orange-300 font-mono leading-9 font-extrabold">
          <h1 className=" text-2xl ">Welcome, {usernameData.data}</h1>
          <span className="text-black">Continue your journey to financial success</span>
         </div>}
         <div className="w-full mt-5 flex  ">
             <Card className="bg-white flex w-full gap-5 shadow-xs items-center justify-center p-5 leading-4">
                <AddExpense />
                <AddIncome/>
                <CreateBudget/>
             </Card>
          </div>
         <div className="income-expenses-financial-table flex gap-4 w-full mt-5 flex-wrap">
        
          <>
           <Card className="bg-white   w-52 h-52 rounded-lg shadow-xs  flex-1 min-w-52">
            <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1"> 
            <div className="w-14 h-14 flex justify-center items-center rounded-full bg-purple-300">
            <LucideHome className=" text-purple-900 "/>
            </div>
           <div className="flex  text-xl font-semibold">
           <div className=" text-4xl font-semibold">{formatAmount(data.totalBalance).slice(0,-3)}</div>
            <sub className="self-end">.{formatAmount(data.totalBalance).slice(-2)}</sub> 
            </div>
            <span className=" text-gray-400">Total balance</span>
            </div> 
           
           </Card>
           <Card className="bg-white   w-52 h-52 shadow-xs flex-1 min-w-52">
           <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1"> 
            <div className="w-14 h-14 flex justify-center items-center rounded-full bg-sky-100">
            <LocateFixedIcon className=" text-sky-900 "/>
            </div>
           <div className="flex  text-xl font-semibold">
            
            <div className=" text-4xl font-semibold">100,000</div>
            <sub className="self-end">.12</sub> 
            </div>
            <span className=" text-gray-400">Budgets</span>
            </div>
           </Card>
           <Card className="bg-white   w-52 h-52 shadow-xs  flex-1 min-w-52">
           <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1"> 
            <div className="w-14 h-14 flex justify-center items-center rounded-full bg-green-200">
            <ArrowUp className=" text-green-900 "/>
            </div>
           <div className="flex  text-xl font-semibold">
          
            <div className=" text-4xl font-semibold">{formatAmount(data.totalIncome).slice(0,-3)}</div>
            <sub className="self-end">{`.${data.totalExpense.toFixed(2).slice(-2)}`}</sub> 
            </div>
            <span className=" text-gray-400">Income</span>
            </div>
           </Card>
           <Card className="bg-white   w-52 h-52 shadow-xs  flex-1 min-w-52">
           <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1"> 
            <div className="w-14 h-14 flex justify-center items-center rounded-full bg-red-100">
            <ArrowDown className=" text-red-900 "/>
            </div>
           <div className="flex  text-xl font-semibold">
           
            <div className=" text-4xl font-semibold">{formatAmount(data.totalExpense).slice(0,-3)}</div>
            <sub className="self-end">.{formatAmount(data.totalExpense).slice(-2)}</sub> 
            </div>
            <span className=" text-gray-400">Expenses</span>
            </div>
           </Card>
           
           </>
           
          </div>
         
          </div>
        <div className="last-transcations w-full mt-5 flex h-full flex-wrap  gap-5">
         {/* <Card className=" w-full  h-full order-2 bg-white  px-5 py-7 ">
          <CardTitle>Recent Transactions</CardTitle> 
            <LatestTranscations/>
          </Card> */}

          <ReacentTransactions/>
          <Card className=" w-[60%] order-1 lg:px-3 px-0 flex-1 py-7 ">
            <CardTitle className="mb-5">Statistics</CardTitle>
            <StatsGraph/>
          </Card>
        </div>
        <div className="fixed -translate-x-1/2 top-1/2 -translate-y-1/2 left-1/2 w-full">
        {isLoading && <UserLoggedOut/>}
        </div>
    </div>
        
    )
}