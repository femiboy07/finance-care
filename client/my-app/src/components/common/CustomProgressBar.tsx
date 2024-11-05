
import React, { useEffect } from "react";
import { Progress } from "../../@/components/ui/progress";




export default function CustomProgressBar({ spent, remaining, amount }: { spent: any, remaining: any, amount: any }) {
    console.log(spent, remaining, amount, 'ss');
    const totalBudget = amount && amount.$numberDecimal && parseInt(amount?.$numberDecimal);
    const amountSpent = spent && spent.$numberDecimal && parseInt(spent?.$numberDecimal);
    const remainingAmount = remaining && remaining.$numberDecimal && parseInt(remaining?.$numberDecimal);
    const percentageRemaining: number = (amountSpent / totalBudget) * 100;
    console.log(amountSpent, typeof remainingAmount, percentageRemaining, totalBudget)


    return (
        <div className="w-full h-[10px] rounded-[5px]    overflow-hidden relative bg-slate-100">
            <div style={{ width: `${percentageRemaining}%` }} className=" absolute transition-[width] duration-[0.4s] ease-in-out rounded-[5px] h-[100%] bg-green-500 "></div>
            <div className=" left-full absolute  bg-slate-100  h-[100%]" ></div>

        </div>
    )
}