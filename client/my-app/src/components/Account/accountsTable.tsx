import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../@/components/ui/table";
import { ColumnDef, getCoreRowModel, useReactTable, flexRender } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";
import { Button } from "../../@/components/ui/button";
import { LoaderCircleIcon, MoreHorizontal } from "lucide-react";
import { Checkbox } from "../../@/components/ui/checkbox";
import { useSelectedFilter } from "../../context/TableFilterContext";
import lunchImage from '../../assets/lunch image.png'
import AccountButton from "./AccountButton";


type Accounts = {
  _id: string
  name: string;
  type: string;
  balance: any;
  isSystemAccount: boolean;
}




const accounts: Accounts[] = [];

export const accountColumns: ColumnDef<Accounts>[] = [

  {
    accessorKey: "name",
    header: () => {
      return <div className=" w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis ">AccountName</div>
    },
    cell({ row, cell }) {

      return <div className={` px-[13px] w-full h-[36px]  flex items-center whitespace-nowrap overflow-hidden text-ellipsis`}>{row.original.name}</div>
    }
  },
  {
    accessorKey: "type",
    header: "Type",
    cell({ row, cell }) {
      const getRandomHexColor = () => {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      }
      const color = getRandomHexColor();
      return <div className={`px-[13px] w-full h-[36px] text-orange-700   uppercase font-extrabold flex items-center whitespace-nowrap overflow-hidden text-ellipsis`}>{row.original.type}</div>
    },
  },

  // {
  //   accessorKey: "isSystemAccount",
  //   header: () => {
  //     return <div className="hidden"></div>
  //   },
  //   cell({ row, cell }) {
  //     return <div className="px-[13px] w-full h-[36px] hidden  items-center whitespace-nowrap overflow-hidden text-ellipsis">{row.original.type}</div>
  //   },
  //   enableHiding: true
  // },
  {
    accessorKey: "balance",
    header: "Balance",
    cell({ row, cell }) {
      const amount = row.original.balance.$numberDecimal;
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount)
      return <span className="w-full px-[13px]  h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{`${formatted}`}</span>
    },
  },

  {
    id: 'actions',
    size: 20

  }
]

export interface DataTableProps<TData, Tvalue> {
  columns: ColumnDef<TData, Tvalue>[];
  data: TData[];
  isPending: boolean
  handleOpenSideBar: () => void
}




export function AccountTable<TData, TValue>({
  columns,
  data,
  handleOpenSideBar,
  isPending,
}: DataTableProps<TData, TValue>) {
  const { setRowSelection, rowSelection } = useSelectedFilter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

  });

  // Filter out rows where name is "Cash Transaction" or type is "def_coin"

  const doubleRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Table
      id="table-lead"
      className="border-black text-left h-fit w-full table-fixed border-spacing-0"
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                style={{ width: header.getSize() }}
                className="leading-[15px] bg-background border align-middle px-[13px] text-ellipsis h-[40px] pt-[10px] pb-[8px] text-[#aeaeae]"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="border-black overflow-y-hidden relative">
        {isPending && (
          <div className="max-w-md w-full flex absolute  dark:text-white z-50 text-black left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex-col space-y-2 justify-center items-center text-center">
            <span>Fetching accounts...</span>
            <LoaderCircleIcon className="animate-spin" />
          </div>
        )}
        <>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected()}
                className={`py-5 ${row.getIsSelected() ? "bg-orange-100" : ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-[36px] border px-0 py-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <>
              {table.getRowModel().rows.length === 0 &&
                doubleRows.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`w-full border bg-white dark:bg-card ${isPending ? "animate-pulse" : ""}`}
                  >
                    <TableCell
                      colSpan={table.getHeaderGroups()[0]?.headers?.length || 9}
                      className={`w-full border ${isPending ? "py-3" : "py-5"}`}
                    ></TableCell>
                  </TableRow>
                ))}
            </>
          )}
        </>
        {table.getRowModel().rows.length === 0 && !isPending && (
          <div className="max-w-md w-full z-[47888] flex dark:text-foreground dark:font-extrabold absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex-col space-y-2 justify-center items-center text-center">
            <img src={lunchImage} alt="lunch" className="w-16 h-16" />
            <span className="w-full">You have no accounts yet!</span>
            <span>ways to add a transaction</span>
            <span className="note text-red-600">
              Working on Accounts to be synced (linked to your bank account){" "}
              <b>For now it's manually-managed. Transactions that are not assigned to an account are part of a 'Cash' account.</b>
            </span>
            <span className="flex items-center gap-2">
              Get started by clicking<AccountButton handleOpenSideBar={handleOpenSideBar} />
            </span>
          </div>
        )}
      </TableBody>
    </Table>
  );
}
