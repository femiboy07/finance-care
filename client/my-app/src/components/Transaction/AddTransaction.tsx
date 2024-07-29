import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../@/components/ui/form';
import RouterForm from '../../context/reactrouterform';
import { Input } from '../../@/components/ui/input';
import { DayPicker } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../@/components/ui/select';
import { dataCategory } from '../../Pages/DashBoard/transactions';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { format, formatDate, formatISO, isValid, parse } from 'date-fns';
import { MutationKey, useMutation, useQuery } from '@tanstack/react-query';
import { createTransaction, getAccountsName } from '../../api/apiRequest';
import { queryClient } from '../..';
import { toast, useToast } from '../../@/components/ui/use-toast';
import { createPortal } from 'react-dom';










const formSchema=z.object({
    type:z.string({
        required_error:"pls type is required",
        message:"type is required"
    }).min(5,{message:"type required"}),
    date:z.string(z.date()),
    category:z.string({
      required_error:'category is required',
      message:'category needed'
    }).min(1,{message:'required'}),
    description:z.string({
      required_error:"description is required"
    }).min(1,{message:"required"}),
    amount:z.string({
      required_error:"amount is required"
    }).min(1,{message:"required"}).max(6,{message:"cannot exceed this limit"}).refine((val)=>{
      const number=parseFloat(val);
      if(Number.isNaN(number)){
        return false
      }
      return true

    },{message:'Not a number pls  input a number'}),

    accountId:z.string({
      required_error:"pls select account"
    }).min(5,{message:'account name is required'})
 });


export default function AddTransaction({setIsAddTransaction}:{setIsAddTransaction:any}){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
   
    const [showDate,setShowDate] =useState(false);
    const [month, setMonth] = useState(new Date());
    const divRef=useRef<HTMLDivElement | null>(null);
    const {toast}=useToast()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [newValue,setNewValue]=useState('');
    const type:string[]=["income","expense"];
    const {error,data}=useQuery({
        queryKey:['accounts',token.access_token],
        queryFn:getAccountsName
      })    
    const mutation=useMutation({
        mutationFn:createTransaction,
        onSuccess:()=>{

            queryClient.invalidateQueries({queryKey:['alltransactions']})
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            queryClient.invalidateQueries({ queryKey: ['latesttransaction'] })
      },
      onError:()=>{
        toast({
          description:"transaction succesfully created",
          variant:"destructive",
          className:"text-black h-24"
      }) 
      }
    })
    const currentDate:any=format(Date.now(),'PPP')
   
    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
        accountId:"",  
        type:type[0],
        date:currentDate,
        category:"",
        description:"",
        amount:"",
       
    },
    mode:"onSubmit"
  }) 

  // const [newValue,setNewValue]=useState(''); 
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
        //  setNewValue(parsedDate)
        setMonth(parsedDate);
      } else {
        setSelectedDate(undefined);
        setNewValue('')
      }
  }

  const handleOnClick=()=>{
      setShowDate(true);
  }

 async function handleOnSubmit(values:z.infer<typeof formSchema>){
    
       
        if(!values) return;
        
        const newamount=parseFloat(values.amount).toFixed(2)
        const parsed=parse(newValue,'MMMM do, y', new Date());
        // const defaultDate=parse(values.date,'MMMM do, y', new Date());
         const newValues={...values,amount:newamount,date:formatISO(parsed)}
         console.log(newValues)
       await mutation.mutateAsync({ queryKey: ['addtransaction', token.access_token], variable:newValues}).then((res)=>{
        
            new Promise((resolve)=>setTimeout(resolve,5000))
            setIsAddTransaction(false);
            toast({
              description:`transaction successfull`,
              className:"bg-green-500 text-white h-16"
          }) 
          
        }).catch((err)=>{
          setIsAddTransaction(false);
          toast({
            description:`${err.response.data.message} pls credit your account pls `,
            className:"text-white h-16",
            variant:"destructive"
        })
        })
        
        
        
     
      
      
     
  }

  const {isPending}=mutation;
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
         <RouterForm className=" bg-white w-full max-w-full p-[0rem] relative border-l flex flex-col md:w-[33%] md:max-w-[450px] lg:w-96  text-black " onSubmit={form.handleSubmit(handleOnSubmit)}>
          <div className="header text-black w-full pt-[2.5em]  px-6 text-2xl ">
             <h1 >Add Transaction</h1>
          </div> 
             <div className=" p-[1.5em] overflow-y-auto overflow-x-hidden scrollbar-widths flex-1    mt-3  ">
                
                <div className='mb-[1em] flex flex-col '>
                <div className=" form-header border px-[1em] space-y-4 mb-[24px] pt-[1em] rounded-md  pb-[1em]">
                 <h1 className='border-b'>Details</h1>
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
                        <SelectContent className=" z-[9999]"> 
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
                    <Input type='string' onClick={handleOnClick}  placeholder={value.toString()} onChange={handleFormatValue} className="bg-white"  value={newValue}     />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}  >
                  <FormControl>
                  <SelectTrigger className="bg-white">
                        <SelectValue  placeholder="select your category"/>
                    </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[11445] overflow-y-auto h-64 "> 
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
                    <Input type="string"  placeholder='write a note' className="bg-white"  {...field}/>
                   </FormControl>
                <FormMessage/>
                </FormItem>
              )}
                />
               <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">ACCOUNT NAME</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                  <SelectTrigger className="bg-white">
                        <SelectValue  placeholder="select your category"/>
                    </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[11445] "> 
                          {data && data?.map((item:any)=>(
                            <SelectItem key={item._id}  value={item._id}>
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
               </div>
             </div>

            

             <div className="close-button   pt-[1.5em] m-[1.5em] border-t flex items-center justify-between border-top    ">
             
               <Button  className={buttonVariants({variant:"default",className:"px-3  bg-orange-400 hover:bg-orange-500 "})} onClick={()=>setIsAddTransaction(false)}>
                 CLOSE
               </Button>
               <Button className="ml-auto" type='submit'>
               {isPending ? "Loading..." : "CREATE TRANSACTION"}
                </Button>
             
             </div>
        
         
        </RouterForm>
      
        </Form>
    )
}