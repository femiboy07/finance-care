import React, { ReactNode, useEffect, useState } from 'react';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { MoreHorizontal, PlusIcon } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../@/components/ui/pagination';
import { fetchBudgets } from '../../api/apiRequest';
import { useQuery } from '@tanstack/react-query';
import { useInnerWidthState } from '../../hooks/useInnerWidthState';
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';
import { BudgetColumns } from '../../components/Budget/budgetdata';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../@/components/ui/dropdown-menu';
import MonthBudgetPicker from '../../components/Budget/MonthBudgetPicker';
import TransactionSkeleton from '../../components/Skeleton/TransactionSkeleton';
import SearchFilterSkeleton from '../../components/Skeleton/SearchFiterSkeleton';
import CardTransaction from '../../components/Transaction/CardTransaction';
import SearchBudgets from '../../components/Budget/searchBudgets';
import { BudgetTable } from '../../components/Budget/budgetdata';
import AddBudgets from '../../components/Budget/AddBudgets';
import { createPortal } from 'react-dom';
import EditBudget from '../../components/Budget/EditBudget';
import { Card } from '../../@/components/ui/card';
import { queryClient } from '../..';
import { useBudget } from '../../context/BudgetContext';
import { useData } from '../../context/DataProvider';
import ClearAllBudgets from '../../components/Budget/ClearAllBudgets';








export default function BudgetsPage() {
  const { category, name, setCategory, setName, setSearchParams } = useOutletContext<ContextType>()
  const navigate = useNavigate()
  const { year, month } = useParams();
  const [active, setActive] = useState(false);
  const location = useLocation();
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [disabled, setDisabled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddBudget, setIsAddBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [searchParam, setSearchParam] = useSearchParams();
  const [width] = useInnerWidthState();
  const { data, isLoading, updateQueryParams, isFetching, isPending } = useBudget();


  useEffect(() => {
    updateQueryParams({ month, year })
  }, [])

  useEffect(() => {
    // if (category) searchParam.set('category', category);

    setSearchParam(searchParam);
    updateQueryParams({ month, year })

  }, [category, month, name, searchParam, setSearchParam, year]);

  useEffect(() => {

  }, [location.search, navigate])


  function clearFilters() {
    const newParams = new URLSearchParams();
    setSearchParam(newParams, { replace: true });
    setCategory('');
    setName("")
  }


  const handleOpenSideBar = () => {
    setIsAddBudget(true);

  }

  useEffect(() => {
    if (isAddBudget || isSidebarOpen) {
      document.body.style.overflowY = 'hidden'
    } else {
      document.body.style.overflowY = 'auto'
    }

    return () => {
      document.body.style.overflowY = 'auto'
    }
  }, [isAddBudget, isSidebarOpen])






  const handleEditBudget = (transaction: any) => {
    setSelectedBudget(transaction);
    setIsSidebarOpen(true); // Open the sidebar
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedBudget(null); // Clear selected transaction
  };

  const columns = BudgetColumns.map((col) => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }: any) => (
          <>
            {row.original.budget.$numberDecimal !== '0.0' ?
              (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-full p-0 flex justify-center">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-10 ">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(row.original.category)}
                    >
                      Copy payment ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditBudget(row.original)}>
                      Edit Budgets
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>View Budgets</DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
          </>
        ),
      };
    }
    return col;
  });
  return (
    <div className="w-full  h-full px-2 md:px-4 xl:px-9 font-custom2 mt-20 mb-10 text-black">
      <h1 className="text-slate-700 dark:text-foreground font-bold text-2xl text-center lg:text-left">Budgets</h1>
      <div className="mt-1">
        <div className="date-table-filters w-full flex h-24 max-h-full flex-wrap items-center  max-w-full ">
          <div className='w-full flex flex-[100%]  flex-grow dark:text-foreground md:flex-grow'>
            <MonthBudgetPicker page={page} params={searchParam} setPage={setPage} />
          </div>
          <div className='flex-wrap ml-auto '>
            {year && month && <ClearAllBudgets month={parseInt(month)} year={parseInt(year)} />}
          </div>
        </div>
      </div>
      {width >= 1024 && <div className="filters-searches max-w-full  w-full  ">
        {/* {isLoading && <SearchFilterSkeleton />} */}
      </div>}
      {isAddBudget &&
        (
          createPortal(
            <div className="fixed right-0  top-0 left-0 z-[48] lg:z[9999]  w-full h-full flex justify-end ">
              <AddBudgets setIsAddBudget={setIsAddBudget} />
            </div>, document.body)
        )}
      {isSidebarOpen && (
        <Card className="fixed right-0  bg-white dark:bg-background top-0 bottom-0 z-[48] lg:w-96 w-full px-5  h-full scrollbar-hide overflow-hidden scroll-m-0 overflow-y-auto">
          <EditBudget budgets={selectedBudget} closeSideBar={closeSidebar} />
        </Card>
      )}

      <div className=" h-full overflow-y-hidden max-w-full w-full ">
        {isPending || isLoading ? <BudgetTable columns={columns} data={[]} isPending={isPending || isLoading} /> :
          <>
            {data && data.data && data.data.length > 0 && month && year && (
              <div className='  mt-5   h-fit py-2 w-full max-w-full  z-0 text-foreground bg-opacity-30 rounded-md'>
                <BudgetTable columns={columns} data={data?.data} isPending={isLoading || isPending} />

              </div>)}
          </>}
      </div>


    </div>

  )
}