import { createContext, Dispatch, ReactNode, useContext, useState } from "react";
import { useReactTable,Table } from "@tanstack/react-table";


interface FilterContextType{
    rowSelection:Record<string,boolean>;
    setRowSelection:React.Dispatch<React.SetStateAction<Record<string,boolean>>>
    selectedTotal:number | string,
    setSelectedTotal:React.Dispatch<React.SetStateAction<number>>
    // table:Table<any>
}


const FilterContext = createContext<FilterContextType | undefined>(undefined);


export const useSelectedFilter = (): FilterContextType => {
    const context = useContext(FilterContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


const FilterProvider:React.FC<{children:ReactNode}>=({children})=>{

    const [rowSelection,setRowSelection]=useState({});
    const [selectedTotal,setSelectedTotal]=useState(0);
    return (
        <FilterContext.Provider value={{rowSelection,setRowSelection,selectedTotal,setSelectedTotal}}>
        {children}
        </FilterContext.Provider>
    )

}

export default FilterProvider;

