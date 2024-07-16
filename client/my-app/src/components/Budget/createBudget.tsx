import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { MinusCircleIcon, Wallet, Wallet2, Wallet2Icon, WalletCards, WalletIcon } from "lucide-react";




export default function CreateBudget(){
    return (
        <div className="flex flex-col gap-2 justify-center items-center">
        <Button className={buttonVariants({variant:"secondary",size:"icon",className:"rounded-full bg-blue-200 opacity-75"})}>
           <WalletIcon color="white" className="bg-blue-600  rounded-full"/>
        </Button>
        <span className="text-center">Create budget</span>
        </div>
    )
}