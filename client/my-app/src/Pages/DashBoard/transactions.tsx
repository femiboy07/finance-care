import React, { createRef, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import MonthPicker from "../../components/Transaction/monthPicker";
import SearchTransactions from "../../components/Transaction/searchTransactions";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "../../@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchCategory, fetchTransactions } from "../../api/apiRequest";
import SelectAccount from "../../components/Transaction/selectAccount";
import { TransactionTable, transactionColumns } from "../../components/Transaction/transactionData";
import { Card } from "../../@/components/ui/card";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";
import { CheckCircle2, CheckCircleIcon, MoreHorizontal, MoveLeftIcon } from "lucide-react";
import EditTransaction from "../../components/Transaction/EditTransaction";
import AddTransaction from "../../components/Transaction/AddTransaction";
import CardTransaction from "../../components/Transaction/CardTransaction";
import { useInnerWidthState } from "../../hooks/useInnerWidthState";
import ReviewTransactions from "../../components/Transaction/ReviewTransaction";
import SelectedTransactions from "../../components/Transaction/SelectedTransactions";
import { useSelectedFilter } from "../../context/TableFilterContext";
import { useCloseSideBar } from "../../hooks/useCloseSideBar";
import TransactionButton from "../../components/Transaction/TransactionButton";
import { useBudget } from "../../context/BudgetContext";
import { queryClient } from "../..";
import LimitButton from "../../components/common/LimitButton";
import ExportDataToCsv from "../../components/Transaction/ExportDataToCsv";



export async function loader() {
  const url = new URL("http://localhost:5000/transactions/listtransactions");
  console.log(url);
  return null;
}

export const dataCategory: string[] = ["Food", "Rent", "Salary", "Entertainment", "BankFees", "CoffeeShops", "deposit", "Income", "PaymentTransfer"];



export default function TransactionPage() {

  const { category, name, setCategory, setName, months, search, setSearch, hideOver, setHideOver, monthStrings, searchParams, setSearchParams } = useOutletContext<ContextType>()
  const navigate = useNavigate()
  const { year, month } = useParams();
  const [active, setActive] = useState(false);
  const location = useLocation();
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [disabled, setDisabled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddTransaction, setIsAddTransaction] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [width] = useInnerWidthState();
  const { rowSelection } = useSelectedFilter();
  const addRef = useRef(null);
  const transactRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, setIsOpen } = useCloseSideBar(addRef);
  const { isSideTransaction, setIsSideTransation } = useCloseSideBar(transactRef);
  const controlRef = useRef<HTMLDivElement | null>(null);
  const firstBox = useRef<HTMLDivElement | null>(null);
  const secondBox = useRef<HTMLDivElement | null>(null);


  const { data: categories, isLoading: categoryLoading } = useQuery({ queryKey: ['category'], queryFn: fetchCategory, gcTime: 0 });

  const { data, isPending, isLoading } = useQuery({
    queryKey: ['alltransactions', { name, category, year, month, page, search, limit }],
    queryFn: fetchTransactions,
    gcTime: 0,
    enabled: !!categories
  })


  const { updateQueryParams } = useBudget()


  useEffect(() => {
    updateQueryParams({ month, year })
  }, [month, year])



  // console.log(data?.listTransactions, "listTransactions")

  useEffect(() => {
    if (category) searchParams.set('category', category);
    if (name) searchParams.set('name', name);
    if (page) searchParams.set('page', page.toString());
    if (search) searchParams.set('search', search);
    setSearchParams(searchParams);
    updateQueryParams({ month, year })
    // updateTransactionQueryParams({ month, year, search, limit, page })
  }, [category, name, page, searchParams, setSearchParams, search, month, year]);




  function clearFilters() {
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
    setCategory('');
    setSearch('')
    setName("")
  }


  const handleOpenSideBar = () => {
    setIsAddTransaction(true);
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
  }

  useEffect(() => {
    if (isAddTransaction || isSidebarOpen) {
      document.body.style.overflowY = 'hidden';

    } else {
      document.body.style.overflowY = 'auto'
    }

    return () => {
      document.body.style.overflowY = 'auto'
    }
  }, [isAddTransaction, isSidebarOpen])

  const prepareButtons = (): ReactNode => {
    const buttons: any[] = [];
    for (let i = 1; i <= data?.pagination?.totalPages; i++) {
      buttons.push(
        <PaginationItem key={i} className=" cursor-pointer" >
          <PaginationLink className={`h-7 px-2 w-7 rounded-full ${currentPage === i ? 'bg-orange-300' : ''} `} onClick={() => handleNextByButton(i)}>{i}</PaginationLink>
        </PaginationItem>
      )
    }
    return buttons;
  }

  const handleNextByButton = (value: number) => {
    if (page <= data?.pagination?.totalPages || 1) {
      setPage(value);
      setActive(true);

      setCurrentPage(value);
      navigate(`/dashboard/transactions/${year}/${month}?page=${value}`);
    }
  }
  const handleNext = () => {
    if (page === data?.pagination?.totalPages || 1) {
      setDisabled(true)
      return;
    }
    if (page <= data?.pagination?.totalPages || 1) {
      setPage((page) => page + 1);
      setCurrentPage((page) => page + 1)
      navigate(`/dashboard/transactions/${year}/${month}?page=${page}`);
    }
  }



  const handlePrevious = () => {
    if (page === 1) {
      setDisabled(true);
      return;
    }
    setPage((page) => page - 1);
    setCurrentPage((page) => page - 1)
    navigate(`/dashboard/transactions/${year}/${month}?page=${page}`);
  }

  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsSidebarOpen(true); // Open the sidebar
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedTransaction(null); // Clear selected transaction
  };

  const closeAddBar = () => {
    setIsAddTransaction(false)
  }




  useEffect(() => {
    if (!isOpen) {
      closeSidebar();

    }
    if (!isSideTransaction) {
      closeAddBar()

    }
    return () => {
      if (isOpen) {
        setIsOpen(true);
      }
      if (isSideTransaction) {
        setIsSideTransation(true)
      }
    }
  }, [isOpen, setIsOpen, isSideTransaction, setIsSideTransation]);



  const columns = transactionColumns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => (

          <div className="flex items-center  justify-center w-full text-center">

            <div className={` flex  justify-center  text-center ${row.original.status === 'cleared' ? ' text-green' : ''} `}>
              {row.original.status === 'cleared' ? <CheckCircle2 fill="green" className="text-white" enableBackground={"green"} width={18} fontSize={15} /> : <CheckCircleIcon width={14} fontSize={14} />}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="flex ">
                <Button variant="ghost" className="h-8 w-8 p-0 ">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1] ">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(row.original.category._id)}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEditTransaction(row.original)}>
                  Edit transaction
                </DropdownMenuItem>
                <DropdownMenuItem>View transaction</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      };


    }


    return col;
  });

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('transaction-page');
      if (controlRef.current && element) {

        const scrollY = window.scrollY;
        // const tabOffsetTop = Math.abs(secondBox.current.offsetHeight);
        const tabOffsetBottom = Math.abs(controlRef.current.offsetHeight)
        // console.log(tabOffsetTop, "tabOffset")

        // When the user scrolls past the element's original position
        if (Object.keys(rowSelection).length > 0) {
          if (tabOffsetBottom <= scrollY) {

            // tabRef.current.style.top += 50;
            controlRef.current.style.position = 'fixed';
            controlRef.current.style.top = '4rem';


            // Fix it 1rem from the top
            // firstTab.current.style.display = 'none'
          } else if (tabOffsetBottom >= scrollY) {
            // Reset position when scrolling back up
            controlRef.current.style.position = 'static';

            // firstTab.current.style.display = 'flex'
          }

        } else {
          if (tabOffsetBottom <= scrollY) {

            // tabRef.current.style.top += 50;
            controlRef.current.style.position = 'fixed';
            controlRef.current.style.bottom = '1rem';
            controlRef.current.style.height = '100%'

            // Fix it 1rem from the top
            // firstTab.current.style.display = 'none'
          } else if (tabOffsetBottom >= scrollY) {
            // Reset position when scrolling back up
            controlRef.current.style.position = 'static';

            // firstTab.current.style.display = 'flex'
          }
        }

      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [rowSelection])

  return (
    <div id="transaction-page" data-page="transaction" className="w-full h-full px-2 md:px-4 2xl:px-14 xl:px-9 mt-20 mb-10 font-custom2 text-black  ">
      <h1 className="text-slate-700 dark:text-foreground  font-bold font-custom3 text-2xl text-center lg:text-left">Transactions</h1>
      <div className="mt-1">
        <div className="date-table-filters w-full flex h-24 items-center  max-w-full ">
          <MonthPicker params={searchParams} page={page} setPage={setPage} monthStrings={monthStrings} />
          <div className="ml-auto flex items-center gap-2 text-foreground" >
            <TransactionButton handleOpenSideBar={handleOpenSideBar} />
            <ExportDataToCsv month={month} year={year} data={data && data?.listTransactions} />

            <Button className={buttonVariants({ variant: "default", className: `px-4 bg-orange-400 text-white flex ` })} onClick={() => {
              setHideOver(!hideOver)
              updateQueryParams({ month, year })
            }}>
              <MoveLeftIcon className=" w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>

      <div className="filters-searches    ">
        {/* {isPending && <SearchFilterSkeleton/>} */}
        <div className="filter-container  rounded-md h-24 flex-col  lg:flex items-center px-3">
          <SearchTransactions clearFilter={clearFilters} />

          <div className="lg:ml-auto justify-center lg:mt-0 mt-2  flex items-center">
            <SelectAccount name={name} accountName={name} setAccountName={setName} />
            <Select value={category} onValueChange={setCategory}  >
              <SelectTrigger className="w-[180px] ml-2 h-12 text-orange-400 font-semibold border-orange-500 rounded-2xl bg-white">
                <SelectValue placeholder="Category" />
                <SelectContent className=" h-36 overflow-y-auto border-0 border-none outline-none">
                  {categories && categories.data && categories?.data?.map((item: any) => {
                    return (
                      <SelectItem value={item.name} defaultValue={"all"}>
                        {item.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </div>
      {isAddTransaction && !categoryLoading &&
        < div data-bar="add-bar" ref={transactRef} id="add" className=" fixed right-0  top-0 bottom-0  z-[48] lg:w-96 w-full h-full flex justify-end ">
          <AddTransaction setIsAddTransaction={setIsAddTransaction} transactRef={transactRef} months={months} />
        </div>}
      {
        isSidebarOpen && !categoryLoading && (
          <Card ref={addRef} data-bar="edit-bar" className="fixed right-0 add-bar  top-0 bottom-0 z-[48] lg:w-96 w-full px-5 h-full scrollbar-hide overflow-hidden scroll-m-0 overflow-y-auto">
            <EditTransaction transaction={selectedTransaction} closeSideBar={closeSidebar} />
          </Card>
        )
      }

      <div className={` h-full w-full `}>

        <>
          {width < 816 ?
            <div className="flex">
              <div className={`${!hideOver ? 'w-full' : "flex-shrink w-full table-fixed border-spacing-0"} min-w-0`}>
                {isLoading && <CardTransaction handleEditTransaction={handleEditTransaction} data={[]} isPending={isLoading} />}
                {data && month && year && <CardTransaction handleEditTransaction={handleEditTransaction} data={data?.listTransactions} />}
              </div>
              <div style={{ minWidth: `calc(260px + 1rem)` }} className={`${hideOver ? `flex` : `hidden`} flex  flex-1 bg-background text-foreground  flex-col items-end `}>
                <div id="sticky-anchor" className="w-full bg-red-300 h-0"></div>
                <div id="sticky" ref={controlRef} className=" mb-[4rem] h-fit " >
                  {Object.keys(rowSelection).length > 0 && <SelectedTransactions secondBox={secondBox} />}
                  {data && data?.listTransactions && <ReviewTransactions month={month} category={category} year={year} page={page} transaction={data.listTransactions} />}
                </div>
              </div>
            </div> :
            <>
              {isPending || categoryLoading ? < TransactionTable
                clearFilter={clearFilters}
                columns={columns}
                data={[]}
                hideOver={hideOver}
                listData={[]}
                handleOpenSideBar={handleOpenSideBar}
                isPending={isLoading || isPending} /> :
                <div ref={firstBox} className="flex z-0 ">
                  <div className={` px-3 flex flex-col ${hideOver ? 'xl:max-w-2xl lg:w-full ' : ''}  mt-5 border-0  overflow-x-auto  overflow-y-hidden h-fit py-2 text-foreground  z-0 b bg-opacity-30 rounded-md  `}>
                    {data && data.listTransactions && categories && <TransactionTable
                      clearFilter={clearFilters}
                      hideOver={hideOver}
                      columns={columns}
                      data={data?.listTransactions}
                      listData={data}
                      handleOpenSideBar={handleOpenSideBar}
                      isPending={isLoading || isPending} />}
                    <>
                      {data && data.listTransactions && data.listTransactions.length >= limit && (
                        <div className="flex justify-between h-24 items-center  mt-2">
                          {data && data.listTransactions.length >= limit && <LimitButton setLimit={setLimit} />}
                          <Pagination className="">
                            <PaginationContent className="  rounded-md ml-auto">
                              <PaginationItem className=" bg-transparent  cursor-pointer rounded-md " >
                                <PaginationPrevious className=" hover:bg-transparent" onClick={handlePrevious} />
                              </PaginationItem>
                              {prepareButtons()}
                              <PaginationItem className=" bg-tranaparent cursor-pointer rounded-md">
                                <PaginationNext className=" hover:bg-transparent" onClick={handleNext} />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>)
                      }
                    </>

                  </div>
                  <div style={{ minWidth: `calc(260px + 1rem)` }} className={`${hideOver ? `flex` : `hidden`} flex  flex-1 flex-grow max-[1000px]:flex-row max-[1000px]:items-start flex-col items-end `}>
                    <div className="w-full bg-red-300 h-0"></div>
                    <div className="mb-[4rem]" ref={controlRef}>
                      {Object.keys(rowSelection).length > 0 && <SelectedTransactions secondBox={secondBox} />}
                      {data && data?.listTransactions && page && month && year && <ReviewTransactions month={month} category={category} year={year} page={page} transaction={data?.listTransactions} />}
                    </div>

                  </div>

                </div>}
            </>


          }


        </>

      </div>
    </div >

  )
}
