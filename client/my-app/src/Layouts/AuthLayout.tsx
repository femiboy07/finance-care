import React from "react";
import { Outlet } from "react-router-dom";






export default function AuthLayout(){
    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center overflow-y-auto">
          <Outlet/>
        </div>
    )
}