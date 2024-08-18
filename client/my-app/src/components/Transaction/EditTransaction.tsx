import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogTrigger } from "../../@/components/ui/dialog";
import RouterForm from "../../context/reactrouterform";
import z from 'zod';
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { DayPicker } from "react-day-picker";
import { format, formatISO, isValid, parse } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { dataCategory } from "../../Pages/DashBoard/transactions";
import DeleteTransactionButton from "./DeleteTransaction";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAccountsName, updateTransaction } from "../../api/apiRequest";
import { queryClient } from "../..";
import { useToast } from "../../@/components/ui/use-toast";
import { FileDiff } from "lucide-react";






const formSchema=z.object({
    date:z.string(z.date()),
    type:z.string(),
    category:z.string(),
    description:z.string().optional(),
    amount:z.string(),
    // status:z.string(),
    accountId:z.string()
 }).refine((data)=>{
  const parsedDate = parse(data.date,'PPP' , new Date());

  // Check if the parsed date is valid
  return isValid(parsedDate);
 },{
  message:"Invalid date",
  path:['date']

 });;



export default function EditTransaction({transaction,closeSideBar}:{transaction:any,closeSideBar:any}){
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
       
        const [showDate,setShowDate] =useState(false);
        const {toast}=useToast();
        const [month, setMonth] = useState(new Date());
        const status:string[]=["cleared","pending"]
        const type:string[]=["income","expense"];
        const divRef=useRef<HTMLDivElement | null>(null)
        const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
        const {error,data}=useQuery({
          queryKey:['accounts',token.access_token],
          queryFn:getAccountsName
        }) 
        const mutation=useMutation({
          mutationFn:updateTransaction,
          onSuccess:()=>{
              queryClient.invalidateQueries({queryKey:['alltransactions']})
              queryClient.invalidateQueries({queryKey:['editTransactionsmobile']})
              queryClient.invalidateQueries({ queryKey: ['accounts'] })
              queryClient.invalidateQueries({queryKey:['allaccounts']})
        }
      })
      const {isPending}=mutation;
    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
        date:format(transaction.date,'PPP'),
        type:transaction.type,
        category:transaction.category,
        description:transaction.description,
        amount:transaction.amount.$numberDecimal,
         accountId:transaction.accountId,
    },
    mode:"onChange"
  })

  const [newValue,setNewValue]=useState(''); 
const handleDayPickerSelect = (date: Date | undefined) => {
  if (!date) {
    setNewValue("");
    setSelectedDate(undefined);
  } else {
    setSelectedDate(date);
    setMonth(date);
    setNewValue(format(date, "PPP"));
  }
};

const handleFormatValue=(e:React.ChangeEvent<HTMLInputElement>)=>{
     setNewValue(e.target.value);
    
    const parsedDate = parse(e.target.value, "PPP", new Date());
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
      form.setValue('date',e.target.value)
      //  setNewValue(parsedDate)
      // setMonth(parsedDate);
    } else {
      setSelectedDate(undefined);
      setNewValue('')
    }
}
const originalValuesRef = useRef(form.formState.defaultValues);
  
 


const handleOnSubmit=async(values:z.infer<typeof formSchema>)=>{
   
  try{
    const newamount=parseFloat(values?.amount).toFixed(2);
    const parsed=parse(newValue,'MMMM do, y', new Date());
    const defaultDate=parse(values.date,'MMMM do, y', new Date());
   
    const newValues={...values,amount:newamount,date: newValue === '' ? formatISO(defaultDate) : formatISO(parsed)}
   await mutation.mutateAsync({ queryKey: ['editTransaction', token.access_token], variable:newValues,id:transaction._id});
  }catch(err){
    toast({
      description:"cannot update ryt now",
      variant:"destructive"
    })
    console.log(err);
  }finally{
   new Promise((resolve)=>setTimeout(resolve,5000))
   closeSideBar()
   toast({
       description:"transaction sucessfully updated",
       className:"text-black bg-white"
      })
  }
}
const handleOnClick=()=>{
    setShowDate(true);
    


}

const handleClickOutside = (event:any) => {
  if (divRef.current && !divRef.current.contains(event.target)) {
    setShowDate(false);
  }
};


