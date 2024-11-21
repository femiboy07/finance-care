import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { getAccounts } from "../../api/apiRequest";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Card } from "../../@/components/ui/card";
import { accountColumns, AccountTable } from "../../components/Account/accountsTable";
import AddAccounts from "../../components/Account/AddAccount";
import { MoreHorizontal, MoveLeftIcon } from "lucide-react";
import { useInnerWidthState } from "../../hooks/useInnerWidthState";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";
import EditAccounts from "../../components/Account/EditAccount";
import ReviewAccounts from "../../components/Account/ReviewAccounts";
import AccountButton from "../../components/Account/AccountButton";






export default function AccountPage() {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
  const { hideOver, setHideOver } = useOutletContext<ContextType>()
  const [isAddAccounts, setIsAddAccounts] = useState(false);
  const [width] = useInnerWidthState();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const { accounts, isReady } = useUser()
  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["allaccounts"],
    queryFn: getAccounts,
    // staleTime: 24 * 60 * 60 * 1000,
    gcTime: 0,

  })


  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedAccount(null); // Clear selected transaction
  };

  const handleOpenSideBar = () => {
    setIsAddAccounts(true);
  }

  const filteredAccounts = data && data.allAccounts.filter(
    (account: any) => !(account.name === "Cash Transaction" && account.type === "def_coin")
  );

  useEffect(() => {
    if (isAddAccounts || isSidebarOpen) {
      document.body.style.overflowY = 'hidden';

    } else {
      document.body.style.overflowY = 'auto'
    }

    return () => {
      document.body.style.overflowY = 'auto'
    }
  }, [isAddAccounts, isSidebarOpen])


  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setIsSidebarOpen(true); // Open the sidebar
  };
  const columns = accountColumns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-full flex justify-center items-center">
              <Button variant="ghost" className="h-8 w-8 mx-auto p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="z-10">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(row.original.category)}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditAccount(row.original)}>
                Edit Accounts
              </DropdownMenuItem>
              <DropdownMenuItem>View Popups</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      };
    }
    return col;
  });


  function handleHideOver() {
    setHideOver((prev: boolean) => !prev);
  }
  return (
    <div className="w-full  h-full px-2 md:px-4 xl:px-9 font-custom2 mt-20 mb-10">
      <h1 className="text-foreground text-4xl">Accounts</h1>
      <div className="mt-10 ">
        <div className="flex w-full justify-between">
          <div className="ml-auto flex items-center gap-2" >
            <AccountButton handleOpenSideBar={handleOpenSideBar} />
            <Button className={buttonVariants({ variant: "default", className: ` px-4 bg-orange-400   md:flex ` })} onClick={handleHideOver}>
              <MoveLeftIcon className=" w-4 h-4" />
            </Button>
          </div>
        </div>
        <>

          <div className=" flex  mt-[18px]  lg:pb-[1em] z-0 transition transform">
            {isLoading || isPending ? <AccountTable columns={columns} data={[]} isPending={isLoading || isPending} handleOpenSideBar={handleOpenSideBar} /> :
              <>
                {data && <Card className=" mt-5   overflow-x-auto  overflow-y-hidden h-fit   z-0   bg-white dark:bg-background bg-opacity-30 rounded-md">
                  <AccountTable columns={columns} data={filteredAccounts} isPending={isLoading} handleOpenSideBar={handleOpenSideBar} />
                </Card>

                }
              </>}
            <div style={{ minWidth: `calc(260px + 1rem)` }} className={`${hideOver ? `flex` : `hidden`}  flex flex-grow flex-1 flex-col items-end pl-[1rem]`}>
              <div className="w-full bg-red-300 h-0"></div>
              <div id="sticky ">
                {<ReviewAccounts accounts={data?.allAccounts} />}
              </div>
            </div>
          </div>
          {isAddAccounts &&

            <div className="fixed   top-0  z-[48] lg:w-96 right-0 scrollbar-hide  w-full h-full flex scroll-m-0 overflow-y-auto justify-end ">
              <AddAccounts isAddAccounts={isAddAccounts} setIsAddAccounts={setIsAddAccounts} />
            </div>
          }
          {isSidebarOpen && (
            <Card className="fixed right-0  top-0 bottom-0 z-[48] lg:w-96 w-full px-5 h-full scrollbar-hide overflow-hidden scroll-m-0 overflow-y-auto">
              <EditAccounts account={selectedAccount} closeSideBar={closeSidebar} />
            </Card>
          )}

        </>


      </div>
    </div>
  )
}