import React from "react";
import { Outlet } from "react-router-dom";
import { DataProvider } from "../context/DataProvider";






export default function AuthLayout() {
  return (
    <div className="w-full min-h-screen loading-banner flex flex-col justify-center items-center overflow-y-auto">
      <DataProvider>
        <Outlet />
      </DataProvider>
    </div>
  )
}