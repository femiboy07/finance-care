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
import { format, formatISO, isBefore, isValid, parse } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createBudget, createTransaction, getAccountsName } from '../../api/apiRequest';
import { queryClient } from '../..';
import {  useToast } from '../../@/components/ui/use-toast';







const removeOrdinalSuffix = (dateString:any) => {
  return dateString.replace(/(\d+)(st|nd|rd|th)/g, '$1');
};


function isValidDate(dateString:any,formatString:any) {
  // Parse the date string according to the given format
  const parsedDate = parse(dateString, formatString, new Date());

  // Check if the parsed date is valid
  return isValid(parsedDate);
}

const MyEnum = ['monthly', 'yearly', 'custom'];


const formSchema=z.object({
   period:z.string(z.enum(["monthly","yearly","custom"])),
   category:z.string({
      required_error:'category is required',
      message:'category needed'
    }).min(1,{message:'required'}),
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
    }).min(5,{message:'account name is required'}),
    startDate:z.string(z.date()).optional(),
    endDate:z.string(z.date()).optional(),
 }).refine((data) => {
    // Check if startDate and endDate are both defined
    const { startDate, endDate } = data;

  if (startDate  && endDate ) {
    const dateFormat = 'MMMM d, yyyy';
   

    if (!isValidDate(startDate,dateFormat) || !isValidDate(endDate,dateFormat)) {
      return false;
    }

    return isBefore(startDate,endDate)
  }

  return true;
    // Return true if dates are not both defined (optional)

}, {
  path:["startDate"],
  message: 'Start date must be before end date',
    
    
  });


