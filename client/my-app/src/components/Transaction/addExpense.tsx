import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Minus, MinusCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";




export default function AddExpense() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col gap-2 items-center">
            <Button onClick={() => navigate('transactions')} className={buttonVariants({ variant: "secondary", size: "icon", className: "rounded-full h-12 w-12  font-bold lg:h-16 lg:w-16 flex flex-col  bg-orange-200 opacity-75" })}>
                <Minus color="white" className="bg-red-600 rounded-full self-center h-[25px] w-[25px]" />
            </Button>
            <span className="lg:text-lg text-sm">Add expense</span>
        </div>
    )
}