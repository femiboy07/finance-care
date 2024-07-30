import React, { ReactNode, useEffect, useMemo, useState } from "react";
import MonthPicker from "../../components/Transaction/monthPicker";
import SearchTransactions from "../../components/Transaction/searchTransactions";
import { Select, SelectItem, SelectTrigger, SelectValue,SelectContent } from "../../@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchTransaction } from "../../api/apiRequest";
import SelectAccount from "../../components/Transaction/selectAccount";
import { TransactionTable, transactionColumns } from "../../components/Transaction/transactionData";
import { Card } from "../../@/components/ui/card";
import { Button, buttonVariants } from "../../@/components/ui/button";
import {  useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import EditTransaction from "../../components/Transaction/EditTransaction";
import AddTransaction from "../../components/Transaction/AddTransaction";
import SearchFilterSkeleton from "../../components/Skeleton/SearchFiterSkeleton";
import TransactionSkeleton from "../../components/Skeleton/TransactionSkeleton";
import CardTransaction from "../../components/Transaction/CardTransaction";
import { useInnerWidthState } from "../../hooks/useInnerWidthState";
import { createPortal } from "react-dom";



export async function loader(){
     const url=new URL("http://localhost:5000/transactions/listtransactions");
     console.log(url);
     return null;
}

export const dataCategory:string[]=["Food","Rent","Salary","Entertainment","BankFees","CoffeeShops","deposit","Income","PaymentTransfer"];



export default function TransactionPage(){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
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
    const [isAddTransaction,setIsAddTransaction]=useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [searchParam,setSearchParam]=useSearchParams();
    const [width]=useInnerWidthState();

   
  
    const {data,isPending,error}=useQuery({
      queryKey:['alltransactions',{name,category,year,month,page}],
      queryFn:fetchTransaction,
    
    })
    
     useEffect(()=>{
      if (category) searchParam.set('category',category);
      if (name) searchParam.set('name', name);
      if(page) searchParam.set('page',page.toString())
       setSearchParam(searchParam);
      },[category, name, page, searchParam, setSearchParam]);

    useEffect(()=>{
     
    },[location.search,navigate])

    
    function clearFilters(){
      // let param;
      
      const newParams = new URLSearchParams();
    
      // Set the new (empty) parameters
      setSearchParam(newParams,{replace:true});
      setCategory('');
      setName("")
      }
    

  const handleOpenSideBar=()=>{
    setIsAddTransaction(true);
    
  }
     
   useEffect(()=>{
     if(isAddTransaction || isSidebarOpen){
      document.body.style.overflowY='hidden'
     }else{
      document.body.style.overflowY='auto'
     }

      return ()=>{
        document.body.style.overflowY='auto'
      }
   },[isAddTransaction,isSidebarOpen])
    
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

    const handleEditTransaction = (transaction:any) => {
      setSelectedTransaction(transaction);
      setIsSidebarOpen(true); // Open the sidebar
    };
  
    const closeSidebar = () => {
      setIsSidebarOpen(false);
      
      setSelectedTransaction(null); // Clear selected transaction
    };

   const columns = transactionColumns.map((col) => {
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
                <DropdownMenuItem onClick={() => handleEditTransaction(row.original)}>
                  Edit transaction
                </DropdownMenuItem>
                <DropdownMenuItem>View transaction</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        };
      }
      return col;
    });
    // if (isPending) return <div>...loading</div>;

    // if (error) return <div>Error loading transactions</div>;
    return (
        <div className="w-full h-full px-2 md:px-4 xl:px-9 mt-20 mb-10 text-black max-w-full overflow-y-hidden">
          <h1 className="text-black text-2xl text-center lg:text-left">Transactions</h1>
          <div className="mt-1">
            <div className="date-table-filters w-full flex h-24 items-center  max-w-full ">
                <MonthPicker params={searchParam} page={page} setPage={setPage}/>
                <div className="ml-auto" >
                 <Button onClick={handleOpenSideBar} className={buttonVariants({variant:"default",className:" bg-orange-400"})}>
                   Add Transaction
                 </Button>
                </div>
            </div>
          
            </div>
            
           {width >= 1024 &&  <div className="filters-searches max-w-full  w-full  ">
              {isPending && <SearchFilterSkeleton/>}
              {data &&
               <div className="filter-container shadow-md rounded-md bg-white h-24  flex items-center px-3">
               <SearchTransactions/>
               {searchParam.size > 1 && <Button className={buttonVariants({variant:'default',className:" bg-slate-100 text-slate-400 py-2 rounded-full"})} onClick={clearFilters}>Clearfilters</Button>}
               <div className="ml-auto   flex items-center">
                <SelectAccount name={name} accountName={name} setAccountName={setName}/>
                 <Select value={category} onValueChange={setCategory} >
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
                 </Select>
                 </div>
               </div>} 
               </div>}
               {isAddTransaction && 
               (
              createPortal(   
              <div className="fixed right-0  top-0 left-0 z-[48] lg:z[9999]  w-full h-full flex justify-end "> 
             <AddTransaction setIsAddTransaction={setIsAddTransaction}/>
             </div>,document.body)
           )}  
               {isSidebarOpen && ( 
              <Card className="fixed right-0  top-0 bottom-0 z-[48] lg:w-96 w-full px-5 h-full scrollbar-hide overflow-hidden scroll-m-0 overflow-y-auto"> 
              <EditTransaction transaction={selectedTransaction} closeSideBar={closeSidebar}/>
             </Card>
           )} 
              
        <div className=" h-full">
        {isPending && <TransactionSkeleton/>}
          
          {data  && month && year && (
            <>
          {width < 768 ? <CardTransaction handleEditTransaction={handleEditTransaction} data={data.listTransactions}/>:<TransactionTable columns={columns} data={data.listTransactions} listData={data} isPending={isPending}/>}
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
