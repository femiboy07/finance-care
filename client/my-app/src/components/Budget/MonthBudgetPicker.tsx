import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { ArrowBigRightDash, ArrowDownRightIcon, LucideArrowLeftToLine, MoveLeft, MoveLeftIcon, MoveRightIcon } from 'lucide-react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';


export default function MonthBudgetPicker({ params, page, setPage }: { params: any, page: number, setPage: any }) {

  const { PrevMonth, NextMonth, months, monthString, month, year } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname === '/dashboard/budgets' ? 'budgets' : 'transactions';
  const convert = useMemo(() => month + 1 > 0 && month + 1 <= 9 ? `0${month + 1}` : `${month + 1}`, [month]);
  console.log(location.pathname, "location.pathname");
  const handlePrevClick = useCallback(() => {
    PrevMonth();

    const targetPath = `/dashboard/budgets/${year}/${convert}`;
    if (params) {
      navigate(`${targetPath}?${params}`);
    } else {
      navigate(targetPath);
    }
  }, [PrevMonth, convert, navigate, params, year]);

  const handleNextClick = useCallback(() => {
    NextMonth();

    const targetPath = `/dashboard/budgets/${year}/${convert}`;
    if (params) {
      navigate(`${targetPath}?${params}`);
    } else {
      navigate(targetPath);
    }
  }, [NextMonth, convert, navigate, params, year]);

  useEffect(() => {
    if (year && convert) {
      const targetPath = `/dashboard/budgets/${year}/${convert}`;
      navigate(targetPath);
    }
  }, [year, convert, navigate])


  return (

    <div className='flex  py-5 items-center dark:text-foreground'>
      <div className="date-controls-button flex gap-1 text-foreground ">
        <Button className={buttonVariants({ variant: "default", className: " bg-transparent hover:bg-transparent rounded-full text-black dark:text-foreground h-4 px-1 py-4 self-start" })} onClick={handlePrevClick} >
          <MoveLeftIcon />
        </Button>
        <Button className={buttonVariants({ variant: "default", className: " bg-transparent  hover:bg-transparent  text-black dark:text-foreground rounded-full h-4 px-1 py-4 self-start " })} onClick={handleNextClick}>
          <MoveRightIcon />
        </Button>
      </div>
      <div className="date-picker date-title ml-2">
        <span className=" text-slate-700 dark:text-foreground font-semibold text-lg lg:text-3xl">{monthString}{" "}{year}</span>
      </div>
    </div>
  )
}