useEffect(() => {
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
},[])
    return (
      <Form {...form}>
        <RouterForm className="bg-white h-full w-full mb-20  text-black relative" onSubmit={form.handleSubmit(handleOnSubmit)}>
          <div className="header text-black w-full pt-5 text-2xl ">
             <h1>Transaction Details</h1>
          </div> 
        
         
                <div className="border h-fit  py-3 w-full px-3 mt-3 space-y-4 ">
                 <div className=" form-header flex justify-between pt-2">
                    <span>Details</span>
                    <span className="text-green-600">Cleared</span>
                 </div>
                 <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">TYPE</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} >
                  <FormControl>
                  <SelectTrigger className="bg-white">
                        <SelectValue  placeholder="income or expense" />
                    </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[11445]"> 
                          {type?.map((item:string)=>(
                            <SelectItem key={item}  value={item}>
                                {item}
                            </SelectItem>
                          ))}  
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                 </FormItem>
              )}
                />
                <FormField
                control={form.control}
                name="date"
                render={({ field:{onChange,value}}) => (
                <FormItem >
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">DATE</FormLabel>
                  <FormControl>
                    <Input type="string" onClick={handleOnClick} placeholder={value.toString()} onChange={handleFormatValue} className="bg-white"  value={newValue}     />
                   </FormControl>
                <FormMessage/>
                </FormItem>
              )}
                /> 
                 {showDate && (
                     <div className=" relative  w-full  " ref={divRef}>
                        <DayPicker 
                        mode="single"
                        onMonthChange={setMonth}
                        
                        month={month}
                        className=" absolute left-1/2  -translate-x-1/2 bg-white rounded-md shadow-md "
                        selected={selectedDate}
                        onSelect={handleDayPickerSelect}
                        />
                        </div>
                    )}
                 <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">CATEGORY</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                  <SelectTrigger className="bg-white">
                        <SelectValue  placeholder="select your category"/>
                    </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[11445] overflow-y-auto h-64"> 
                          {dataCategory && dataCategory?.map((item:string)=>(
                            <SelectItem key={item}  value={item}>
                                {item}
                            </SelectItem>
                          ))}  
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                 </FormItem>
              )}
                />
                 <FormField
                control={form.control}
                name="amount"
                render={({ field}) => (
                <FormItem >
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">AMOUNT</FormLabel>
                  <FormControl>
                    <Input type="string" className="bg-white"  {...field}   />
                   
                  </FormControl>
                <FormMessage/>
                </FormItem>
              )}
                />

                  <FormField
                control={form.control}
                name="description"
                render={({ field}) => (
                <FormItem >
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">DESCRIPTION</FormLabel>
                  <FormControl>
                    <Input type="string"  defaultValue={field.value} className="bg-white"   {...field}  />
                   </FormControl>
                <FormMessage/>
                </FormItem>
              )}
                />
{/* 
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">STATUS</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue  placeholder={field.value}/>
                  </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[11445] overflow-y-auto "> 
                          {status && status?.map((item:string)=>(
                            <SelectItem key={item}  value={item}>
                                {item}
                            </SelectItem>
                          ))}  
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                 </FormItem>
              )}
                /> */}
                  <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">ACCOUNT NAME</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} >
                  <FormControl>
                  <SelectTrigger className="bg-white">
                        <SelectValue  placeholder="select your category"/>
                    </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[11445] "> 
                          {data && data?.map((item:any,index:any)=>(
                            <SelectItem key={index}  value={item._id}>
                                {item.name}
                            </SelectItem>
                          ))}  
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                 </FormItem>
              )}
                />
             </div>

             <div className="transactions-button  mt-3 mb-5 px-3 h-64  py-3">
                <div >
                  I want to...
                </div>
                <div className="space-buttons mt-5">
                 <DeleteTransactionButton transactionId={transaction._id} closeSideBar={closeSideBar} icon={true} />
                </div>
               
             </div>

             <div className="close-button  sticky bottom-0 py-5 bg-white  px-3  right-3    border-top  z-[78555]  ">
              <hr/>
              <div className="mt-5  flex justify-between">
               <Button onClick={closeSideBar} className={buttonVariants({variant:"default",className:"px-3  bg-orange-400 hover:bg-orange-500"})}>
                 CLOSE
               </Button>
               {(form.formState.isDirty || newValue) && <Button className="" type="submit">
                {isPending ? "Loading..." : "SAVE"}
                </Button>}
              </div>
             </div>
          
         
        </RouterForm>
        </Form>
    )
}