import React, { Suspense, useEffect, useState } from "react";
import { Card, CardTitle } from "../../@/components/ui/card";
import AddExpense from "../../components/Transaction/addExpense";
import AddIncome from "../../components/Transaction/addIncome";
import CreateBudget from "../../components/Budget/createBudget";
import { ArrowDown, ArrowUp, DollarSign, GanttChartIcon, LocateFixedIcon, LucideBadgeSwissFranc, LucideBarChart4, LucideFileLineChart, LucideGitGraph, LucideHome, LucideLineChart, MailSearchIcon } from "lucide-react";
import StatsGraph from "../../components/Transaction/statsTable";
import { useQuery } from "@tanstack/react-query";
import { getMetrics, getUser } from "../../api/apiRequest";
import { formatAmount } from "../../utils/formatAmount";
import ReacentTransactions from "../../components/Transaction/RecentTransactions";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import useRequireAuth from "../../hooks/useRequireAuth";
import { createPortal } from "react-dom";
import UserLoggedOut from "../../components/Modals/UserLoggedOut";





export default function DashBoard(){
            const [loading,setLoading]=useState(false);
            const {removeToken,isLoading}=useRequireAuth();
        
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
            if (error?.message === '') 
              return (
              <div className=" w-full h-full flex justify-center bg-red-600 mt-20">
              {'An error has occurred: ' + error.message};
              </div>
            )
            console.log(data);
            console.log(usernameData)

return (
  <Suspense fallback={<div className="text-black bg-blue-600 h-64">Loading...</div>}>
    <div className=" w-full px-3 lg:px-9 h-full mt-20  mb-10 " style={{clipPath: `rectangle(0 20%, 50% 0, 100% 80%, 0 100%)`}}>
        <div className=" w-full h-full space-y-8 ">
         
        {usernameData &&  
         <div className="user-welcome text-orange-300 font-mono leading-9 font-extrabold">
          <h1 className=" text-2xl ">Welcome, {usernameData.data}</h1>
          <span className="text-black">Continue your journey to financial success</span>
         </div>}
         <div className="w-full mt-5 flex  ">
             <Card className=" bg-white flex w-full gap-5 shadow-xs items-center justify-center p-5 leading-4">
                <AddExpense />
                <AddIncome/>
                <CreateBudget/>
             </Card>
          </div>
         <div className="income-expenses-financial-table flex gap-4 w-full mt-5 flex-wrap">
        
          <>
          <Suspense fallback={<div className="bg-blue-600 h-64 w-64">Loading...</div>}>
           <Card className="bg-white relative  w-52 h-52 rounded-lg shadow-xs  flex-1 min-w-52">
            <div className="cont flex flex-col p-5  leading-2 space-y-7 flex-1"> 
            <div className="w-14 h-14 flex justify-center items-center rounded-full bg-purple-300">
            <LucideHome className=" text-purple-900 "/>
            </div>
            {/* <div className="absolute right-5 top-2 w-14">
             <MailSearchIcon className=" w-[64px] h-[24px]" size={50}/>
            </div> */}
           <div className="flex  text-xl font-semibold">
           <div className=" text-4xl font-semibold">{ data.totalBalance !== undefined  ? formatAmount(data.totalBalance).slice(0,-3) : formatAmount(0).slice(0,-3)}</div>
            <sub className="self-end">{`${data.totalBalance !== undefined ? ('.'+formatAmount(data.totalBalance).slice(-2)) : ("."+formatAmount(0).slice(-2)) }`}</sub> 
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
            
            <div className=" text-4xl font-semibold">{(data !== undefined && formatAmount(data.totalBudget).slice(0,-3)) || 0}</div>
            <sub className="self-end">{`.${formatAmount(data.totalBudget).slice(-2)}`}</sub> 
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
            <div className=" text-4xl font-semibold">{(data !== undefined && formatAmount(data.totalIncome).slice(0,-3)) || 0}</div>
            <sub className="self-end">{`.${formatAmount(data.totalIncome).slice(-2)}`}</sub> 
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
           
            <div className=" text-4xl font-semibold">{(data !== undefined && formatAmount(data.totalExpense).slice(0,-3)) || 0}</div>
            <sub className="self-end">.{formatAmount(data.totalExpense).slice(-2)}</sub> 
            </div>
            <span className=" text-gray-400">Expenses</span>
            </div>
           </Card>
           </Suspense>
           </>
           
          </div>
          
         
          </div>
        <div className="last-transcations w-full mt-5 flex h-full flex-wrap  gap-5">
         {/* <Card className=" w-full  h-full order-2 bg-white  px-5 py-7 ">
          <CardTitle>Recent Transactions</CardTitle> 
            <LatestTranscations/>
          </Card> */}

          <ReacentTransactions/>
          <Card className=" w-[60%] h-96 order-1 lg:px-3 px-3 flex-1 py-7 ">
            <CardTitle className="mb-5">Statistics</CardTitle>
            <StatsGraph/>
          </Card>
        </div>
        <div className="fixed -translate-x-1/2 top-1/2 -translate-y-1/2 left-1/2 w-full">
        {isLoading && <UserLoggedOut/>}
        </div>
    </div>
    </Suspense>
        
    )
}