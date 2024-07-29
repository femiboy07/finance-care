import React from "react";
import { Input } from "../../@/components/ui/input";
import { SearchIcon } from "lucide-react";








export default function SearchTransactions(){
    return (
        <div className="search-container relative w-64 min-h-12 p-2 bg-white rounded-md flex-shrink-0   self-center ">
          <input 
          type="text" 
           autoComplete="off"
           autoCapitalize="off"
           name="transaction" 
           placeholder="Search transactions..."
          className="absolute inset-0  w-full border-l-0 border-r-0 border-t-0 border-b-2 border-b-black  h-full pl-8  outline-none    bg-white "
          />
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-2 text-black" size={18} />
        </div>
    )
}