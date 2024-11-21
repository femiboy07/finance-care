
import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Plus } from "lucide-react";


import { useNavigate } from "react-router-dom";






export default function AddIncome() {

    const navigate = useNavigate();
    return (


        <div className="flex flex-col gap-2 items-center">
            <Button onClick={() => navigate(`transactions`, { replace: true })} className={buttonVariants({ variant: "secondary", className: "rounded-full h-12 w-12  lg:h-16 lg:w-16   relative flex flex-col justify-center items-center bg-green-200 " })}>
                <Plus color="white" className="bg-green-600 self-center rounded-full  h-[25px] w-[25px]" />
            </Button>
            <span className="lg:text-lg text-sm">Top up</span>
        </div>



    )
}