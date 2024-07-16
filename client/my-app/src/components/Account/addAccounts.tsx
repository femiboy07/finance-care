import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../@/components/ui/dialog";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import RouterForm from "../../context/reactrouterform";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { useToast } from "../../@/components/ui/use-toast";
import { previousSaturday } from "date-fns";
import { queryClient } from "../..";






const formSchema=z.object({
    name:z.string({
        required_error:"account name is required",
        message:""
    }),
    type:z.string({
        required_error:"account type is required",
    }),
    balance:z.string({
        required_error:"account balance needs to be inputed"
    }),
})


export default function AddAccounts(){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const [reveal,setReveal]=useState(false);
    const {toast}=useToast();
    const mutation=useMutation({
        mutationFn:(data:{name:string,type:string,balance:string})=>{
            return  axios.post("http://localhost:5000/api/account/create",data,{
                headers:{
                    "Authorization":`Bearer ${token.access_token}`,
                     "Content-Type":'application/x-www-form-urlencoded'
                }
            });
            
        },
        onSuccess:()=>{
              queryClient.invalidateQueries({queryKey:['allaccounts']})
        }
    })
     const  onHandleReveal=()=>{
        setReveal((prev)=>!prev);
    }

    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
            name:"",
            type:"",
            balance:"",}
    });

    const onSubmit=async(values:z.infer<typeof formSchema>)=>{
           console.log(values);
         try{
         await mutation.mutateAsync(values);
         }catch(error){
           console.log(error)
         }finally{
            new Promise((resolve)=>setTimeout(resolve,5000))
            setReveal(false)
            toast({
                title:"New account",
                description:"new assets added",
                className:"text-black bg-white"
            })
         }
    }

    return (
        <Form {...form}>
        <Dialog open={reveal} onOpenChange={onHandleReveal}>
          <DialogTrigger asChild>
          <Button className={buttonVariants({variant:"default",className:" bg-orange-400"})}>Add accounts</Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-sm ">
            
            <DialogHeader>
               <DialogTitle> Add Account</DialogTitle>
            </DialogHeader>
            <RouterForm onSubmit={form.handleSubmit(onSubmit)} >
            <div className="flex w-full gap-2"> 
            <FormField
            
            control={form.control}
            name="name"
            render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">Account Name</FormLabel>
              <FormControl >
                <Input   {...field} placeholder="Account Name..." />
              </FormControl>
            <FormMessage />
            </FormItem>
          )}
        />

            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">Account Type</FormLabel>
              <FormControl >
                <Input   {...field} placeholder="acc type" />
              </FormControl>
            <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">Account Balance</FormLabel>
              <FormControl >
                <Input   {...field} placeholder="input account balance..." />
              </FormControl>
            <FormMessage />
            </FormItem>
          )}
        />
        <Button className={buttonVariants({variant:"default",className:" bg-orange-400 mt-7 "})} type="submit">
         {mutation.isPending ? 'Creating acc...' : "create Account"}
        </Button>
            </RouterForm>
          </DialogContent>
        </Dialog>
        </Form>
    )
}