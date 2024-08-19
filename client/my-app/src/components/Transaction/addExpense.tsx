import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Minus, MinusCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";




export default function AddExpense(){
    const navigate=useNavigate();
    return (
        <div className="flex flex-col gap-2 items-center">
        <Button onClick={()=>navigate('transactions')} className={buttonVariants({variant:"secondary",size:"icon",className:"rounded-full bg-orange-200 opacity-75"})}>
           <Minus color="white" className="bg-red-600 rounded-full"/>
        </Button>
        <span>Add Expense</span>
        </div>
    )
}