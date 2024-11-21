import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { LucideWallet2, MinusCircleIcon, Wallet, Wallet2, Wallet2Icon, WalletCards, WalletIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";




export default function CreateBudget() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col gap-2 items-center">
            <Button onClick={() => navigate('budgets')} className={buttonVariants({ variant: "secondary", size: "icon", className: "rounded-full h-12 w-12  font-bold lg:h-16 lg:w-16 flex flex-col  bg-blue-200 opacity-75" })}>
                <WalletCards color="blue" className="  self-center rounded-full " />
            </Button>
            <span className=" lg:text-lg text-sm">Create budget</span>
        </div>
    )
}