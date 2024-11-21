import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, RowSelectionState, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { formatDate } from "date-fns";
import { ArrowUpDown, CheckCircleIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import MyInput from "../common/MyInput";
import MyInputMutation from "../common/MyInputMutaion";
import { Checkbox } from "../../@/components/ui/checkbox";
import { useSelectedFilter } from "../../context/TableFilterContext";
import { tab } from "@testing-library/user-event/dist/tab";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../@/components/ui/button";
import lunchImage from '../../assets/lunch image.png';
import AddTransaction from "./AddTransaction";
import TransactionButton from "./TransactionButton";
import { Input } from "../../@/components/ui/input";





export type Transaction = {
  _id: string;
  name: string;
  category: {
    name: string,
    type: string,
    _id: string,
  };
  amount: any;
  accountId: any
  date: Date;
  description: string;
  type: string;
  status: string;

}

export const transactionColumns: ColumnDef<Transaction>[] = [

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
          className={`${row.getIsSelected() ? ' checked:text-orange-200 checked:dark:border-slate-300 checked:dark:text-black checked:dark:bg-orange-400  bg-orange-400' : ''}`}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 30


  },



  {
    accessorKey: "type",
    id: "type",
    header(props) {
      return <div className="hidden">{"type"}</div>
    },
    cell(props) {
      return <span className="hidden  fixed"></span>
    },
  },



  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell({ cell, row }) {
      return (
        // <span className="  font-bold hover:border-orange-400  px-3">{row.original.description}</span>

        <MyInputMutation type="text" name="description" value={row.original.description} placeholder={row.original.description} id={row.original._id} defaultValue={row.original.description} className={`text-black bg-transparent  w-full flex-wrap    rounded-md   hover:border-orange-400   font-semibold`} />
      )
    },
    size: 400


  },

  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell(props) {
      return (

        <MyInputMutation name="category" value={props.row.original.category?.name} placeholder={props.row.original.category?.name} id={props.row.original._id} defaultValue={props.row.original.category?.name} className={`text-black ring-0  blur-none focus-within:ring-0  h-full w-full  border  bg-none   hover:border-orange-400 outline-none font-semibold`} />
      )
    },
    size: 200
  },

  {
    accessorKey: 'name',
    header: () => {
      return <div className="">Account</div>
    },
    cell: ({ row, cell }) => {
      return (
        <div className="hover:border-orange-400 hover:border  h-full w-full">
          <div className="relative w-full h-full  flex-nowrap  ">
            <input type="text" name="account" value={row.original.accountId.name} className="  text-wrap absolute inline-flex m-0 inset-0 ring-0 px-[13px]    blur-none bg-transparent outline-0 focus-within:ring-0    h-full w-full   hover:text-nowrap  hover:outline    outline-none  font-semibold" readOnly />
          </div>
        </div>
      )
    }
  },



  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell({ row, cell }) {
      const amount: any = row.original.amount.$numberDecimal;
      // const me=cell.getValue('amount');
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount)
      return (
        <MyInputMutation type="text" name="amount" value={formatted} placeholder="0.00" id={row.original._id} defaultValue={amount} className={`text-black ${row.original.type === "income" ? "text-green-500" : " text-red-600"} border-0   bg-transparent  focus:border-orange-400 text-right  hover:border-orange-400 rounded-none        font-semibold`} />

      )
    },


  },

  {
    size: 40,
    id: 'actions',
  },



];


export interface DataTableProps<TData, Tvalue> {
  columns: ColumnDef<TData, Tvalue>[];
  data: TData[];
  isPending: boolean,
  listData: any,
  clearFilter: () => void,
  handleOpenSideBar: () => void,
  hideOver: boolean
}


