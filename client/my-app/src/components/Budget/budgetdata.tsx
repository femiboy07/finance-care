import React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { formatDate } from "date-fns";
import { CheckCircleIcon } from "lucide-react";





interface Budgets {
  _id: string;
  category: string
  budget: any | null;
  spent: any;
  remaining: any;
}

export const BudgetColumns: ColumnDef<Budgets>[] = [


  {
    accessorKey: "category",
    header: (props) => {
      return <div className="text-left ">{"Category"}</div>
    },
    cell(props) {
      return (
        <span className=" self-center px-[13px]">{props.row.original.category}</span>
      )
    },
  },

  {
    accessorKey: "spent",
    header: (props) => {
      return <div className=" max-w-32 uppercase">{"SPENT"}</div>
    },
    cell({ row, cell }) {
      let amount: any = row.original.spent.$numberDecimal;
      let formatted;
      if (amount !== '0.0') {
        formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount)
      } else {
        formatted = ''
      }
      return (
        <span className=" self-center px-[13px] text-orange-300 font-semibold border-none  w-full h-[36px] flex items-center  whitespace-pre-wrap max-w-full overflow-hidden text-ellipsis ">{formatted}</span>
      )
    },
  },



  {
    accessorKey: "budget",
    header: "BUDGET",
    cell({ row, cell }) {
      let amount: any = row.original.budget.$numberDecimal;
      let formatted;
      if (amount !== '0.0') {
        formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount)
      } else {
        formatted = 'set budget'
      }
      return <span className={`text-black px-[13px] text-ellipsis  font-extrabold py-0  border-0 m-0 max-w-full w-full flex flex-wrap overflow-x-auto outline-none text-left leading-tight shadow-none`}>{`${formatted}`}</span>
    },
  },

  {
    accessorKey: "remaining",
    header: (props) => {
      return <div className=" uppercase max-w-32 ">{"REMAINING"}</div>
    },
    cell({ row, cell }) {
      let amount: any = row.original.remaining.$numberDecimal;
      let formatted;
      if (amount !== '0.0') {
        formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount)
      } else {
        formatted = ''
      }
      return (

        <span className=" self-center px-[13px] text-red-600 font-semibold border-none py-0 w-full max-w-full h-[36px] flex items-center    overflow-hidden text-ellipsis">{formatted}</span>


      )
    },

  },

  {
    id: 'actions',


  },



];


export interface DataTableProps<TData, Tvalue> {
  columns: ColumnDef<TData, Tvalue>[];
  data: TData[];
  isPending: boolean,

}


export function BudgetTable<TData, TValue>({ columns, data, isPending }: DataTableProps<TData, TValue>) {

  console.log(data, "table")
  const table = useReactTable({
    data: data,
    columns: columns,
    initialState: {
      columnVisibility: {
        type: false
      }
    },
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className=" px-5 py-4 mt-5 bg-white rounded-md overflow-x-auto">
      <Table className="border-black  overflow-y-hidden h-fit w-full table-auto overflow-x-auto border-spacing-0">
        <TableHeader className=" ">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="[&_tr:first-child]:border-collapse">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="leading-[15px] bg-background  border  align-middle px-[13px]  text-ellipsis h-[40px]  pt-[10px] pb-[8px] text-[#aeaeae]">
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
        <TableBody className=" border-black">
          {isPending ? (<div className="flex justify-center  text-black bg-red-600 w-full h-full">Loading...</div>) : (
            <>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (

                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="py-5"
                  >
                    {/* <td className="border fixed left-0 w-0 h-0"></td> */}
                    {row.getVisibleCells().map((cell) => (
                      <>

                        <TableCell key={cell.id} className="h-[36px] border  px-0 py-0  ">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      </>
                    ))}
                  </TableRow>

                ))

              ) : (
                <TableRow className=" ">

                  <TableCell colSpan={columns.length} className=" ">
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
