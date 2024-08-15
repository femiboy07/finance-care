import React from "react";
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { formatDate } from "date-fns";
import { CheckCircleIcon } from "lucide-react";
import MyInput from "../common/MyInput";
import MyInputMutation from "../common/MyInputMutaion";
import { Checkbox } from "../../@/components/ui/checkbox";





export type Transaction={
    _id:string;
    category:string;
    amount:any;
    date:Date;
    description:string;
    type:string;
    status:string;

}

export const transactionColumns:ColumnDef<Transaction>[]=[

  {
    id: "select",
    header: ({ table }) => (
      <div className="text-center flex w-full justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className=" bg-center inline-block"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
      <Checkbox
        checked={row.getIsSelected()}
        className=""
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size:30,
    
  },

  {  
    accessorKey:"type",
    id:"type",
    header(props) {
        return <div className="hidden">{"type"}</div>
    },
    cell(props) {
        return <span className="hidden  fixed"></span>
    },
  },


  {
    accessorKey:"date",
    header:"Date",
    cell:({row,cell})=>{
       const date=row.original.date;
       const formatFullDate=formatDate(date,"P");
       
       return (
       
        <span className="  text-left  h-full ">{formatFullDate.replaceAll('/',".")}
        </span>

       )
    },
    size:60
    
  },
  {
    accessorKey:"description",
    header:(props)=>{
      // props.header.colSpan=0;
      return <span className="text-left">{"Description"}</span>
    },
    cell({cell,row}) {
        return (
        // <span className="  font-bold hover:border-orange-400  px-3">{row.original.description}</span>
        
        <MyInputMutation type="string"   name="description"  value={row.original.description} placeholder={row.original.description} id={row.original._id} defaultValue={row.original.description} className={`text-black   border-none  h-9 w-full  rounded-md   hover:border-orange-400 outline-none  px-3 font-semibold`}  /> 
        )
    },
    size:264
  },
  
  {
    accessorKey:"category",
    header:(props)=>{
      return <span className="" >{"Category"}</span>
    },
    cell(props) {
        return (
        
            <MyInputMutation  name="category"  value={props.row.original.category} placeholder={props.row.original.category} id={props.row.original._id} defaultValue={props.row.original.category} className={`text-black ring-0  blur-none focus-within:ring-0  h-full w-full  border  bg-none   hover:border-orange-400 outline-none      font-semibold`}  /> 
           )
    },
    size:100
  },



 {
    accessorKey:"amount",
    header:"Amount",
    cell({row,cell}) {
    const amount:any = row.original.amount.$numberDecimal;
    // const me=cell.getValue('amount');
    const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
        return (
       <MyInputMutation type="text"  name="amount"  value={formatted} placeholder="0.00" id={row.original._id} defaultValue={row.original.amount.$numberDecimal} className={`text-black ${row.original.type === "income" ? "text-green-500" : " text-red-600"} h-9 border w-full  focus:border-orange-400 text-right  hover:border-orange-400 rounded-none  outline-orange-400     font-semibold`}  />
        
        )
      },
  size:50
  },

  

  {  
    accessorKey:"status",
    id:"status",
    header(props) {
        return <div className="hidden">{"type"}</div>
    },
    cell({row,cell}) {
       const currentStatus=row.original.status;
        return <span className={` w-full flex  justify-center  text-center ${currentStatus === 'cleared' ? ' text-green':''} `}>
          {currentStatus === 'cleared' ? <CheckCircleIcon color="green" enableBackground={"green"} width={14}  fontSize={14}/> :<CheckCircleIcon  width={14}  fontSize={14}/> }
        </span>
    },
    size:10
  },

  {
    id:'actions',
    size:10
   
    
  },

];


export interface DataTableProps<TData,Tvalue>{
    columns:ColumnDef<TData,Tvalue>[];
    data:TData[];
    isPending:boolean,
    listData:any
}


export function TransactionTable<TData,TValue>({columns,data,isPending,listData}:DataTableProps<TData,TValue>){

    
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
      // <div className="overflow-x-auto">
      <Table className="   border-black text-left   overflow-x-auto    table-fixed min-w-full border-separate border-spacing-0">
        <TableHeader className="sticky">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className=" ">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} style={{width:header.getSize()}} className="leading-[15px] bg-background  border  align-middle px-[13px]  text-ellipsis h-[40px]  pt-[10px] pb-[8px] text-[#aeaeae]">
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
        <TableBody className=" w-full border-black ">
       {isPending  ? (<div className="flex justify-center  text-black bg-red-600 w-full h-full">Loading...</div>):(
      <>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              
              <TableRow
                 key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="py-5   "
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className=" h-[36px]  border  px-0 py-0      ">
                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                 
                ))}
              </TableRow>
            
            ))
            
          ) : (
            <TableRow className="border-l-2 py-2 border-separate ">
              
              <TableCell colSpan={columns.length} className=" text-center first-of-type:border-spacing-y-72 last-of-type:border-r-2 last-of-type:rounded-r-md  first-of-type:border-l-4 h-64 py-1 first-of-type:mt-2 first-of-type:border-l-orange-700 first-of-type:rounded-l-lg border-t  border-b  first-line:border-l-black ">
               <div className="w-full flex justify-center flex-col items-center">
               
                <span>You have no transaction matching this filter</span>
               </div>
              </TableCell>
            </TableRow>
          )}
          </>)}
        </TableBody>
      </Table>
      // </div>
   
  )
}
