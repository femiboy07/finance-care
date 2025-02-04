import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { MoveLeftIcon, MoveRightIcon } from 'lucide-react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';
import { useBudget } from '../../context/BudgetContext';



export default function MonthPicker({ params, page, setPage, monthStrings }: { params: any, page: number, setPage: any, monthStrings: string }) {
  const { PrevMonth, NextMonth, monthString, month, year, setMonthStrings, monthNames } = useOutletContext<ContextType>();
  const { updateQueryParams } = useBudget()
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.includes('budgets') ? 'budgets' : 'transactions';
  const convert = useMemo(() => month + 1 > 0 && month + 1 <= 9 ? `0${month + 1}` : `${month + 1}`, [month]);
  const mainYear = localStorage.getItem('currentYear');

  useEffect(() => {
    localStorage.setItem("currentYear", year.toString());
    localStorage.setItem("currentDay", convert);
    setMonthStrings(monthNames[Number(convert) - 1])
  }, [convert, monthNames, setMonthStrings, year]);



  // let queryParams = new URLSearchParams(params).toString();
  const handlePrevClick = useCallback(() => {
    PrevMonth();
    setPage(1);
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    const queryParams = params.toString();
    navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`);
    setMonthStrings(monthNames[Number(convert)])
    updateQueryParams(params)



  }, [PrevMonth, setPage, path, year, convert, params, navigate, updateQueryParams, monthNames, setMonthStrings]);

  const handleNextClick = useCallback(() => {
    NextMonth();
    setPage(1);
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    const queryParams = params.toString();
    navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`);
    updateQueryParams(params)
  }, [NextMonth, setPage, path, year, convert, params, navigate, updateQueryParams]);

  // useEffect(() => {
  //   if (year && month) {
  //     const targetPath = `/dashboard/${path}/${year}/${convert}`;
  //     const queryParams = params.toString();
  //     navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`, { replace: false });

  //   }
  // }, [navigate, path, convert, year, month, params]);


  useEffect(() => {
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    const queryParams = params.toString();
    navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`, { replace: false });

  }, [convert, navigate, params, path, year, month])
  return (
    <div className='flex py-5 items-center text-black'>
      <div className="date-controls-button flex gap-1">
        <Button onClick={handlePrevClick} className={buttonVariants({ className: 'rounded-[100%] py-7 bg-transparent hover:bg-slate-200 px-3 text-black dark:text-foreground' })}><MoveLeftIcon /></Button>
        <Button onClick={handleNextClick} className={buttonVariants({ className: 'rounded-[100%] py-7 bg-transparent hover:bg-slate-200  px-3 text-black dark:text-foreground' })}><MoveRightIcon /></Button>
      </div>
      <div className="date-picker date-title ml-2">
        <span className="text-slate-700 dark:text-foreground font-bold text-lg lg:text-3xl">{monthString} {mainYear}</span>
      </div>
    </div>
  );
}