import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../@/components/ui/card';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchTransaction } from '../../api/apiRequest';
import { formatRelativeDate, formatTimeFromISOString } from '../../utils/formatRelativeDate';
import { format, formatDate } from 'date-fns';
import { formatAmount } from '../../utils/formatAmount';
import { ArrowRightSquareIcon, Loader2Icon, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserProvider';
import { useTransaction } from '../../context/TransactionProvider';
import { useData } from '../../context/DataProvider';
import lunchoImage from '../../assets/luncho.png'




export default function ReacentTransactions() {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
  const navigate = useNavigate()
  const { data, isPending, isSuccess, error, isLoading } = useQuery({
    queryFn: fetchTransaction,
    queryKey: ["latesttransaction"]
  });



  console.log(data, "recent transaction")
  const time = data && data.transactions.map((item: any) => {
    return {
      ...item,
      time: formatTimeFromISOString(item.date),
      date: formatRelativeDate(item.date)
    }
  });
  console.log(time)
  //  const result=data && time.transactions.map((item:any)=>({ ...item, date:formatRelativeDate(item.date)}));
  const newData = time && time.reduce((grouped: any, transaction: any) => {
    const date = transaction.date
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(transaction);
    return grouped
  }, {})
  console.log(time, newData)




  return (
    <Card className=' w-full lg:w-[50%] border-0 shadow-md'>

      {isLoading ?
        <div className='w-full h-full flex justify-center items-center'>
          <LoaderCircle size={35} className=' animate-spin' />
        </div> :
        <>
          <CardHeader>
            <CardTitle className='flex justify-between items-center text-md md:text-xl'>
              <span className='text-xl'>Transaction History</span>
              <Button onClick={() => navigate('transactions', { replace: true, state: 'love' })} className={buttonVariants({ variant: 'ghost', className: 'bg-transparent text-orange-300' })}>
                {/* view all */}
                <ArrowRightSquareIcon className='ml-2' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!newData && <div className='text-black text-md text-foreground text-center font-semibold w-full'>
              <div className='flex flex-col items-center text-lg justify-center'>
                <img src={lunchoImage} alt='lum' width={100} />
                <span>No recent transaction</span>
              </div>

            </div>}
            {newData && Object.keys(newData).map((category: any) => (
              <div key={category} className='flex font-bold flex-col mb-3 '>

                <h2 className='pb-3 text-gray-500  text-sm'>{category}</h2>
                <ul className='space-y-3'>
                  {newData[category].map((transaction: any) => (
                    <li key={transaction._id} className='flex justify-between w-full'>
                      <div className='flex flex-col'>
                        {transaction.category.map((k: any) => (
                          <span>{k?.name}</span>
                        ))}

                        <h4 className=' text-xs text-gray-300'>{transaction.time}</h4>
                      </div>
                      <span className={` font-custom2 ${transaction.type === 'income' ? 'text-green-500 font-bold' : 'text-black dark:text-red-500 font-bold'}`}>{formatAmount(transaction.amount.$numberDecimal)}</span>
                    </li>
                  ))}
                </ul>

              </div>
            ))}

          </CardContent>
        </>}
    </Card>
  )
}