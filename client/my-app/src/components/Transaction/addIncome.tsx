
import React, {  useEffect, useState }  from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { MinusCircleIcon, Plus, PlusCircle, PlusCircleIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../@/components/ui/dialog";
import RouterForm from "../../context/reactrouterform";
import { useController, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage,Form } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { fetchTransactions, getAccountsName } from "../../api/apiRequest";
import { EnumDeclaration } from "typescript";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";

// enum Category {
//     Food='Food',
//     Rent='Rent',
//     Salary='Salary',
//     Entertainment='Entertainment',
//     BankFees="Bank Fees",
//     CoffeeShops="CoffeShops",
//     deposit="deposit",
//     Income="Income",
//     PaymentTransfer="Payment,Transfer",
//     Withdrawal="Withdrawal",
//     Travel="Travel",
//     PersonalCare='Personal Care',
//     Transportation='Transportation',
//     Resturants='Resturants',
// }

const Category=["Food","Rent"] as const ;

const formSchema=z.object({
    type:z.string({
     required_error:"type is required"
    }),
    category:z.enum(Category),
    amount:z.string({
        required_error:"amount is required",
        invalid_type_error:"amount must be a number"
    }),
    description:z.string().optional(),
    accountName:z.string()
 });



 export default function AddIncome(){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const navigate=useNavigate();
    const {category,name,setCategory,setName,setSearchParams,month,year}=useOutletContext<ContextType>()
    // const [data,setData]=useState<any | null>(null);
    const {isPending,error,data}=useQuery({
      queryKey:['accounts',token.access_token],
      queryFn:getAccountsName
    })
   
    
    

      
    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
            type:"expense",
            accountName:"",
            amount:"",
            description:""
            
            
            
            
       }
    });

    const {field}=useController({
        name:"accountName",
        control:form.control
    })

    
   async function onSubmit(values:z.infer<typeof formSchema>){
    console.log(values);

    if(!data){
      return null;
    }

    if(!values){
      console.log("we need values")
    }

    const amt=parseFloat(values.amount).toFixed(2);
    console.log(amt)
    const name=data.filter((item:any)=>item._id === values.accountName);

      // let name = values.accountName?._id!
      
     await axios.post("http://localhost:5000/api/transactions/create",{
        
         accountId:values.accountName,
         type:values.type,
         description:values.description,
         amount:amt,
         category:values.category,

      },{
        headers:{
          "Authorization":`Bearer ${token.access_token}`,
          "Content-Type":'application/x-www-form-urlencoded'
        }
      })
      
    
    }

   

    return (
       
        <Form {...form}>
        <Dialog>
        <DialogTrigger >
        <div className="flex flex-col gap-2 items-center">
        <Button onClick={()=>navigate(`transactions`,{replace:true})} className={buttonVariants({variant:"secondary",size:"icon",className:"rounded-full min-h-12 bg-green-200 "})}>
           <Plus color="white"  className="bg-green-600 rounded-full"/>
        </Button>
        <span className=" text-pretty font-semibold">Top up</span>
        </div>
        </DialogTrigger>
       <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transactions</DialogTitle>
        </DialogHeader>
        
        <RouterForm onSubmit={form.handleSubmit(onSubmit)} >
           <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">type</FormLabel>
              <FormControl >
                <Input   {...field} disabled />
              </FormControl>
            <FormMessage />
            </FormItem>
          )}
        />

           <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">categories</FormLabel>
             <Select onValueChange={field.onChange} >
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="choose a category"/>
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                <SelectItem value="Food">
                Food
              </SelectItem>
              <SelectItem value="Rent">
                Rent
              </SelectItem>     
              {/* {field && field.value?.map((item:any,index:any)=>{
                console.log(item)
                return (
                    <SelectItem  value={item}>
                        {item}
                    </SelectItem>

                )
              })} */}
              </SelectContent>
             </Select>
            <FormMessage />
            </FormItem>
          )}
           />
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">Amount</FormLabel>
              <FormControl >
                <Input   {...field} />
              </FormControl>
            <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">Amount</FormLabel>
              <FormControl >
                <Input   {...field} placeholder="write a note"/>
              </FormControl>
            <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">account</FormLabel>
             <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="select account Name"/>
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
              
                {isPending ? <div>Loading...</div>:
                  <>
                 {data && data.length !== 0  && data?.map((item:any)=>{
                    return (
                        <SelectItem key={item._id} id={item._id} value={item._id}>
                              {item.name}
                        </SelectItem>
                    )
                 })}
                 </>}
                  
              </SelectContent>
             </Select>
            <FormMessage />
            </FormItem>
          )}
           />

           <Button type="submit" className={buttonVariants({variant:"ghost",className:" bg-orange-400 mt-5 flex "})}>
             Add transaction
           </Button>
         </RouterForm>
       
       
       </DialogContent>
       </Dialog>
       </Form>
       
        
    )
}