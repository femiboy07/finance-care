import React from "react";
import { Input } from "../../@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";








export default function SearchTransactions(){
  const {search,setSearch}=useOutletContext<ContextType>();

  const handleChange=()=>{

  }
    return (
        <div className="search-container relative w-64 min-h-12 p-2 bg-white rounded-md flex-shrink-0   self-center ">
          <input 
          type="text" 
           autoComplete="off"
           value={search}
           autoCapitalize="off"
           name="transaction" 
           onChange={(e)=>setSearch(e.target.value)}
           placeholder="Quick Search..."
          className="absolute inset-0  w-full  border outline-none border-slate-100  h-full pl-8      bg-white "
          />
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-2 text-slate-300" size={18} />
        </div>
    )
}