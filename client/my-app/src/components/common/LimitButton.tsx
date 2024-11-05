import React, { SetStateAction } from "react";
import { Button } from "../../@/components/ui/button";





export default function LimitButton({ setLimit }: { setLimit: React.Dispatch<SetStateAction<number>> }) {
    return (
        <div className="flex max-w-56 bg-slate-100 text-black rounded-md shadow-md   ">
            <Button onClick={() => setLimit(25)} className="min-h-10 bg-white text-black border  rounded-none px-5 py-5">25</Button>
            <Button onClick={() => setLimit(50)} className="min-h-10 bg-white text-black border  rounded-none px-5 py-5">50</Button>
            <Button onClick={() => setLimit(250)} className="min-h-10 bg-white border text-black  rounded-none px-5 py-5">250</Button>
        </div>
    )
}