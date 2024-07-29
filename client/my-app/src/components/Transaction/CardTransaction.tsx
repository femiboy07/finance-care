import { BadgeDollarSignIcon, CarrotIcon, Clock10Icon, Edit2Icon, NotebookIcon } from "lucide-react";
import { Card } from "../../@/components/ui/card";
import { Transaction } from "./transactionData";
import { formatDate } from "date-fns";
import { formatRelativeDate } from "../../utils/formatRelativeDate";






export default function CardTransaction({data,handleEditTransaction}:{data:any,handleEditTransaction:any}){
    console.log(data);
  const handleFormat=(amount:number)=>{
    const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
      return formatted;
  }
    
    return (
    <div className="mt-5 mb-5">
        {data.length > 0   ? data.map((item: any)=>(
           <Card className="w-full max-w-w-full h-64 mb-2 relative  border-l-4 border-l-orange-700">
              <div className="flex flex-col justify-center  relative h-full px-2 py-3 space-y-6">
              <div className="absolute right-5 top-5">
                <div>
                    <button onClick ={()=>handleEditTransaction(item)} className="bg-transparent hover:scale-110 duration-200 transition-transform ease-in-out min-h-[45px] bg-gray-100 shadow-lg rounded-[12px] min-w-[45px] flex justify-center items-center">
                     <Edit2Icon className="self-center w-9 h-4 text-red-700"/>
                    </button>
                </div>
              </div>
                <div className="flex  ">
                 <Clock10Icon className="mr-2"/>
                 <h1>{formatDate(item.date,"P")}</h1>
                </div>
                <div className="flex flex-wrap text-wrap">
                 <NotebookIcon className="mr-2"/>
                 <p>{item.description}</p>
                </div>
                <div className="flex">
                 <CarrotIcon className="mr-2"/>
                 <p>{item.category}</p>
                </div>
                <div className="flex">
                 <BadgeDollarSignIcon className="mr-2"/>
                 <p className={`${item.type === 'income' ? 'text-green-500':'text-red-500'} font-bold `}>{handleFormat(item.amount.$numberDecimal)}</p>
                </div>
              </div>
            
           </Card>
        )):(
            <Card className="w-full max-w-w-full h-64 mb-2 relative justify-center  flex items-center border-l-4 border-l-orange-700">
              <p>No result found</p>
            </Card>
        )}  
       
        </div>
    )
}