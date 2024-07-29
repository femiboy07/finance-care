import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../@/components/ui/card';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions } from '../../api/apiRequest';
import { formatRelativeDate, formatTimeFromISOString } from '../../utils/formatRelativeDate';
import { format, formatDate } from 'date-fns';
import { formatAmount } from '../../utils/formatAmount';
import { ArrowRightSquareIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';




export default function ReacentTransactions(){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const navigate=useNavigate()
    const {data,isPending,isSuccess,error}=useQuery({
        queryFn:fetchTransactions,
        queryKey:["latesttransaction"]
    });

    if(isPending){
        console.log('pending')
    }

    if(error){
        console.log('error')
    }
      console.log(data,"recent transaction")
    const time=data && data.transactions.map((item:any)=>{
        return {
            ...item,
            time:formatTimeFromISOString(item.date),
            date:formatRelativeDate(item.date)
        }
    });
    console.log(time)
    //  const result=data && time.transactions.map((item:any)=>({ ...item, date:formatRelativeDate(item.date)}));
     const newData=time && time.reduce((grouped:any,transaction:any)=>{
       const date=transaction.date
       if(!grouped[date]){
         grouped[date]=[]
       }
       grouped[date].push(transaction);
       return grouped
     },{})
     console.log(time,newData)
          
       
          
       
    return (
        <Card className=' w-full lg:w-[50%]'>
         <CardHeader>
          <CardTitle className='flex justify-between items-center'>
          <h1>Transaction History</h1>
            <Button onClick={()=>navigate('transactions',{replace:true,state:'love'})} className={buttonVariants({variant:'ghost',className:'bg-transparent text-orange-300'})}>
                view all
              <ArrowRightSquareIcon className='ml-2'/>
            </Button>
          </CardTitle>
          </CardHeader>
          <CardContent>
           {newData && Object.keys(newData).map((category)=>(
             <div key={category} className='flex font-bold flex-col mb-3 '>
             <h2 className='pb-3 text-slate-200 text-md'>{category}</h2>
               <ul className='space-y-3'>
                 {newData[category].map((transaction:any)=>(
                    <li key={transaction._id} className='flex justify-between w-full'>
                        <div className='flex flex-col'>
                        <span>{transaction.category}</span>
                         <h4 className=' text-xs text-gray-300'>{transaction.time}</h4>
                        </div>
                      <span className={` ${transaction.type === 'income' ? 'text-green-500 font-bold':'text-black font-bold'}`}>{formatAmount(transaction.amount.$numberDecimal)}</span>
                    </li>
                 ))}
                </ul> 
            
            </div>
           ))}
           
          </CardContent>
          
        </Card>
    )
}