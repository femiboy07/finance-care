import React from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../@/components/ui/dialog";
import { deleteTransaction } from "../../api/apiRequest";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../..";
import {  useToast } from "../../@/components/ui/use-toast";







export default function DeleteTransactionButton({transactionId,closeSideBar}:{transactionId:string,closeSideBar:any}){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const {toast}=useToast()
    const mutation=useMutation({
        mutationFn:deleteTransaction,
        // mutationKey:['delete',token.access_token,{transactionId}],
        onSuccess:()=>{
              queryClient.invalidateQueries({queryKey:['alltransactions']})
        }
    })

    const {isPending,isSuccess}=mutation;

   

    const handleDelete=async(tokens:string,transaction:string)=>{
    try{
    await mutation.mutateAsync({queryKey:tokens,variable:transaction});

    }catch(err){
      console.log(err);
    }finally{
            new Promise((resolve)=>setTimeout(resolve,5000))
            closeSideBar()
            toast({
                
                description:"transaction sucessfull deleted",
                className:"text-black bg-white"
            })
         }
    }

    return (
        <Dialog >
         <DialogTrigger asChild  >   
        <Button className={buttonVariants({variant:"default",className:'bg-red-700 hover:bg-red-500 w-full hover:-translate-y-2 hover:transition-all hover:delay-300 '})}>
            DELETE THIS TRANSACTION
        </Button>
        </DialogTrigger>
        <DialogContent  className="px-0">
            <DialogHeader className="px-3">
                <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
        <DialogDescription className="px-3 h-full">
            Are you sure you want to delete this transaction
        </DialogDescription>
         {/* <DialogFooter className=" border-t h-full w-full "> */}
             <div className="flex  h-14 justify-center  border-t items-center px-3 gap-2 ">
             <DialogClose className={buttonVariants({variant:"outline",className:" border-orange-400"})}>
               NO,CANCEL
              </DialogClose>
              <Button className={buttonVariants({variant:"default",className:"bg-red-600"})} onClick={()=>handleDelete(token.access_token,transactionId)}  >
               {isPending ? "Loading..." : 'YES DELETE'}
              </Button>
              </div>
        {/* </DialogFooter> */}
        </DialogContent>
       
        </Dialog>
    )
};