export function TransactionTable<TData, TValue>({ columns, data, isPending, listData, clearFilter, handleOpenSideBar, hideOver }: DataTableProps<TData, TValue>) {

  const { rowSelection, setRowSelection, setSelectedTotal, selectedTotal } = useSelectedFilter();
  const navigate = useNavigate();
  const location = useLocation()
  const [searchParam, setSearchParam] = useSearchParams();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  console.log(data)
  const table = useReactTable({
    data: data,
    columns: columns,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getRowId: (row: any) => `${row._id}-${row.amount.$numberDecimal}`,
    initialState: {
      columnVisibility: {
        type: false
      }
    },
    state: {
      rowSelection,
      sorting: sorting
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortingFns: { //add a custom sorting function
      myCustomSortingFn: (rowA, rowB, columnId) => {
        return rowA.original[columnId] > rowB.original[columnId] ? 1 : rowA.original[columnId] < rowB.original[columnId] ? -1 : 0
      },
    }
  });


  const totalAmountForSelectedRows = useCallback(() => {
    let totalAmount = 0// Start fresh on each calculation



    // Iterate over selected rows to sum up their amounts
    Object.keys(rowSelection).forEach((rowId) => {
      const row: any = data.find((item: any) => item._id === rowId);
      // if (row && rowSelection[rowId]) {
      const [id, amount] = rowId.split('-');
      console.log(rowId.slice(24, rowId.length), 'rrrrr')
      totalAmount += parseFloat(amount);

    });

    // Store in ref to persist across renders
    setSelectedTotal(totalAmount); // Update state as well
  }, [rowSelection, setSelectedTotal, data]);

  useEffect(() => {
    if (rowSelection) {
      totalAmountForSelectedRows();
    } // Recalculate whenever rowSelection changes
  }, [rowSelection, totalAmountForSelectedRows]);



  useEffect(() => {
    if (sorting.length > 0) {
      const name = sorting[0]?.id;
      const direction = sorting[0]?.desc ? 'descending' : 'ascending';

      // Get and update URL parameters
      const params = new URLSearchParams(searchParam);
      params.set('direction', direction);
      params.set('sort', name);
      const queryParams = params.toString();
      const targetPath = location.pathname;
      navigate(`${targetPath}?${queryParams}`);

    }
  }, [location.pathname, navigate, searchParam, sorting]);

  const doubleRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]






  return (

    <Table id="table-lead" className={`  dark:border-0 dark:border-l-0 border-0 bg-card    dark:bg-[#303030]  dark:border-[#303030] text-left overflow-y-hidden table-fixed  w-full  border-spacing-0`}>
      <TableHeader className="">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="bg-white ">
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} style={{ width: header.getSize() }} className="leading-[15px] bg-background border align-middle px-[13px] text-ellipsis h-[40px]  pt-[10px] pb-[8px] text-[#aeaeae]">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className=" overflow-y-hidden  w-full max-w-full ">
        {searchParam.size > 1 &&
          <TableRow>
            <TableCell colSpan={table.getHeaderGroups()[0]?.headers.length || 1} className="text-center border h-6">
              <button
                onClick={clearFilter}
                className="w-full bg-transparent  flex items-center justify-center text-teal-600 font-semibold py-1 rounded-md"
              >
                <XIcon />
                Clear Filters and show all transactions
              </button>
            </TableCell>
          </TableRow>}
        <>
          {isPending &&
            <div className="max-w-md w-full flex absolute text-black dark:text-foreground left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex-col space-y-2 justify-center items-center text-center ">
              <span>Fetching transactions..</span>
              <LoaderCircleIcon className=" animate-spin" />
            </div>
          }
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (

              <TableRow
                key={row.id}
                data-state={row.getIsSelected()}
                className={`py-5 ${row.getIsSelected() ? 'bg-orange-100 dark:bg-slate-800 border-0 dark:bg-opacity-80' : ''} w-full  `}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className=" h-[36px] border   px-0 py-0      ">
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
        {table.getRowModel().rows.length === 0 && searchParam.size > 1 && !isPending && <div className="w-full max-w-full absolute top-1/2  -translate-y-1/2  flex flex-col space-y-2 justify-center items-center text-center ">
          <img src={lunchImage} alt="lunch" className=" w-16 h-16" />
          <span className="w-full">No data related to your query</span>

        </div>}
        {table.getRowModel().rows.length === 0 && !isPending && < div className="w-full left-0 right-0 max-w-full absolute top-1/2  -translate-y-1/2  flex flex-col space-y-2 justify-center items-center text-center ">
          <img src={lunchImage} alt="lunch" className=" w-16 h-16" />
          <span className="w-full">You have no transaction yet</span>
          <span>ways to add a transactions</span>
          <TransactionButton handleOpenSideBar={handleOpenSideBar} />
        </div>}

      </TableBody>
    </Table >
    // </div>

  )
}
function useEffectLayout(arg0: () => void, arg1: (string | import("react-router-dom").NavigateFunction | URLSearchParams | import("react-router-dom").SetURLSearchParams | import("@tanstack/react-table").Table<any>)[]) {
  throw new Error("Function not implemented.");
}

