import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";




export default function SelectTypeByIncomeAndExpense({intervals,setIntervals}:{intervals:any,setIntervals:any}){

  
    
    return (
    <Select onValueChange={setIntervals} value={intervals} >
    <SelectTrigger className="w-[180px] h-full" defaultValue={intervals}>
             <SelectValue/>
       </SelectTrigger>
       <SelectContent>
       <SelectItem value="weekly">weekly</SelectItem>
       <SelectItem value="yearly">yearly</SelectItem>
       <SelectItem value="monthly">monthly</SelectItem>
      </SelectContent>
    </Select>
    )
}