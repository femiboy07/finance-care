import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { LucideWallet2, MinusCircleIcon, Wallet, Wallet2, Wallet2Icon, WalletCards, WalletIcon } from "lucide-react";




export default function CreateBudget(){
    return (
        <div className="flex flex-col gap-2 justify-center items-center">
        <Button className={buttonVariants({variant:"secondary",size:"icon",className:"rounded-full bg-blue-200 opacity-75"})}>
           <Wallet color="white" className="bg-blue-600 h-[24px] w-[24px]   "/>
        </Button>
        <span className="text-center">Create budget</span>
        </div>
    )
}