import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { ArrowBigRightDash, ArrowDownRightIcon, LucideArrowLeftToLine, MoveLeft, MoveLeftIcon, MoveRightIcon } from 'lucide-react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';
import { useSelectedFilter } from '../../context/TableFilterContext';
import { useBudget } from '../../context/BudgetContext';



export default function MonthPicker({ params, page, setPage, monthStrings }: { params: any, page: number, setPage: any, monthStrings: string }) {
  const { PrevMonth, NextMonth, monthString, month, year, setMonthStrings } = useOutletContext<ContextType>();
  const { updateQueryParams } = useBudget()
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.includes('budgets') ? 'budgets' : 'transactions';
  const convert = useMemo(() => month + 1 > 0 && month + 1 <= 9 ? `0${month + 1}` : `${month + 1}`, [month]);
  const mainYear = localStorage.getItem('currentYear');

  useEffect(() => {
    localStorage.setItem("currentYear", year.toString());
    localStorage.setItem("currentDay", convert);
  }, [convert, year]);

  useEffect(() => {
    // PrevMonth();
    // NextMonth()

  }, [PrevMonth, NextMonth])

  // let queryParams = new URLSearchParams(params).toString();
  const handlePrevClick = useCallback(() => {
    PrevMonth();
    setPage(1);
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    const queryParams = new URLSearchParams(params).toString();
    navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`);
    updateQueryParams(params)


  }, [PrevMonth, setPage, path, year, convert, params, navigate, updateQueryParams]);

  const handleNextClick = useCallback(() => {
    NextMonth();
    setPage(1);
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    const queryParams = new URLSearchParams(params).toString();
    navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`);
    updateQueryParams(params)
  }, [NextMonth, setPage, path, year, convert, params, navigate, updateQueryParams]);

  useEffect(() => {
    if (year && month) {
      const targetPath = `/dashboard/${path}/${year}/${convert}`;
      const queryParams = new URLSearchParams(params).toString();
      navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`);

    }
  }, [navigate, path, convert, year, month, params]);


  useEffect(() => {
    const targetPath = `/dashboard/${path}/${year}/${convert}`;
    const queryParams = new URLSearchParams(params).toString();


    navigate(`${targetPath}${queryParams ? `?${queryParams}` : ''}`);

  }, [convert, navigate, params, path, year, month])
  return (
    <div className='flex py-5 items-center text-black'>
      <div className="date-controls-button flex gap-1">
        <Button onClick={handlePrevClick} className={buttonVariants({ className: 'rounded-[100%] py-7 bg-transparent hover:bg-slate-200 px-3 text-black' })}><MoveLeftIcon /></Button>
        <Button onClick={handleNextClick} className={buttonVariants({ className: 'rounded-[100%] py-7 bg-transparent hover:bg-slate-200  px-3 text-black' })}><MoveRightIcon /></Button>
      </div>
      <div className="date-picker date-title ml-2">
        <span className="text-slate-700 font-bold text-lg lg:text-3xl">{monthString} {mainYear}</span>
      </div>
    </div>
  );
}