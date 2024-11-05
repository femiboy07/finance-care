import React, { Suspense, useEffect, useState } from "react";
import { Card, CardTitle } from "../../@/components/ui/card";
import AddExpense from "../../components/Transaction/addExpense";
import AddIncome from "../../components/Transaction/addIncome";
import CreateBudget from "../../components/Budget/createBudget";
import { ArrowDown, ArrowUp, LocateFixedIcon, LucideHome } from "lucide-react";
import ReacentTransactions from "../../components/Transaction/RecentTransactions";






export default function DashBoardSkeleton() {


    return (

        <div className=" w-full px-3 lg:px-9 min-h-screen mt-20  mb-10 " style={{ clipPath: `rectangle(0 20%, 50% 0, 100% 80%, 0 100%)` }}>
            <div className=" w-full h-full space-y-8 ">


                <div className="user-welcome text-orange-300 animate-pulse font-mono leading-9 font-extrabold">

                </div>
                <div className="w-full mt-5 flex  animate-pulse ">
                    <Card className=" bg-white flex w-full gap-5 animate-pulse shadow-xs items-center justify-center p-5 leading-4">

                    </Card>
                </div>
                <div className="income-expenses-financial-table animate-pulse flex gap-4 w-full mt-5 flex-wrap">

                    <>

                        <Card className="bg-white relative animate-pulse  w-52 h-52 rounded-lg shadow-xs  flex-1 min-w-52">
                            <div className="cont flex flex-col p-5  leading-2 space-y-7 flex-1">
                                <div className="w-14 h-14 flex justify-center items-center animate-pulse rounded-full "> </div>
                            </div>
                        </Card>
                        <Card className="bg-white  animate-pulse  w-52 h-52 shadow-xs flex-1 min-w-52">
                            <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1">
                                <div className="w-14 h-14 flex justify-center items-center animate-pulse rounded-full"></div>
                            </div>
                        </Card>
                        <Card className="bg-white   w-52 h-52 shadow-xs  flex-1 min-w-52">
                            <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1">
                                <div className="w-14 h-14 flex justify-center items-center rounded-full animate-pulse"></div>
                                <div className="flex animate-pulse  text-xl font-semibold">

                                </div>

                            </div>
                        </Card>
                        <Card className="bg-white  animate-pulse  w-52 h-52 shadow-xs  flex-1 min-w-52">
                            <div className="cont flex flex-col p-5 leading-2 space-y-7 flex-1">
                                <div className="w-14 h-14 flex justify-center items-center rounded-full"></div>
                            </div>
                        </Card>

                    </>

                </div>


            </div>
            <div className="last-transcations animate-pulse w-full mt-5 flex h-full flex-wrap  gap-5">
                <Card className=" w-[60%] h-96 order-1 lg:px-3 px-3 flex-1 py-7 ">
                    <div className="flex w-full justify-between h-9 items-center"></div>
                </Card>
            </div>

        </div>


    )
}