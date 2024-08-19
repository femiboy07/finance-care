import {Backpack, BarChart2Icon, BarChart4Icon, IndentDecrease, LayoutDashboardIcon, LogOutIcon, LucideTerminalSquare, PiggyBankIcon, WalletMinimalIcon, } from "lucide-react";
import React from "react";
import { Link, NavLink} from "react-router-dom";
import CustomNavLinks from "./CustomNavLinks";
import peerIcon from "../../assets/peercoin.png"





export default function SideBar({open,setOpen}:{open:boolean,setOpen:any}){
  

    return(
        
        <div  style={{height:`100%`}} className={` hidden   xl:fixed shadow-md   lg:flex-col  border-black w-64     justify-between rounded-bl-lg  z-50 bg-white text-black pb-5  overflow-y-auto       xl:flex  left-0   bottom-0 `}>
             <div className="h-16 w-full  left-[12px]  border-black bg-white   p-[18px] flex  gap-2 items-center">
             <div className=" relative w-10 h-10">
             <img src={peerIcon} alt="my-img" className="absolute  inset-0"/>
            </div>
             <span className="block  font-mono">TrackKIT</span>
           </div>
            <div className=" flex-[1_1_auto] p-[12px] w-full space-y-2  mt-5 mb-auto " id="sections">
            <div className="items px-3 rounded-md">
           <CustomNavLinks to='/dashboard' title="dashboard" >
              <>
              <LayoutDashboardIcon  className="mr-[24px]" />
              <span className="">Dashboard</span>
              </>
           </CustomNavLinks>
            
           </div>
           <div className="items px-3">
           <NavLink   title="budgets"   className={({ isActive, isPending, isTransitioning }) =>
            [
            isPending ? "" : "",
            isActive ? "text-orange-300" : "",
            isTransitioning ? "" : "",
           ].join(`min-h-[40px]  px-3  py-2  rounded-md cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
            }  to={`budgets`}   >
            {({ isActive  }) => (
                  <>
                   <WalletMinimalIcon  className="mr-[24px]" />
                   <span className="  ">Budgets</span>
                 </>
            )}
             </NavLink>
            </div>
          <div className="items px-3">
          <NavLink   title="accounts"   className={({ isActive, isPending, isTransitioning }) =>
            [
            isPending ? "" : "",
            isActive ? "text-orange-300" : "",
            isTransitioning ? "" : "",
           ].join(`min-h-[40px]  px-3  py-2  rounded-md cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
            }  to={`transactions`}   >
            {({ isActive  }) => (
                  <>
                   <IndentDecrease  className="mr-[24px]" />
                   <span className="  ">transactions</span>
                 </>
            )}
             </NavLink>
            </div>
      
            <div className="items px-3">
            <NavLink   title="accounts"   className={({ isActive, isPending, isTransitioning }) =>
            [
            isPending ? "" : "",
            isActive ? "text-orange-300" : "",
            isTransitioning ? "" : "",
           ].join(`min-h-[40px]  px-3  py-2  rounded-md cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
            }  to={`accounts`}   >
            {({ isActive  }) => (
                  <>
                   <PiggyBankIcon  className="mr-[24px]" />
                   <span className="  ">Accounts</span>
                 </>
            )}
             </NavLink>
            </div>
            <div className="items px-3">
            <NavLink   title="accounts"   className={({ isActive, isPending, isTransitioning }) =>
            [
            isPending ? "" : "",
            isActive ? "text-orange-300" : "",
            isTransitioning ? "" : "",
           ].join(`min-h-[40px]  px-3  py-2  rounded-md cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
            }  to={`visualization`}   >
            {({ isActive  }) => (
                  <>
                   <BarChart4Icon  className="mr-[24px]" />
                   <span className="  ">Visualization</span>
                 </>
            )}
             </NavLink>
            </div>
            </div> 

            <div id="footer" className="flex-shrink-0  p-[12px] ">
              <hr/>
          

              <div className="items mt-2  px-3">
             <NavLink   title="accounts"   className={({ isActive, isPending, isTransitioning }) =>
            [
            isPending ? "" : "",
            isActive ? "text-orange-300" : "",
            isTransitioning ? "" : "",
           ].join(`min-h-[40px]  px-3  py-2  rounded-md cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
            }  to='/login'   >
            {({ isActive  }) => (
                  <>
                   <LogOutIcon  className="mr-[24px]" />
                   <span className="  ">LogOut</span>
                 </>
            )}
             </NavLink>

              </div>
            </div> 
           
        </div>
       
      
    )
}
