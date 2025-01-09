import React, { Suspense, useEffect, useState } from "react";
import { Card, CardTitle } from "../../@/components/ui/card";
import AddExpense from "../../components/Transaction/addExpense";
import AddIncome from "../../components/Transaction/addIncome";
import CreateBudget from "../../components/Budget/createBudget";
import { ArrowDown, ArrowUp, LoaderCircle, LocateFixedIcon, LucideHome } from "lucide-react";
import StatsGraph from "../../components/Transaction/statsTable";
import { useQuery } from "@tanstack/react-query";
import { getMetrics, getUser } from "../../api/apiRequest";
import { formatAmount } from "../../utils/formatAmount";
import ReacentTransactions from "../../components/Transaction/RecentTransactions";
import useRequireAuth from "../../hooks/useRequireAuth";
import UserLoggedOut from "../../components/Modals/UserLoggedOut";
import SelectTypeByIncomeAndExpense from "../../components/Transaction/SelectTypeByIncomeAndExpense";
import DashBoardSkeleton from "../../components/Skeleton/DashBoardSkeleton";
import { apiClient } from "../../api/axios";
import { Line, LineChart } from "recharts";
import { useNavigate } from "react-router-dom";





export default function DashBoard() {
  const [loading, setLoading] = useState(false);
  const { isLoading } = useRequireAuth();
  const [intervals, setIntervals] = useState(() => (localStorage.getItem('intervalKey') || 'weekly'));
  const navigate = useNavigate();


  const { isPending, error, data } = useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,

  })


  console.log(data, "my data")


  const { data: usernameData } = useQuery({
    queryKey: ['username'],
    queryFn: getUser,


  })

  if (isPending) {
    return (
      <DashBoardSkeleton />
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
    <div className=" w-full px-3 lg:px-9 min-h-screen mt-20 font-custom2  mb-10 " style={{ clipPath: `rectangle(0 20%, 50% 0, 100% 80%, 0 100%)` }}>
      <div className=" w-full h-full space-y-8 ">

        {usernameData &&
          <div className="user-welcome text-orange-300  font-custom2 leading-2 font-extrabold">
            <h1 className=" text-2xl ">Welcome, {usernameData.data}</h1>
            <span className="text-black dark:text-foreground text-sm">Continue your journey to financial success</span>
          </div>}
        <div className="w-full mt-5 flex">
          <Card className="  flex w-full gap-5 border-0 shadow-md items-center justify-center p-5 leading-4">
            <AddExpense />
            <AddIncome />
            <CreateBudget />
          </Card>
        </div>
        <div className="income-expenses-financial-table flex gap-4 w-full mt-5 flex-wrap">
          {data &&
            <>

              <Card className=" relative border-0  w-52 h-52 flex rounded-lg shadow-md  flex-1 min-w-52">
                <div className="cont flex flex-col p-5  leading-2 space-y-7 flex-1">
                  {/* {!data && <LoaderCircleIcon className="animate-pulse" />} */}
                  <div className="w-14 h-14 flex justify-center items-center rounded-full bg-purple-300">
                    <LucideHome className=" text-purple-900 " />
                  </div>

                  <div className="flex  text-xl font-custom2 font-semibold">
                    <div className=" lg:text-3xl text-2xl  font-semibold">{data.totalBalance !== undefined ? formatAmount(data.totalBalance).slice(0, -3) : formatAmount(0).slice(0, -3)}</div>
                    <sub className="self-end">{`${data.totalBalance !== undefined ? ('.' + formatAmount(data.totalBalance).slice(-2)) : ("." + formatAmount(0).slice(-2))}`}</sub>
                  </div>

                  <span className=" text-gray-400">Total balance</span>
                </div>

              </Card>
              <Card className="w-52 h-52 shadow-md border-0 flex-1 min-w-52">
                <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1">
                  <div className="w-14 h-14 flex justify-center items-center rounded-full bg-sky-100">
                    <LocateFixedIcon className=" text-sky-900 " />
                  </div>
                  <div className="flex  text-xl font-custom2 font-semibold  flex-wrap overflow-ellipsis">

                    <div className=" lg:text-3xl text-2xl font-semibold text-ellipsis">{(data !== undefined && formatAmount(data.totalBudget).slice(0, -3)) || 0}</div>
                    <sub className="self-end">{`.${formatAmount(data.totalBudget).slice(-2)}`}</sub>
                  </div>
                  <span className=" text-gray-400">Budgets</span>
                </div>
              </Card>
              <Card className="w-52 h-52 border-0 shadow-md  flex-1 min-w-52">
                <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1">
                  <div className="w-14 h-14 flex justify-center items-center rounded-full bg-green-200">
                    <ArrowUp className=" text-green-900 " />
                  </div>
                  <div className="flex  text-xl font-custom2 font-semibold">
                    <div className=" lg:text-3xl text-2xl text-ellipsis line-clamp-3 font-semibold">{(data !== undefined && formatAmount(data.totalIncome).slice(0, -3)) || <LoaderCircle className="animate-spin" />}</div>
                    <sub className="self-end">{`.${formatAmount(data.totalIncome).slice(-2)}`}</sub>
                  </div>
                  <span className=" text-gray-400">Income</span>
                </div>
              </Card>
              <Card className="   w-52 border-0 h-52 shadow-md  flex-1 min-w-52">
                <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1">
                  <div className="w-14 h-14 flex justify-center items-center rounded-full bg-red-100">
                    <ArrowDown className=" text-red-900 " />
                  </div>
                  <div className="flex  text-xl font-custom2 font-semibold">

                    <div className=" lg:text-3xl text-2xl font-semibold line-clamp-3">{(data !== undefined && formatAmount(data.totalExpense).slice(0, -3)) || 0}</div>
                    <sub className="self-end">.{formatAmount(data.totalExpense).slice(-2)}</sub>
                  </div>
                  <span className=" text-gray-400">Expenses</span>
                </div>
              </Card>

            </>
          }
        </div>


      </div>
      <div className="last-transcations w-full mt-5 flex h-full flex-wrap  gap-5">
        <ReacentTransactions />
        <Card className=" w-[60%] border-0 h-96 order-1 lg:px-3 px-3 flex-1 py-7 ">
          <div className="flex w-full justify-between h-9 items-center">
            <CardTitle className=" self-center flex   text-md md:text-xl">
              <span className="self-center text-xl h-full">Date Overview</span>
            </CardTitle>
            <SelectTypeByIncomeAndExpense intervals={intervals} setIntervals={setIntervals} />
          </div>
          <StatsGraph intervals={intervals} />
        </Card>
      </div>
      <div className="fixed -translate-x-1/2 top-1/2 -translate-y-1/2 left-1/2 w-full">
        {isLoading && <UserLoggedOut />}
      </div>
    </div>


  )
}