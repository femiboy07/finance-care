import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { ArrowBigRightDash, ArrowDownRightIcon, LucideArrowLeftToLine, MoveLeft, MoveLeftIcon, MoveRightIcon } from 'lucide-react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';





export default function MonthPicker({params,page,setPage}:{params:any,page:number,setPage:any}){ 

  const {PrevMonth,NextMonth,months,monthString,month,year}=useOutletContext<ContextType>();
  const navigate=useNavigate();
  const location=useLocation();
  const path=location.pathname === '/dashboard/budgets' ? 'budgets' : 'transactions';
  const convert = useMemo(()=>month + 1 > 0 && month + 1 <= 9 ? `0${month + 1}` : `${month + 1}`,[month]);
 console.log(location.pathname,"location.pathname")
  const handlePrevClick = useCallback(() => {
    PrevMonth();
    setPage(1)
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    if (params) {
      navigate(`${targetPath}?${params}`);
    } else {
      navigate(targetPath);
    }
  },[PrevMonth, convert, navigate, params, year,setPage,path]);

  const handleNextClick = useCallback(() => {
    NextMonth();
    setPage(1)
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    if (params) {
      navigate(`${targetPath}?${params}`);
    } else {
      navigate(targetPath);
    }
  },[NextMonth, convert, navigate, params, year,setPage,path]);

  useEffect(()=>{
  if (year && convert) {
       const targetPath = `/dashboard/${path}/${year}/${convert}`;
       navigate(targetPath);
    }
  },[year,convert,navigate,path])
  
     
    return (
        
        <div className='flex  py-5 items-center text-black '>
         <div className="date-controls-button flex gap-1 ">
          <Button className={buttonVariants({variant:"default",className:" bg-transparent hover:bg-transparent rounded-full text-black h-4 px-1 py-4 self-start"})} onClick={handlePrevClick} >
            <MoveLeftIcon/>
           </Button>
           <Button  className={buttonVariants({variant:"default",className:" bg-transparent text-black hover:bg-transparent  rounded-full h-4 px-1 py-4 self-start "})}   onClick={handleNextClick}>
            <MoveRightIcon />
           </Button>
         </div>
         <div className="date-picker date-title ml-2">  
            <span className=" text-slate-700 font-bold text-lg lg:text-3xl">{monthString}{" "}{year}</span>
         </div>
        </div>
    )
}