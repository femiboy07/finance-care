import React from "react";
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { formatDate } from "date-fns";
import { CheckCircleIcon } from "lucide-react";





export type Budgets={
    _id:string;
    category:string;
    spent:any;
    remaining:any;
    amount:any;
    period:string;
    createdAt:Date;

}

export const BudgetColumns:ColumnDef<Budgets>[]=[
 


  {
    accessorKey:"createdAt",
    header:({header:{colSpan}})=>{
      return <div className="uppercase" >{"Date"}</div>
    },
    cell:({row,cell})=>{
       const date=row.original.createdAt;
       const formatFullDate=formatDate(date,"P");
       
       return (
       
        <span className=" w-0 text-left">{formatFullDate.replaceAll('/',".")}
        </span>

       )
    },
    
  },
 
  
  {
    accessorKey:"category",
    header:(props)=>{
      return <div className=" max-w-32 uppercase">{"Category"}</div>
    },
    cell(props) {
        return (
        <>
        <div className="flex gap-2">
            <span className=" self-center">{props.row.original.category}</span>
        </div>
        </>
                         
        )
    },
  },

  {
    accessorKey:"spent",
    header:(props)=>{
      return <div className=" max-w-32 uppercase">{"SPENT"}</div>
    },
    cell({row,cell}) {
        const amount:any = row.original.spent.$numberDecimal;
        const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount)
        return (
        <>
        <div className="flex gap-2">
            <span className=" self-center text-orange-300 font-semibold">{formatted}</span>
        </div>
        </>
                         
        )
    },
  },



 {
    accessorKey:"amount",
    header:"AMOUNT",
    cell({row,cell}) {
    const amount:any = row.original.amount.$numberDecimal;
    const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
        return <span className={`text-black  font-extrabold`}>{`${formatted}`}</span>
    },
  },

  {
    accessorKey:"remaining",
    header:(props)=>{
      return <div className=" max-w-32 uppercase">{"REMAINING"}</div>
    },
    cell({row,cell}) {
        const amount:any = row.original.remaining.$numberDecimal;
        const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount)
        return (
        <>
        <div className="flex gap-2">
            <span className=" self-center text-red-600 font-semibold">{formatted}</span>
        </div>
        </>
                         
        )
    },
  },

  {
    id:'actions',
   
    
  },

//   {  
//     accessorKey:"status",
//     id:"status",
//     header(props) {
//         return <div className="hidden">{"type"}</div>
//     },
//     cell({row,cell}) {
//        const currentStatus=row.original.status;
//         return <span className={`w-6  ${currentStatus === 'cleared' ? ' text-green':''} `}>
//           {currentStatus === 'cleared' ? <CheckCircleIcon color="green" enableBackground={"green"} width={14}  fontSize={14}/> :<CheckCircleIcon  width={14}  fontSize={14}/> }
//         </span>
//     },
//   },

];


export interface DataTableProps<TData,Tvalue>{
    columns:ColumnDef<TData,Tvalue>[];
    data:TData[];
    isPending:boolean,
    listData:any
}


export function BudgetTable<TData,TValue>({columns,data,isPending,listData}:DataTableProps<TData,TValue>){

    
   const table=useReactTable({
    data:data,
    columns:columns,
    initialState:{
       columnVisibility:{
           type:false
       }
    },
    getCoreRowModel:getCoreRowModel(),
   })

    return (
      <div className=" px-5 py-4 mt-5 bg-white rounded-md">
      <Table className="  border-separate [&_tc]:border-collapse md:table-auto table-fixed   border-0 border-spacing-y-2  ">
        <TableHeader className=" ">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="[&_tr:first-child]:border-collapse">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="border border-black">
       {isPending  ? (<div className="flex justify-center  text-black bg-red-600 w-full h-full">Loading...</div>):(
      <>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              
              <TableRow
                 key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-l-2 py-4 border-separat  "
              >
                {/* <td className="border fixed left-0 w-0 h-0"></td> */}
                {row.getVisibleCells().map((cell) => (
                  <>
                  
                  <TableCell key={cell.id} className="  first-of-type:border-spacing-y-72 last-of-type:border-r-2   last-of-type:rounded-r-md  first-of-type:border-l-4 h-4 py-1 first-of-type:mt-2 first-of-type:border-l-orange-700 first-of-type:rounded-l-lg border-t  border-b  first-line:border-l-black ">
                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                 </>
                ))}
              </TableRow>
            
            ))
            
          ) : (
            <TableRow className="border-l-2 py-2 border-separate ">
              
              <TableCell colSpan={columns.length} className=" text-centerfirst-of-type:border-spacing-y-72 last-of-type:border-r-2 last-of-type:rounded-r-md  first-of-type:border-l-4 h-64 py-1 first-of-type:mt-2 first-of-type:border-l-orange-700 first-of-type:rounded-l-lg border-t  border-b  first-line:border-l-black ">
               <div className="w-full flex justify-center flex-col items-center">
               
                <span>You have no transaction matching this filter</span>
               </div>
              </TableCell>
            </TableRow>
          )}
          </>)}
        </TableBody>
      </Table>
    </div>
  )
}
