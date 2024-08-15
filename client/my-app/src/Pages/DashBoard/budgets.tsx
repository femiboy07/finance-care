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








export default function BudgetsPage(){
  const {category,name,setCategory,setName,setSearchParams}=useOutletContext<ContextType>()
    const navigate=useNavigate()
    const {year,month}=useParams();
    const [active,setActive]=useState(false);
    const location=useLocation();
    const [type,setType]=useState('');
    const [page,setPage]=useState(1);
    const [currentPage,setCurrentPage]=useState<number>(page);
    const [disabled,setDisabled]=useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddBudget,setIsAddBudget]=useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [searchParam,setSearchParam]=useSearchParams();
    const [width]=useInnerWidthState();

   
  
    const {data,isPending,error}=useQuery({
      queryKey:['allbudgets',{name,category,year,month,page}],
      queryFn:fetchBudgets,
    
    })
    
     useEffect(()=>{
      if (category) searchParam.set('category',category);
      // if (name) searchParam.set('name', name);
      if(page) searchParam.set('page',page.toString())
       setSearchParam(searchParam);
      },[category, page, searchParam, setSearchParam]);

    useEffect(()=>{
     
    },[location.search,navigate])

    
    function clearFilters(){
      const newParams = new URLSearchParams();
      setSearchParam(newParams,{replace:true});
      setCategory('');
      setName("")
    }
    

  const handleOpenSideBar=()=>{
    setIsAddBudget(true);
    
  }
     
   useEffect(()=>{
     if(isAddBudget || isSidebarOpen){
      document.body.style.overflowY='hidden'
     }else{
      document.body.style.overflowY='auto'
     }

      return ()=>{
        document.body.style.overflowY='auto'
      }
   },[isAddBudget,isSidebarOpen])
    
       const prepareButtons=():ReactNode=>{
        const buttons:any[]=[];
        for(let i=1; i <= data?.pagination?.totalPages; i++){
          buttons.push (
             <PaginationItem key={i} className=" cursor-pointer" >
               <PaginationLink   className={`h-7 px-2 w-7 rounded-full ${currentPage === i ? 'bg-orange-300':''} `} onClick={()=>handleNextByButton(i)}>{i}</PaginationLink>
             </PaginationItem>
         )
        }
      return buttons;
     }

     const handleNextByButton=(value:number)=>{
     if(page <= data?.pagination?.totalPages || 1){
       setPage(value);
       setActive(true);

       setCurrentPage(value);
       navigate(`/dashboard/transactions/${year}/${month}?page=${value}`);
      }
     }
     const handleNext=()=>{
     if(page === data?.pagination?.totalPages || 1){
      setDisabled(true)
      return;
     }
     if(page <= data?.pagination?.totalPages || 1){
       setPage((page)=>page + 1);
       setCurrentPage((page)=>page + 1)
       navigate(`/dashboard/transactions/${year}/${month}?page=${page}`);
      }
     }

  

  const handlePrevious=()=>{
     if(page === 1){
        setDisabled(true);
        return;
      }
       setPage((page)=>page-1);
       setCurrentPage((page)=>page-1)
       navigate(`/dashboard/transactions/${year}/${month}?page=${page}`);
    }

    const handleEditBudget = (transaction:any) => {
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
          cell: ({row}:any) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-10">
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
                <DropdownMenuItem>View Budgets</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        };
      }
      return col;
    });
    return(
        <div className="w-full h-full px-2 md:px-4 xl:px-9 mt-20 mb-10 text-black max-w-full overflow-y-hidden">
          <h1 className="text-slate-700 font-bold text-2xl text-center lg:text-left">Budgets</h1>
          <div className="mt-1">
            <div className="date-table-filters w-full flex h-24 items-center  max-w-full ">
               <MonthBudgetPicker page={page} params={searchParam} setPage={setPage}  /> 
                <div className="ml-auto" >
                 <Button onClick={handleOpenSideBar}  className={buttonVariants({className:" bg-orange-400 lg:py-6 hover:bg-slate-300 flex justify-center items-center hover:opacity-45 lg:h-13 px-3 py-6 rounded-[100%]  lg:rounded-full"})}>
                 <PlusIcon className="w-[25px]  h-[25px] self-center"/>
                 <span className=" lg:block hidden">AddBudgets</span> 
                </Button>
                </div>
            </div>
            </div>
            {width >= 1024 &&  <div className="filters-searches max-w-full  w-full  ">
              {isPending && <SearchFilterSkeleton/>}
              {data &&
               <div className="filter-container shadow-md rounded-md bg-white h-24  flex items-center px-3">
               <SearchBudgets/>
               {searchParam.size > 1 && <Button className={buttonVariants({variant:'default',className:" bg-slate-100 text-slate-400 py-2 rounded-full"})} onClick={clearFilters}>Clearfilters</Button>}
               <div className="ml-auto   flex items-center">
                {/* <SelectAccount name={name} accountName={name} setAccountName={setName}/> */}
                 {/* <Select value={category} onValueChange={setCategory} >
                    <SelectTrigger className="w-[180px] ml-2 h-12  bg-white">
                        <SelectValue placeholder="Category"/>
                      <SelectContent className=" h-36 overflow-y-auto border-0 border-none outline-none"> 
                      {dataCategory.map((item)=>{
                        return (
                          <SelectItem  value={item} defaultValue={"all"}>
                          {item}
                          </SelectItem>
                        )
                      })}  
                     </SelectContent>
                    </SelectTrigger>
                 </Select> */}
                 </div>
               </div>} 
               </div>}
               {isAddBudget && 
               (
              createPortal(   
              <div className="fixed right-0  top-0 left-0 z-[48] lg:z[9999]  w-full h-full flex justify-end "> 
             <AddBudgets setIsAddBudget={setIsAddBudget}/>
             </div>,document.body)
           )}  
              {isSidebarOpen && ( 
              <Card className="fixed right-0  top-0 bottom-0 z-[48] lg:w-96 w-full px-5 h-full scrollbar-hide overflow-hidden scroll-m-0 overflow-y-auto"> 
              <EditBudget budgets={selectedBudget} closeSideBar={closeSidebar}/>
             </Card>
           )} 
            
        <div className=" h-full">
        {isPending && <TransactionSkeleton/>}
          
          {data  && month && year && (
            <>
          {width < 768 ? <CardTransaction handleEditTransaction={handleEditBudget} data={data.data}/>:<BudgetTable columns={columns} data={data.data} listData={data} isPending={isPending}/>}
               <Pagination className="mt-2 ">
             <PaginationContent className=" py-2  rounded-md ml-auto">
        <PaginationItem className=" bg-transparent  cursor-pointer rounded-md " >
          <PaginationPrevious  className=" hover:bg-transparent"  onClick={handlePrevious} />
        </PaginationItem>
         {prepareButtons()}
         <PaginationItem className=" bg-tranaparent cursor-pointer rounded-md"> 
        <PaginationNext className=" hover:bg-transparent" onClick={handleNext}  />
        </PaginationItem>
      </PaginationContent>
      </Pagination>
      </>)}
     </div>  
              
      
     </div>
      
    )
}