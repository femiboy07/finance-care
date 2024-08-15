import React from "react";
import { Card } from "../../@/components/ui/card";
import { HomeIcon } from "lucide-react";




export default function ReviewTransactions(){
    return(
        <div id="sticky" className="mb-[4rem] mt-5">
            <Card className=" relative flex-col hidden md:flex leading-7 items-center mb-[1em] mx-auto max-w-[260px] w-[260px] p-[0.75em]">
            <HomeIcon/>
            <h1>REVIEW {} TRANSACTIONS</h1>
            <h6>Everything looks good</h6> 
          </Card>

          <Card className="relative flex-col hidden md:flex leading-7 items-center mb-[1em] mx-auto max-w-[260px] w-[260px] p-[0.75em]">
            <HomeIcon/>
            <h1>REVIEW ACCOUNTS</h1>
            <h6>Everything looks good</h6> 
          </Card> 
        </div>
    )
}