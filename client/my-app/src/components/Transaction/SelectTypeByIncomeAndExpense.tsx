import React, { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";




export default function SelectTypeByIncomeAndExpense({ intervals, setIntervals }: { intervals: any, setIntervals: any }) {
  const localInterval = localStorage.getItem('intervalKey');


  useEffect(() => {


    localStorage.setItem("intervalKey", intervals)



  }, [intervals])

  return (
    <Select onValueChange={setIntervals} value={intervals} >
      <SelectTrigger className="w-[100px] h-full" defaultValue={intervals}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="weekly">weekly</SelectItem>
        <SelectItem value="yearly">yearly</SelectItem>
        <SelectItem value="monthly">monthly</SelectItem>
      </SelectContent>
    </Select>
  )
}