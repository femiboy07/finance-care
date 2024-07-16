import React from "react";
import { Input } from "../../@/components/ui/input";
import { SearchIcon } from "lucide-react";








export default function SearchTransactions(){
    return (
        <div className="search-container relative w-64 h-12 p-2 bg-white rounded-md flex-shrink-0   self-center ">
          <Input 
          type="text" 
          name="transaction" 
          placeholder="Search transactions..."
          className="absolute inset-0  w-full h-full pl-8 bg-white rounded-md"
          />
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-2 text-black" size={18} />
        </div>
    )
}