import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../@/components/ui/table"



export default function TransactionSkeleton(){
    return (
 <div className=" px-5 py-4 mt-5 bg-gray-200 rounded-md animate-pulse h-64">
      <Table className=" border-separate [&_tc]:border-collapse md:table-auto table-fixed   border-0 border-spacing-y-2  ">
        <TableHeader className=" ">
          
            <TableRow  className="[&_tr:first-child]:border-collapse">
        
            </TableRow>
          
        </TableHeader>
        <TableBody className="border border-black">
       <TableRow className="border-l-2 py-4 border-separate">
        <TableCell className="">
                   
        </TableCell>
                 
                
              </TableRow>
            </TableBody>
      </Table>
    </div> 
    )
}