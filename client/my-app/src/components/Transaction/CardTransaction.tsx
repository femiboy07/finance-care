import { BadgeDollarSignIcon, CarrotIcon, Clock10Icon, Edit2Icon, LoaderCircleIcon, NotebookIcon } from "lucide-react";
import { Card } from "../../@/components/ui/card";
import { Transaction } from "./transactionData";
import { formatDate } from "date-fns";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import { useSelectedFilter } from "../../context/TableFilterContext";






export default function CardTransaction({ data, handleEditTransaction, isPending }: { data: any, handleEditTransaction: any, isPending?: boolean }) {
  console.log(data);
  const { rowSelection } = useSelectedFilter()
  const handleFormat = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
    return formatted;
  }
  console.log(Object.keys(rowSelection), "selection");


  return (
    <div className="mt-5 mb-5 table-fixed">
      {isPending ?
        <Card className={`w-full  max-w-full  flex-1 overflow-x-auto min-h-64  flex-col justify-center mb-2 relative  border-l-4  border-l-orange-700`} >
          <div className="flex flex-col justify-center w-full h-full items-center text-black">
            <span>Fetching transactions</span>
            <LoaderCircleIcon className=" animate-spin" />
          </div>

        </Card> :
        <>
          {data.length > 0 ? data.map((item: any) => (
            <Card key={item._id} className={`lg:w-full max-w-full overflow-x-auto min-h-64 mb-2 relative border-l-4  border-l-orange-700`}>
              <div className="flex flex-col justify-center  relative h-full px-2 py-3 space-y-6">
                <div className="absolute right-5 top-5">
                  <div>
                    <button onClick={() => handleEditTransaction(item)} className="bg-transparent hover:scale-110 duration-200 transition-transform ease-in-out min-h-[45px] bg-gray-100 shadow-lg rounded-[12px] min-w-[45px] flex justify-center items-center">
                      <Edit2Icon className="self-center w-9 h-4 text-red-700" />
                    </button>
                  </div>
                </div>
                <div className="flex  ">
                  <Clock10Icon className="mr-2" />
                  <h1>{formatDate(item.date, "P")}</h1>
                </div>
                <div className="flex items-center max-w-64 ">
                  <NotebookIcon className="mr-2 flex-shrink-0" />
                  <div className=" overflow-hidden text-ellipsis">
                    <span className="self-start max-w-64">{item.description}</span>
                  </div>
                </div>
                <div className="flex">
                  <CarrotIcon className="mr-2" />
                  <p>{item.category.name}</p>
                </div>
                <div className="flex">
                  <BadgeDollarSignIcon className="mr-2" />
                  <p className={`${item.type === 'income' ? 'text-green-500' : 'text-red-500'} font-bold `}>{handleFormat(item.amount.$numberDecimal)}</p>
                </div>
              </div>

            </Card>

          ))


            : (
              <Card className="w-full max-w-w-full h-64 mb-2 relative justify-center  flex items-center border-l-4 border-l-orange-700">
                <p>No result found</p>
              </Card>
            )}
        </>}
    </div>
  )
}