import React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import SetBudget from "./SetBudget";
import { LoaderCircleIcon } from "lucide-react";





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
      return <div className="text-left uppercase min-w-64  w-64 ">{"Category"}</div>
    },
    cell(props) {
      return (
        <span className="self-center px-[13px]  text-ellipsis flex-shrink-0  flex-1  w-full h-full items-center flex-nowrap leading-tight m-0 overflow-hidden text-nowrap ">{props.row.original.category}</span>
      )
    },
    size: 800,
    maxSize: 800,
    minSize: 800,

  },

  {
    accessorKey: "spent",
    header: (props) => {
      return <div className=" uppercase min-w-11" >{"SPENT"}</div>
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
        <span className=" self-center px-[13px] text-orange-300 font-semibold border-none flex-shrink-0 w-full h-[36px] flex items-center  whitespace-pre-wrap max-w-full overflow-hidden text-ellipsis ">{formatted}</span>
      )
    },

  },



  {
    accessorKey: "budget",
    header: () => {
      return <div className="uppercase max-w-11">BUDGET</div>
    },
    cell({ row, cell }) {
      let amount: any = row.original.budget.$numberDecimal;
      let remaining: any = row.original.remaining.$numberDecimal;
      let category: any = row.original.category;
      let spent: any = row.original.spent;
      let formatted;
      if (amount !== "0.0") {
        formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount)
      }

      return <SetBudget value={amount !== '0.0' ? formatted : ''}
        id={row.original._id}
        defaultValue={amount}
        type={"text"}
        category={category}
        remaining={remaining}
        spent={spent}
        name={"budget"}
        className={`text-black bg-transparent text-ellipsis  w-full rounded-md  overflow-hidden   hover:border-orange-400  font-semibold`} placeholder={"set Budget"} />
    },
    size: 150,
    maxSize: 150,

  },

  {
    accessorKey: "remaining",
    header: () => {
      return <div className="min-w-11 max-w-64">REMAINING</div>
    },
    cell({ row, cell }) {
      let amount: any = row.original.remaining.$numberDecimal;
      let formatted;
      if (amount !== '0.0') {
        formatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount)
      }
      return (

        <span className=" self-center px-[13px]  text-red-600 flex-shrink-0 font-semibold w-full  border-none py-0  h-[36px] flex items-center    overflow-hidden text-ellipsis">{formatted}</span>


      )
    },
    size: 40,
    // maxSize: 150,
    // minSize: 150


  },

  {
    id: 'actions',
    size: 50,



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
  const doubleRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  return (

    <Table className="border-black  dark:border-0 dark:text-[#d2d2d2] table-auto md:table-fixed  overflow-x-auto border-spacing-0 w-full  overflow-y-hidden ">
      <TableHeader className=" ">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="[&_tr:first-child]:border-collapse">
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className="leading-[15px] bg-background   border  align-middle px-[13px]  text-ellipsis h-[40px]  pt-[10px] pb-[8px] text-[#aeaeae]">
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
      <TableBody className=" border-black relative ">
        <>
          {isPending &&
            <div className="max-w-md w-full flex absolute text-black dark:text-foreground left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex-col space-y-2 justify-center items-center text-center ">
              <span>Fetching budgets..</span>
              <LoaderCircleIcon className="animate-spin" />
            </div>
          }
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (

              <TableRow
                key={row.id}
                data-state={row.getIsSelected()}
                className={`py-5 ${row.getIsSelected() ? 'bg-orange-100' : ''} `}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className=" h-[36px]  border  px-0 py-0      ">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>

                ))}

              </TableRow>


            ))

          ) :

            (

              <>
                {doubleRows.map((item, index) => (


                  <TableRow key={index} className={` w-full border bg-white dark:bg-card ${isPending ? ' ' : ''}   `} >
                    <TableCell colSpan={table.getHeaderGroups()[0]?.headers?.length || 1} className={`w-full border ${isPending ? 'py-3' : 'py-5'}  `}>

                    </TableCell>

                  </TableRow>
                ))
                }
              </>
            )}

        </>
      </TableBody>
    </Table>

  )
}
