import React, { useEffect, useRef } from "react";
import { Card } from "../../@/components/ui/card";
import { HomeIcon, LoaderCircleIcon, SettingsIcon } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import { formatAmount } from "../../utils/formatAmount";
import { useBudget } from "../../context/BudgetContext";
import { useSelectedFilter } from "../../context/TableFilterContext";
import CustomProgressBar from "../common/CustomProgressBar";
import { useData } from "../../context/DataProvider";
import { dataCategory } from "../../Pages/DashBoard/transactions";




export default function ReviewTransactions({ transaction, month, year, page, category }: { transaction: any, month: any, year: any, page: any, category: any }) {
  const { monthString } = useOutletContext<ContextType>();
  console.log(month, year, "month", "year")
  //fetch budgets;
  const { data, isLoading } = useBudget();



  const transformData = transaction && transaction.reduce((acc: any, current: any) => {
    const existing = acc.find((item: any) => item.category.name === current.category.name);

    if (existing) {
      existing.amount = parseFloat(existing.amount) + parseFloat(current.amount.$numberDecimal);
    } else {
      acc.push({ ...current, amount: current.amount.$numberDecimal });
    }

    return acc;
  }, []);
  console.log(transformData);
  console.log(data, 'budget')

  const transactionIncome = transformData.filter((item: any) => item.category.type === "income");
  console.log(transactionIncome)


  const transactionExpense = transformData.filter((item: any) => item.category.type === 'expense');




  return (
    <div className="mb-[4rem] mt-5 " >
      <Card className="  flex-col static bg-opacity-60 bg-white   flex leading-7 items-center mb-[1em] mx-auto max-w-[260px] w-[260px] p-[0.75em]" >
        <HomeIcon />
        <h1>REVIEW { } TRANSACTIONS</h1>
        <h6>Everything looks good</h6>
      </Card>

      <Card className="sticky flex-col min-h-0  bg-opacity-60 bg-white  flex leading-7 items-center px-[13px] mb-[1em] mx-auto max-w-[260px] w-[260px] p-[0.75em]">

        <div className=" content group/content group-first/content:border-none ">
          <div className="header  uppercase  flex justify-between items-start" style={{ borderTop: 0 }}>
            <span></span>
            <span className="text-sm">{monthString} summary</span>
            {/* <SettingsIcon className="w-5" /> */}
          </div>
          {/* <hr className="border-slate-200 w-full" /> */}
        </div>
        {/** for income  to be found here  */}
        <div className="mt-2  content  w-full ">
          <p className=" uppercase text-center">Income</p>
          <div className="flex flex-col last:mb-0">
            {transactionIncome.map((item: any) => (
              <div className="mt-2">
                <div key={item._id} className="flex justify-between">
                  <span className="w-[70%] text-ellipsis  overflow-hidden whitespace-nowrap">
                    {item.category.name}
                  </span>
                  <span className=" whitespace-nowrap text-sm">
                    {formatAmount(item.amount)}
                  </span>
                </div>
                {isLoading && <LoaderCircleIcon className=" animate-spin" />}
                <div className="before:mt-3 after:mb-3">
                  {data && data.data && data?.data.filter((b: any) => b.budget.$numberDecimal !== "0.0" && b.month !== null && b.year !== null && b.category === item.category.name).map((k: any) => (
                    <CustomProgressBar
                      spent={k.spent}
                      remaining={k.remaining}
                      amount={k.budget}

                    />
                  ))}
                </div>
              </div>
            ))}

          </div>

        </div>
        <div className="mt-2  content  w-full ">
          <p className=" uppercase text-center">Expense</p>
          <div className="flex flex-col last:mb-0 ">
            {transactionExpense.map((item: any) => (
              <div className="mt-2">
                <div key={item._id} className="flex justify-between">
                  <span className="w-[70%] text-ellipsis  overflow-hidden whitespace-nowrap">
                    {item.category.name}
                  </span>
                  <span className=" whitespace-nowrap text-sm">
                    {formatAmount(item.amount)}
                  </span>
                </div>
                <div className="">
                  {data && data.data && data?.data.filter((b: any) => b.budget.$numberDecimal !== "0.0" && b.month !== null && b.year !== null && b.category === item.category.name).map((k: any) => (
                    <CustomProgressBar
                      spent={k.spent}
                      remaining={k.remaining}
                      amount={k.budget}

                    />
                  ))}
                </div>
              </div>
            ))}

          </div>

        </div>
      </Card>
    </div>
  )
}