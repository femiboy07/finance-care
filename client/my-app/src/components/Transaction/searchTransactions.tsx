import React, { useState } from "react";
import { Input } from "../../@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";








export default function SearchTransactions({ clearFilter }: { clearFilter: () => void }) {
  const { search, setSearch } = useOutletContext<ContextType>();
  const [searchColor, setSearchColor] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target) {
      setSearchColor(true)
    }
    if (e.target.value === '') {
      clearFilter()
    }
    setSearch(e.target.value);

  }
  return (
    <div className="search-container relative font-custom font-normal self-start shadow-xl sm:[450]:w-full lg:w-64 min-h-9 p-2 bg-card dark:bg-card outline-gray-400 border-gray-500 rounded-md flex-shrink-0   ">
      <input
        type="text"
        autoComplete="off"
        value={search}
        autoCapitalize="off"
        name="transaction"
        onChange={handleChange}
        onBlur={() => setSearchColor(false)}
        onFocus={() => setSearchColor(true)}
        placeholder="Quick Search..."
        className="absolute inset-0  w-full  border focus:transition-colors ease-in-out duration-100   focus-within:border-orange-400 placeholder:text-orange-400 placeholder:font-semibold outline-none border-slate-100  h-full pl-8 dark:bg-card text-foreground "
      />
      <SearchIcon className={`absolute ${searchColor ? 'text-orange-400 font-bold' : 'text-slate-300'}   top-1/2 -translate-y-1/2 left-2`} size={18} />
    </div>
  )
}