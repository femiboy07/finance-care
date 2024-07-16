import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Minus, MinusCircleIcon } from "lucide-react";




export default function AddExpense(){
    return (
        <div className="flex flex-col gap-2 items-center">
        <Button className={buttonVariants({variant:"secondary",size:"icon",className:"rounded-full bg-orange-200 opacity-75"})}>
           <Minus color="white" className="bg-red-600 rounded-full"/>
        </Button>
        <span>Add Expense</span>
        </div>
    )
}