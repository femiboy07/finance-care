import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAccountsName } from "../../api/apiRequest";










export default function SelectAccount({ name, setAccountName, accountName }: { name: string, setAccountName: any, accountName: any }) {
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');

    const { data } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccountsName,
        gcTime: 0,
        staleTime: Infinity
    })
    return (
        <>
            <Select name={name} value={accountName} onValueChange={setAccountName}  >
                <SelectTrigger className="w-[180px] min-h-12 rounded-2xl text-orange-500 focus-within:border-orange-400 border-orange-500 bg-white">
                    <SelectValue placeholder="Accounts" defaultValue={accountName} className="" />
                    <SelectContent className="z-5 border-orange-500">
                        {data && data?.map((item: any) => {
                            return (
                                <SelectItem key={item._id} value={item.name} defaultValue={"all"} onChange={(e) => setAccountName(e.currentTarget)}>
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