import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAccountsName } from "../../api/apiRequest";










export default function SelectAccount({name,setAccountName,accountName}:{name:string,setAccountName:any,accountName:any}){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    
    const {data,isPending,error}=useQuery({
        queryKey:['accounts',token.access_token],
        queryFn:getAccountsName
   })
    return (
        <>
         <Select name={name} value={accountName}  onValueChange={setAccountName} >
                    <SelectTrigger className="w-[180px] min-h-12 bg-white">
                        <SelectValue placeholder="Accounts" defaultValue={accountName} />
                      <SelectContent> 
                      {data && data.map((item:any)=>{
                        return (
                            <SelectItem key={item._id} value={item.name} defaultValue={"all"} onChange={(e)=>setAccountName(e.currentTarget)}>
                                {item.name}
                            </SelectItem>
                        )
                      })}
                      </SelectContent>
                    </SelectTrigger>
                 </Select>
        </>
    )
}