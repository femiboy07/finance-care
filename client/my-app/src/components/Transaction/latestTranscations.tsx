import React,{Suspense, useEffect,useState} from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import axios from "axios";
import { fetchTransactions } from "../../api/apiRequest";
import { formatAmount } from "../../utils/formatAmount";


type userToken={
    access_token:string | any;
    refresh_token:string| any;
}

type LatestTranscation={
    accountId:{
        // id:string,
        name:string,
    }
    status:"pending"|"cleared";
    category:string;
    date:Date;
    amount:any;
    type:string;
}


export default function LatestTranscations(){
       const [loading,setLoading]=useState<boolean>(false);
       const [error,setError]=useState<string>('');
       const [data,setData]=useState<any|null>(null);
       const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');

       console.log(token);

       console.log(data)

    useEffect(()=>{
       if(token.access_token){
            setLoading(true);
          fetchTransactions(token.access_token).then((data)=>{
             setLoading(false);
             setData(data);
          })
        }
   
     },[token.access_token]);

    if(loading){
        return <div>Loading...</div>
    }

    return(
        
        <Table className="border-none">
            <TableCaption>Recent Transcation</TableCaption>
            <TableHeader>
                <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead >Category</TableHead>
                <TableHead>Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="border-none">
              {data && data?.transactions.map((item:any)=>{
                return(
                    <TableRow className="border pb-9 pt-9 last-of-type:border border-collapse">
                        <TableCell>{item.date}</TableCell>
                        <TableCell >
                            <span className={`${item.status === "cleared"?' bg-green-200 text-green-900 w-full py-1 px-2 rounded-full':''}`}>
                            {item.status}
                            </span>
                       </TableCell>
                        <TableCell className=" w-15">{item.category}</TableCell>
                        <TableCell>
                         <span className={`${item.type === 'income' ? "text-green-900 font-bold":"text-red-900 font-semibold"}`}>{formatAmount(item.amount.$numberDecimal)}</span>
                        </TableCell>

                    </TableRow>
                )
              })}   
            </TableBody>
        </Table>
    
    )
}

function setLoading(arg0: boolean) {
    throw new Error("Function not implemented.");
}
