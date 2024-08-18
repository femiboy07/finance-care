import React, { useCallback, useEffect } from "react";
import {ColumnDef, flexRender, getCoreRowModel, RowSelectionState, useReactTable} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { formatDate } from "date-fns";
import { CheckCircleIcon } from "lucide-react";
import MyInput from "../common/MyInput";
import MyInputMutation from "../common/MyInputMutaion";
import { Checkbox } from "../../@/components/ui/checkbox";
import { useSelectedFilter } from "../../context/TableFilterContext";





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
        className=" bg-center inline-block "
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
      </div>
    ),
    cell: ({ row }) => (
      <div className={`text-center `}>
      <Checkbox
        checked={row.getIsSelected()}
        data-state={row.getIsSelected()}
        className={`${row.getIsSelected() ? ' checked:text-orange-200 text-black':''}`}
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
        //  <MyInputMutation name="date" type="text" placeholder={"Type ur date"} id={row.original._id} value={formatFullDate.replaceAll('/',".")} defaultValue={formatFullDate.replaceAll('/',".")} className={`text-black bg-transparent   rounded-md   hover:border-orange-400   font-semibold`} />
        <span className=" px-[13px]  h-[36px] flex items-center w-full whitespace-wrap overflow-hidden text-ellipsis ">{formatFullDate.replaceAll('/',".")}
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
        
        <MyInputMutation type="text"   name="description"  value={row.original.description} placeholder={row.original.description} id={row.original._id} defaultValue={row.original.description} className={`text-black bg-transparent     rounded-md   hover:border-orange-400   font-semibold`}  /> 
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
       <MyInputMutation type="text"  name="amount"  value={formatted} placeholder="0.00" id={row.original._id} defaultValue={row.original.amount.$numberDecimal} className={`text-black ${row.original.type === "income" ? "text-green-500" : " text-red-600"} border-0   bg-transparent  focus:border-orange-400 text-right  hover:border-orange-400 rounded-none        font-semibold`}  />
        
        )
      },
  size:80
  },

  {
    
   
    // id:"status",
   

    size:40,
    id:'actions',
    
   
    
  },

];


export interface DataTableProps<TData,Tvalue>{
    columns:ColumnDef<TData,Tvalue>[];
    data:TData[];
    isPending:boolean,
    listData:any
}


export function TransactionTable<TData,TValue>({columns,data,isPending,listData}:DataTableProps<TData,TValue>){
 
  const {rowSelection,setRowSelection,setSelectedTotal}=useSelectedFilter()
    
   const table=useReactTable({
    data:data,
    columns:columns,
    onRowSelectionChange:setRowSelection,
    getRowId:(row:any)=>row._id,
    initialState:{
        columnVisibility:{
           type:false
       }
    },
    state:{
      rowSelection,
      
    },
    getCoreRowModel:getCoreRowModel(),
   })

   console.log(rowSelection)

   const totalAmountForSelectedRow=useCallback(()=>{
      const filterSelectedCells=table.getRowModel().rows.filter((item)=>item.getIsSelected());
      const totalamount=filterSelectedCells.reduce((acc:number,currentValue:any)=>{
        return acc + parseFloat(currentValue.original.amount.$numberDecimal)
      },0);
      setSelectedTotal(totalamount)
      console.log(totalamount);
   },[table,setSelectedTotal])
  useEffect(()=>{
    if(rowSelection){
    totalAmountForSelectedRow()
    }
  },[totalAmountForSelectedRow,rowSelection])
   
  

    return (
     
      <Table id="table-lead" className="   border-black text-left   overflow-y-hidden h-fit w-full   table-fixed  border-spacing-0">
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
        <TableBody className="border-black overflow-y-hidden ">
      
      <>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              
              <TableRow
                 key={row.id}
                data-state={row.getIsSelected()}
               className={`py-5  ${row.getIsSelected() ? 'bg-orange-100':''} `}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className=" h-[36px]  border  px-0 py-0      ">
                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                 
                ))}
              </TableRow>

            ))
            
          ) : (
            <TableRow   className="h-20 w-full ">
                <TableCell colSpan={table.getHeaderGroups()[0]?.headers?.length || 1}  className="w-full">
               <div className="w-full flex justify-center items-center text-center ">
               <span className="w-full">You have no transaction matching this filter</span>
               </div>
               </TableCell>
            
            </TableRow>
          )}
          </>
        </TableBody>
      </Table>
      // </div>
   
  )
}
