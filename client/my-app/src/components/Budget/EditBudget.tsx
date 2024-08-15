import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogTrigger } from "../../@/components/ui/dialog";
import RouterForm from "../../context/reactrouterform";
import z from 'zod';
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { DayPicker } from "react-day-picker";
import { format, formatISO, isBefore, isValid, parse } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../@/components/ui/select";
import { dataCategory } from "../../Pages/DashBoard/transactions";
// import DeleteTransactionButton from "./DeleteTransaction";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAccountsName, updateBudget, updateTransaction } from "../../api/apiRequest";
import { queryClient } from "../..";
import { useToast } from "../../@/components/ui/use-toast";
import { FileDiff } from "lucide-react";
import DeleteBudgetButton from "./DeleteBudget";





function isValidDate(dateString:any,formatString:any) {
    // Parse the date string according to the given format
    const parsedDate = parse(dateString, formatString, new Date());
  
    // Check if the parsed date is valid
    return isValid(parsedDate);
  }

const formSchema=z.object({
    period:z.string(z.enum(["monthly","yearly","custom"])),
    category:z.string({
       required_error:'category is required',
       message:'category needed'
     }).min(1,{message:'required'}),
     amount:z.string({
       required_error:"amount is required"
     }).min(1,{message:"required"}).refine((val)=>{
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
     const dateFormat = 'MMMM d, yyyy';
    if(startDate && endDate){

   if (!isValidDate(startDate,dateFormat) || !isValidDate(endDate,dateFormat)) {
            return false;
     }
      
    return isBefore(startDate,endDate)  
    
   

}

   return false
 // Return true if dates are not both defined (optional)
 
 }, {
   path:["startDate"],
   message: 'Start date must be before end date',
     
     
})




export default function EditBudget({budgets,closeSideBar}:{budgets:any,closeSideBar:any}){
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
  const type:string[]=["yearly","monthly","custom"]
      
        const {error,data}=useQuery({
          queryKey:['accounts',token.access_token],
          queryFn:getAccountsName
        }) 
        const mutation=useMutation({
          mutationFn:updateBudget,
          onSuccess:()=>{
              queryClient.invalidateQueries({queryKey:['alltransactions']})
              queryClient.invalidateQueries({ queryKey: ['allBudgets'] })
              queryClient.invalidateQueries({queryKey:['allaccounts']})
        }
      })
      const form=useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
        accountId:budgets.accountId,  
        period:budgets.period,
        category:budgets.category,
        amount:budgets.amount.$numberDecimal,
        startDate:budgets.startDate && format(budgets.startDate,'MMMM d, yyyy'),
        endDate:budgets.endDate && format(budgets.endDate,'MMMM d, yyyy')
       
    },
    mode:"onSubmit"
  })
      const {isPending}=mutation;
      const period=form.watch('period');


      const handleDayPickerSelectOne = (date: Date | undefined) => {
        if (!date) {
          setStartNewValue("");
          setSelectedStartDate(undefined);
        
        } else {
          setSelectedStartDate(date);
          form.setValue('startDate',format(date,"MMMM d, yyyy"));
          setMonth1(date);
          setStartNewValue(format(date, "MMMM d, yyyy"));
        }
      };
    
      const handleDayPickerSelectTwo = (date: Date | undefined) => {
        if (!date) {
          setEndNewValue("");
        
          setSelectedEndDate(undefined)
        } else {
            form.setValue('endDate',format(date,"MMMM d, yyyy"));
          setSelectedEndDate(date);
          setMonth2(date);
          setEndNewValue(format(date, "MMMM d, yyyy"));
        }
      };
      
      const handleFormatValue=(e:React.ChangeEvent<HTMLInputElement>)=>{
           setStartNewValue(e.target.value);
           form.setValue('startDate',e.target.value)
          // setEndNewValue(e.target.value)
          const parsedDate = parse(e.target.value, "MMMM d, yyyy", new Date());
          if (isValid(parsedDate)) {
            setSelectedStartDate(parsedDate);
            // setSelectedEndDate(parsedDate)
            //  setNewValue(parsedDate)
            setMonth1(parsedDate);
            // setMonth2(parsedDate)
          } else {
            setSelectedStartDate(undefined);
            // setSelectedEndDate(undefined);
            setStartNewValue('');
            // setEndNewValue("");
          }
      }
    
      const handleFormatValue2=(e:React.ChangeEvent<HTMLInputElement>)=>{
        // setStartNewValue(e.target.value);
       setEndNewValue(e.target.value)
       form.setValue('endDate',e.target.value)
       const parsedDate = parse(e.target.value, "MMMM d, yyyy", new Date());
       if (isValid(parsedDate)) {
        //  setSelectedStartDate(parsedDate);
         setSelectedEndDate(parsedDate)
         //  setNewValue(parsedDate)
        //  setMonth1(parsedDate);
         setMonth2(parsedDate)
       } else {
        //  setSelectedStartDate(undefined);
         setSelectedEndDate(undefined);
        //  setStartNewValue('');
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
         if(!values ) return;
        try{
        const newamount=parseFloat(values.amount).toFixed(2)
        const parsed=parse(newStartValue,'MMMM d, yyyy', new Date());
        const parsed1=parse(newEndValue,'MMMM d, yyyy', new Date());
        const start=values.startDate!!
        const end=values.endDate!!;
        const defaultDate1=parse(start,'MMMM d, yyyy', new Date());
        const defaultDate2= parse(end,'MMMM d, yyyy',new Date());
        const newValues={...values,amount:newamount,startDate: newStartValue === '' ? formatISO(defaultDate1) : formatISO(parsed),
            endDate:newEndValue === '' ? formatISO(defaultDate2) : formatISO(parsed1)
        }
       const res=await mutation.mutateAsync({ queryKey: ['allBudgets', token.access_token], variable:values,id:budgets._id});
       console.log(res);
    }catch(err){
    

      toast({
        description:` pls you already have a budget created for this just edit it  `,
        className:"text-white h-16",
        variant:"destructive"
    })
    
      
  }finally{
    closeSideBar()
    toast({
        description:`budget succesfully updated`,
        // variant:"destructive",
        className:"text-black h-16 bg-green-500"
    }) 
  }

  
 }
       
const originalValuesRef = useRef(form.formState.defaultValues);
  
 
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
        <RouterForm className="bg-white h-full w-full mb-20  text-black relative" onSubmit={form.handleSubmit(handleOnSubmit)}>
          <div className="header text-black w-full pt-5 text-2xl ">
             <h1>Budget Details</h1>
           </div> 
         <div className="border h-fit  py-3 w-full px-3 mt-3 space-y-4 ">
                 <div className=" form-header flex justify-between pt-2">
                    <span>Details</span>
                    <span className="text-green-600">Cleared</span>
                 </div>
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
                 <DeleteBudgetButton budgetId={budgets._id} closeSideBar={closeSideBar}/>
                </div>
                
             </div>

             <div className="close-button  sticky bottom-0 py-5 bg-white  px-3  right-3    border-top  z-[78555]  ">
              <hr/>
              <div className="mt-5  flex justify-between">
               <Button onClick={closeSideBar} className={buttonVariants({variant:"default",className:"px-3  bg-orange-400 hover:bg-orange-500"})}>
                 CLOSE
               </Button>
               {(form.formState.isDirty || newStartValue || newEndValue) && <Button className="" type="submit">
                {isPending ? "Loading..." : "SAVE"}
                </Button>}
              </div>
             </div>
          
         
        </RouterForm>
        </Form>
    )
}