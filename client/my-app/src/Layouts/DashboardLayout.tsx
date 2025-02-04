import React, { useEffect, useState } from "react";
import SideBar from "../components/common/sideBar";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/common/NavBar";
import { Toaster } from "../@/components/ui/toaster";
import { addMonths, subMonths } from "date-fns";
import { useInnerWidthState } from "../hooks/useInnerWidthState";
import MobileSideBar from "../components/common/mobileSideBar";
import useRequireAuth from "../hooks/useRequireAuth";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { AppDataProvider } from "../context/AppDataProvider";
import Banner from "../components/common/Banner";
import { createPortal } from "react-dom";
import UserLoggedOut from "../components/Modals/UserLoggedOut";
import ShowNetworkToast from "../components/common/ShowNetworkToast";
import useRefreshToken from "../hooks/useRefreshToken";
import { useLoading } from "../context/LoadingContext";




export type ContextType = {
  PrevMonth: () => any;
  NextMonth: () => any;
  monthString?: string;
  months: Date;
  month: any;
  nextMonth: any
  year: any;
  hideOver: any;
  setHideOver: any;
  setMonth: any;
  searchParams: any;
  setSearchParams: any;
  category: any;
  name: any;
  search: any;
  setCategory: any;
  setSearch: any
  setName: any;
  page: number;
  currentPage: number;
  setPage: any;
  setCurrentPage: any
  monthStrings: string;
  setMonthStrings: any;
  monthNames: string[]

}

export default function DashBoardLayout() {
  const today = new Date();
  const savedYear = localStorage.getItem("currentYear");
  const savedDay = localStorage.getItem("currentDay");

  // Initialize state based on saved values or default to the current date
  const initialDate = savedYear && savedDay
    ? new Date(parseInt(savedYear), parseInt(savedDay) - 1)
    : today;
  const nextMonth = addMonths(initialDate, 0);
  const [months, setMonth] = useState(nextMonth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState(searchParams.get('name') || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [hideOver, setHideOver] = useState(false);
  const [width] = useInnerWidthState();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(page);
  // const { setIsLoading } = useLoading()
  const { isLoading } = useRequireAuth();



  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const [open, setOpen] = useState(false);

  const handleOpenSideBar = () => {
    setOpen(true);
  }

  const monthString = monthNames[months.getMonth()];
  const [monthStrings, setMonthStrings] = useState(monthNames[months.getMonth()])

  function NextMonth() {
    setMonth(addMonths(months, 1));
  }

  function PrevMonth() {
    setMonth(subMonths(months, 1));
  }
  const year = months.getFullYear();
  const month = months.getMonth();







  return (

    <div className="min-h-full w-full flex  relative dark:bg-background bg-background " >
      {/* so this is for the side bar */}
      <NavBar handleOpenSideBar={handleOpenSideBar} />
      <SideBar setOpen={setOpen} open={open} />
      {width <= 1280 && <MobileSideBar open={open} setOpen={setOpen} />}
      <LoadingOverlay />
      <Banner />
      {/* {!isAppReady && <Banner />} */}
      {isLoading && createPortal(
        <UserLoggedOut />, document.body
      )}

      <div className={`flex flex-col h-full w-full mx-auto xl:ml-64 `}>
        <Outlet
          context=
          {{
            PrevMonth,
            NextMonth,
            months,
            nextMonth,
            monthString,
            month, year,
            setMonth,
            hideOver,
            setHideOver,
            searchParams,
            setSearchParams,
            category
            , name
            , setCategory
            , setName,
            setCurrentPage,
            setSearch,
            setPage,
            page,
            search,
            currentPage,
            monthStrings,
            setMonthStrings,
            monthNames
          } satisfies ContextType} />
        <Toaster />
      </div>
    </div>



  )
};