import React from "react";
import { Input } from "../../@/components/ui/input";
import { BellRingIcon, CircleUserRoundIcon, DivideIcon, LucideBell, SearchIcon, UserCircleIcon } from "lucide-react";
import peerIcon from "../../assets/peercoin.png"
import { useInnerWidthState } from "../../hooks/useInnerWidthState";





export default function NavBar(){
  const [width]=useInnerWidthState();
    return (
        <div className="w-full h-16  z-[42] bg-background  fixed  text-black">
          <div className=" flex w-full h-full items-center "> 
            {/* <div className="h-full w-20 sticky lg:w-64  border-black bg-white   pl-[18px]   flex gap-2 items-center">
             <div className=" relative  w-12 h-12">
             <img src={peerIcon} alt="my-img" className="absolute inset-0"/>
            
             </div>
             <span className="lg:block hidden font-mono">TrackKIT</span>

           </div> */}
           {width <= 1025 ? (
            <div className="toggle-bar ">
              <div className="bar1"></div>
              <div className="bar2"></div>
              <div className="bar-3"></div>
            </div>
           ):null}
            <div className=" ml-auto flex h-full border-b items-center justify-end pr-5 text-black flex-1  ">
               <div className="search-bar relative w-64 rounded-full  min-h-12 pr-18">
                  <Input type="text" placeholder="Search" className="absolute inset-0 pl-8 bg-gray-300  opacity-45 rounded-full  h-full "/>
                  <SearchIcon size={18} className="absolute top-1/2 -translate-y-1/2 left-2  text-black"/>
               </div>
               <div className="flex pl-5 items-center">
                 <BellRingIcon size={25} className="after:border-r-2 divide-cyan-300 flex mr-2 after:border-black  "/>
                 <div className=" divide-y-4 divide-x-reverse"></div>
                 <CircleUserRoundIcon size={25}/>
               </div>
            </div>
            </div>
        </div>
    )
}