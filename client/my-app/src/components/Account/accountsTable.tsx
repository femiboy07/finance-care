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
        header:"DISPLAY NAME"
    },
    {
        accessorKey:"type",
        header:"Type"
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
            return <span className="w-full">{`${formatted}`}</span>
        },
    },
   
      {
        id:'actions',
        cell: ({ row }) => {
          const payment = row.original
     
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
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
     <div className="rounded-md ">
      <Table className=" table-fixed border-separate overflow-x-auto border-spacing-y-2">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className=" border "
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className=" first-of-type:border-l last-of-type:after:border-black  border-t border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
    
}

