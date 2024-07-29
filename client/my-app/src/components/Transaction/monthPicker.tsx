import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { ArrowBigRightDash, ArrowDownRightIcon, LucideArrowLeftToLine, MoveLeft, MoveLeftIcon, MoveRightIcon } from 'lucide-react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';





export default function MonthPicker({params}:{params:any}){ 

  const {PrevMonth,NextMonth,months,monthString,month,year}=useOutletContext<ContextType>();
  const navigate=useNavigate();
  const convert = useMemo(()=>month + 1 > 0 && month + 1 <= 9 ? `0${month + 1}` : `${month + 1}`,[month]);
 
  const handlePrevClick = useCallback(() => {
    PrevMonth();
    const targetPath = `/dashboard/transactions/${year}/${convert}`;
    if (params) {
      navigate(`${targetPath}?${params}`);
    } else {
      navigate(targetPath);
    }
  },[PrevMonth, convert, navigate, params, year]);

  const handleNextClick = useCallback(() => {
    NextMonth();
    const targetPath = `/dashboard/transactions/${year}/${convert}`;
    if (params) {
      navigate(`${targetPath}?${params}`);
    } else {
      navigate(targetPath);
    }
  },[NextMonth, convert, navigate, params, year]);

  useEffect(()=>{
  if (year && convert) {
       const targetPath = `/dashboard/transactions/${year}/${convert}`;
       navigate(targetPath);
    }
  },[year,convert,navigate])
  
     
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
            <span className=" text-black text-lg lg:text-3xl">{monthString}{year}</span>
         </div>
        </div>
    )
}