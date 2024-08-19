import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { ColumnDef, getCoreRowModel, useReactTable,flexRender } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";
import { Button } from "../../@/components/ui/button";
import { MoreHorizontal } from "lucide-react";


type Accounts={
    name:string;
    type:string;
    balance:any;
}




const accounts:Accounts[]=[];

export const columns:ColumnDef<Accounts>[]=[
    {
        accessorKey:"name",
        header:()=>{
          return <div className=" w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis ">AccountName</div>
        },
        cell({row,cell}){
          return <div className="px-[13px] w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{row.original.name}</div>
        },
        size:400
    },
    {
        accessorKey:"type",
        header:"Type",
        cell({row,cell}){
          return <div className="px-[13px] w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{row.original.type}</div>
        },
    },
    {
        accessorKey:"balance",
        header:"Balance",
        cell({row,cell}) {
            const amount = row.original.balance.$numberDecimal;
          const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount)
            return <span className="w-full px-[13px]  h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{`${formatted}`}</span>
        },
    },
   
      {
        id:'actions',
        header(props) {
            return <div className="hidden  w-full text-center "></div>
        },
        cell: ({ row }) => {
          const payment = row.original
     
          return (
            <DropdownMenu >
              <DropdownMenuTrigger asChild className="w-full text-center flex  justify-center">
                <Button variant="ghost" className="h-8 w-full p-0  text-center flex  justify-center">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(payment.type)}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem>Edit Accounts</DropdownMenuItem>
                <DropdownMenuItem>View Accounts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size:32
    }
]

export interface DataTableProps<TData,Tvalue>{
    columns:ColumnDef<TData,Tvalue>[];
    data:TData[];
}





export function AccountTable<TData,TValue>({columns,data}:DataTableProps<TData,TValue>){

   const table=useReactTable({
    data,
    columns,
    getCoreRowModel:getCoreRowModel(),
   })

    return (
      <Table id="table-lead" className=" border-black text-left overflow-y-hidden overlow-x-auto h-fit w-full table-auto  border-spacing-0">
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

