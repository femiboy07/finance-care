import { Select, SelectContent, SelectTrigger } from "../../@/components/ui/select";
import SelectAccount from "../Transaction/selectAccount";





export default function SearchFilterSkeleton(){
    return (
        <div className="filters-searches max-w-full w-full animate-pulse ">
        <div className=" shadow-md rounded-md bg-slate-100 h-24  flex items-center px-3">
         <div className="search-container  relative w-64 min-h-12 p-2 bg-slate-100 rounded-md flex-shrink-0   self-center "></div>
         <div className="ml-auto animate-pulse  flex items-center">
                <Select>
                 <SelectTrigger className="w-[180px] ml-2 h-12  bg-slate-100">
                 {/* <SelectValue/> */}
                      <SelectContent className=" h-36 overflow-y-auto bg-slate-100"> 
                      </SelectContent>
                   </SelectTrigger> 
                 </Select>
                 </div>
        </div>
      </div>
    )
}