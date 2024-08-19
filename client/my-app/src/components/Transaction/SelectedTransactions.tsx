import React, { useMemo } from "react";
import { Card } from "../../@/components/ui/card";
import { useSelectedFilter } from "../../context/TableFilterContext";
import DeleteTransactionButton from "./DeleteTransaction";







export default function SelectedTransactions(){

    const {selectedTotal,rowSelection}=useSelectedFilter();
    const transactionIds=useMemo(()=>Object.keys(rowSelection),[rowSelection]);
    
    console.log(Object.keys(rowSelection),"rowselection")
    return (
        <div className="mb-[4rem] mt-5 px-0">
            <>
           <div className=" flex-col hidden  min-h-0 bg-white py-0 px-[0.5em] md:flex items-center mt-[0em] mb-[1em] mx-auto max-w-full w-[260px]  border first:border-t-0">
            <div className="flex-grow mt-[2px] block after:block after:content-[''] after:h-0  after:overflow-hidden after:clear-both">
             <div className="uppercase tracking-[0.5px] leading-normal text-center">Selected Transactions</div>
           </div>
           <div className="border-t-2 w-full bg-none m-0  flex-grow py-[0.75em] px-[0.5em] ">
             <div className="average-amount flex flex-col text-[1em] mb-0  ">
                <div className="flex justify-between items-center ">
                 <span className="pr-[20px] w-[70%]">Selected Total</span>
                 <span>{selectedTotal}</span>
                </div>
            </div>
            <div className="mt-[0.5rem]">
            <DeleteTransactionButton transactionId={transactionIds} icon={true}/>
           </div>
           </div>

           </div>
           </>
        </div>
    )
}