import { Backpack, BanknoteIcon, BarChart2Icon, LayoutDashboardIcon, LogOutIcon, LucideTerminalSquare, PercentCircleIcon, Settings2Icon, XIcon } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import CustomNavLinks from "./CustomNavLinks";
import { useInnerWidthState } from "../../hooks/useInnerWidthState";
import peerIcon from "../../assets/peercoin.png"






export default function MobileSideBar({open,setOpen}:{open:boolean,setOpen:any}){

 const [width]=useInnerWidthState();


  return(
      <div  style={{height:`100%`}} className={` transition-opacity  duration-1000  ${open ? 'fixed  opacity-100' : 'hidden  translate-x-1/2'} shadow-md   flex-col  border-black w-64     justify-between rounded-bl-lg  z-50 bg-white text-black pb-5  overflow-y-auto       flex  left-0   bottom-0 `}>
           <div className="h-16 w-full  left-[12px]  border-black bg-white   p-[18px] flex  gap-2 items-center">
           <div className=" relative w-10 h-10">
           <img src={peerIcon} alt="my-img" className="absolute  inset-0"/>
            </div>
            {/* <div className="w-full relative h-10">
            <XIcon className="absolute right-0 top-1/2 -translate-y-1/2"/>
            </div> */}
           <span className="block  font-mono">TrackKIT</span>
           <button onClick={()=>setOpen(false)} className="absolute min-h-[45px] min-w-[45px] right-5 flex justify-center items-center bg-transparent">
           <XIcon className="self-center"/>
           </button>
           
         </div>
        
        
          <div className=" flex-[1_1_auto] p-[12px] w-full space-y-2  mt-5 mb-auto " id="sections">
          <div className="items px-3 rounded-md">
               <CustomNavLinks title="dashboard"  to="/dashboard">
                <>
                <LayoutDashboardIcon className={`mr-[24px]`} />
                <span className={``}>Dashboard</span>
                </>
               </CustomNavLinks>
          </div>
         
          <div className="items px-3">
         
          <NavLink  title="budget"  className={({ isActive, isPending, isTransitioning }) =>
          [
          isPending ? "" : "",
          isActive ? "text-orange-300" : "",
          isTransitioning ? "" : "",
         ].join(`min-h-[40px]  px-3  py-2  cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
          }  to={`budget`}   >
            {({ isActive  }) => (
                <>
                 <Backpack  color={`${isActive ? 'orange':'black'}`}   className="mr-[24px]" />
                 <span className="  ">Budgets</span>
               </>
            )}
          </NavLink>
          </div>
    
          <div className="items px-3">
         
          <NavLink   title="transaction" reloadDocument={true}  className={({ isActive, isPending, isTransitioning }) =>
          [
          isPending ? "" : "",
          isActive ? "text-orange-300" : "",
          isTransitioning ? "" : "",
         ].join(`min-h-[40px]  px-3  py-2  rounded-md cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600':''} `)
          }  to={`/dashboard/transactions`}   >
              
            
              {({ isActive  }) => (
                <>
                 <LucideTerminalSquare  className="mr-[24px]" />
                 <span className="  ">Transactions</span>
               </>
              )}
            </NavLink>
          </div>
    
          <div className="items px-3">
               <CustomNavLinks  title="accounts"  to="/dashboard/accounts">
               <>
              <BanknoteIcon className="mr-[24px]"/>
              <span className="">Accounts</span>
              </>
              </CustomNavLinks>
          </div>
          <div className="items px-3">
               <CustomNavLinks  title="visualization"  to="/dashboard/visualization">
               <>
              <BarChart2Icon className="lg:mr-[24px]" />
              <span className=" ">Visualization</span>
              </>
              </CustomNavLinks>
          </div>
          </div> 

          <div id="footer" className="flex-shrink-0  p-[12px] ">
            <hr/>
          <div className="items px-3">
               <Link  title="Overview" className=" min-h-[40px]  cursor-pointer flex items-center w-full lg:justify-start justify-center " to="/dashboard">
              <Settings2Icon className=" text-black mr-[24px]"/>
              <span className="">Settings</span>
              </Link>
          </div>

            <div className="items  min-h-[40px] px-3">
            <Link  title="Overview" className=" min-h-[40px]  cursor-pointer flex items-center w-full lg:justify-start justify-center " to="/dashboard">
              <LogOutIcon className=" text-black mr-[24px]"/>
              <span className=" ">LogOut</span>
                   
              </Link>

            </div>
          </div> 
         
      </div>
  )
}