export default function AddBudgets({setIsAddBudget}:{setIsAddBudget:any}){
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const [showStartDate,setShowStartDate] =useState(false);
    const [showEndDate,setShowEndDate]=useState(false)
    const [month1, setMonth1] = useState(new Date());
    const [month2, setMonth2] = useState(new Date());
    const divRef=useRef<HTMLDivElement | null>(null);
    const {toast}=useToast()
    const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
    const [newStartValue,setStartNewValue]=useState('');
    const [newEndValue,setEndNewValue]=useState('');
    const type:string[]=["yearly","monthly","custom"];
    const {error,data}=useQuery({
        queryKey:['accounts',token.access_token],
        queryFn:getAccountsName
      })    
    const mutation=useMutation({
        mutationFn:createBudget,
        onSuccess:()=>{
          queryClient.invalidateQueries({queryKey:['allBudgets']})
           
      },
      onError:(err)=>{
        toast({
          description:`budget ${err} succesfully created`,
          variant:"destructive",
          className:"text-black h-24"
      }) 
      }
    })
    const currentDate:any=format(Date.now(),'MMMM d, yyyy');

    
   
    const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
        accountId:"",  
        period:'',
        category:"",
        amount:"",
        startDate:"",
        endDate:""
       
    },
    mode:"onSubmit"
  }) 

  // formSchema.refine((data)=>{

  // })

  
  const period=form.watch('period');

  
  const handleDayPickerSelectOne = (date: Date | undefined) => {
    if (!date) {
      setStartNewValue("");
      setSelectedStartDate(undefined);
    
    } else {
      setSelectedStartDate(date);
     
      setMonth1(date);
      form.setValue('startDate',format(date,"MMMM d, yyyy"));
      setStartNewValue(format(date, "MMMM d, yyyy"));
    }
  };

  const handleDayPickerSelectTwo = (date: Date | undefined) => {
    if (!date) {
      setEndNewValue("");
    
      setSelectedEndDate(undefined)
    } else {
    
      setSelectedEndDate(date);
      setMonth2(date);
      form.setValue('endDate',format(date,"MMMM d, yyyy"));
      setEndNewValue(format(date, "MMMM d, yyyy"));
    }
  };
  
  const handleFormatValue=(e:React.ChangeEvent<HTMLInputElement>)=>{
       setStartNewValue(e.target.value);
       form.setValue('startDate',e.target.value)
    
      const parsedDate = parse(e.target.value, "MMMM d, yyyy", new Date());
      if (isValid(parsedDate)) {
        setSelectedStartDate(parsedDate);
       
      } else {
        setSelectedStartDate(undefined);
       
        setStartNewValue('');
       
      }
  }

  const handleFormatValue2=(e:React.ChangeEvent<HTMLInputElement>)=>{
    // setStartNewValue(e.target.value);
   setEndNewValue(e.target.value)
   form.setValue('endDate',e.target.value)
   const parsedDate = parse(e.target.value, "MMMM d, yyyy", new Date());
   if (isValid(parsedDate)) {
    
     setSelectedEndDate(parsedDate)
    
   } else {
    
     setSelectedEndDate(undefined);
    
     setEndNewValue("");
   }
}

  const handleOnClick=(name:string)=>{
    if(name === 'startDate'){
      setShowStartDate(true);
      return;
    }

    if(name === 'endDate'){
        setShowEndDate(true);
        return;
    }

  }
         
 

 async function handleOnSubmit(values:z.infer<typeof formSchema>){
    if(!values) return;
    try{
       
        const newamount=parseFloat(values.amount).toFixed(2)
        const parsed=parse(newStartValue,'MMMM d, yyyy', new Date());
        const parsed1=parse(newEndValue,'MMMM d, yyyy', new Date());

         const result=formSchema.parse(values)
      const newValues={...values,amount:newamount,startDate:values.period === 'custom' ? values.startDate : undefined, endDate:values.period === 'custom' ? values.endDate : undefined}
       const res=await mutation.mutateAsync({ queryKey: ['allBudgets', token.access_token], variable:newValues});  
       console.log(res); 
       
  }catch(error){
    toast({
      description:`${error} pls you already have a budget created for this just edit it  `,
      className:"text-white h-16",
      variant:"destructive"
  })
  }finally{
    toast({
      description:`budget succesfully created`,
      // variant:"destructive",
      className:"text-black h-24 bg-green-500"
  }) 
  }

  
 }
 const {isPending,isSuccess,isError}=mutation;

  if(isError){
    console.log("errror")
  }
  const handleClickOutside = (event:any) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setShowStartDate(false);
      setShowEndDate(false);
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
             <h1 >Set Budget</h1>
          </div> 
             <div className=" p-[1.5em] overflow-y-auto overflow-x-hidden scrollbar-widths flex-1    mt-3  ">
                
                <div className='mb-[1em] flex flex-col '>
                <div className=" form-header border px-[1em] space-y-4 mb-[24px] pt-[1em] rounded-md  pb-[1em]">
                 <h1 className='border-b'>Details</h1>
                <FormField  
                control={form.control}
                name="period"
                render={({ field }) => (
                <FormItem>
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">PERIOD</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} >
                  <FormControl>
                  <SelectTrigger className="bg-white">
                        <SelectValue  placeholder="set period" />
                    </SelectTrigger>
                    </FormControl>
                        <SelectContent className=" z-[9999]"> 
                          {type && type?.map((item:string)=>(
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
          {period === 'custom' &&
             <>
             <FormField
                control={form.control}
                name="startDate"
                render={({ field:{onChange,value}}) => (
                <FormItem >
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">START DATE</FormLabel>
                  <FormControl>
                    <Input type='string' onClick={()=>handleOnClick('startDate')}  placeholder={value?.toString()} onChange={handleFormatValue} className="bg-white"  value={value}     />
                   </FormControl>
                <FormMessage/>
                </FormItem>
              )}
                />
            
                </>  
                
            }
                {showStartDate && (
                     <div className=" relative w-full " ref={divRef}>
                        <DayPicker 
                        id='startDate'
                        mode="single"
                        onMonthChange={setMonth1}
                        month={month1}
                        className=" absolute left-1/2 z-[14526]  bg-orange-300 px-3 py-3  -translate-x-1/2  rounded-md shadow-md "
                        selected={selectedStartDate}
                        onSelect={handleDayPickerSelectOne}
                        />
                    </div>
            )} 

            {period === "custom" &&  <FormField
                control={form.control}
                name="endDate"
                render={({ field:{onChange,value}}) => (
                <FormItem >
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">END DATE</FormLabel>
                  <FormControl>
                    <Input type='string' onClick={()=>handleOnClick('endDate')}  placeholder={value?.toString()} onChange={handleFormatValue2} className="bg-white"  value={value}     />
                   </FormControl>
                <FormMessage/>
                </FormItem>
              )}
                />}
                 {showEndDate && (
                     <div className=" relative w-full " ref={divRef}>
                        <DayPicker 
                        mode="single"
                        id='form2'
                        onMonthChange={setMonth2}
                         month={month2}
                        className=" absolute left-1/2 z-[445577] bg-orange-300 px-3 py-3  -translate-x-1/2  rounded-md shadow-md "
                        selected={selectedEndDate}
                        onSelect={handleDayPickerSelectTwo}
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
             
               <Button  className={buttonVariants({variant:"default",className:"px-3  bg-orange-400 hover:bg-orange-500 "})} onClick={()=>setIsAddBudget(false)}>
                 CLOSE
               </Button>
               <Button className="ml-auto" type='submit'>
               {isPending ? "Loading..." : "SET BUDGETS"}
                </Button>
             
             </div>
        
         
        </RouterForm>
      
        </Form>
    )
}