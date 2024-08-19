import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form } from "react-router-dom";
import { Input } from "../../@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { updateTransaction } from "../../api/apiRequest";
import { queryClient } from "../..";
import { useToast } from "../../@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../../@/components/ui/select";
import { dataCategory } from "../../Pages/DashBoard/transactions";
import { format, isValid, parse,formatISO, } from "date-fns";
import { DayPicker } from "react-day-picker";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.module.css'
import { LoaderCircle } from "lucide-react";



export default function MyInputMutation({value,type,id,name,placeholder,className,defaultValue}:{value:any,type?:string,id:string,name:string,placeholder:any,className:any,defaultValue:any}){
    
    const {toast}=useToast();
    const [text,setText]=useState(defaultValue);
    const [selected,setSelected]=useState(false);
    const inputRef=useRef<HTMLInputElement | null>(null);
    const [showDate,setShowDate] =useState(false);
    const [month, setMonth] = useState(new Date());
    const divRef=useRef<HTMLDivElement | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [newValue,setNewValue]=useState('');
    
    const mutation=useMutation({
        mutationFn:updateTransaction,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['alltransactions']})
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            queryClient.invalidateQueries({queryKey:['allaccounts']})
        
      }
    })
  
   
    const {isPending,data}=mutation;

    const handleDayPickerSelect = (date: Date | undefined) => {
        if (!date) {
          setText("");
          setSelectedDate(undefined);
        } else {
          setSelectedDate(date);
        
          setText(format(date, "P"));
          handleBlur()
           
        }
        
      };
      
      const handleFormatValue=(e:React.ChangeEvent<HTMLInputElement>)=>{

    
           setText(e.target.value);
           
           const parsedDate = parse(e.target.value, "P", new Date());
          if (isValid(parsedDate)) {
            setSelectedDate(parsedDate);
            
            
          } else {
           
            setSelectedDate(undefined);
            setText('')
          }
    
    
      }
    
   
    

    const handleFocus = () => {

         setSelected(true);
        //  setShowDate(true)
         
        const rawValue = name === 'amount'
        ? text
            .replace(/[₦$,]/g, '') // Remove currency symbols and commas
            .replace(/\.00$/, '') // Remove '.00' if it's at the end
            .trim() // Trim any extra spaces
        : text;
      setText(rawValue);
         
      };
   
    const handleBlur =  async() => {

         setSelected(false);
        //  if(value === text){
        //   return;
        //  }
         

        // if(name === 'amount' && text === defaultValue){
        //     setText(value)
        //     return;
        // }
         
        if((name === 'amount' && !parseInt(text))){
           setText('');
            return;
        }
        
       if(text === defaultValue){
        //  setText(value)
         return;
        }
        
    
        if (text !== defaultValue) {
          
          const newValue = name === 'amount' ? {amount:parseFloat(text)}
           : name === 'description' ? {description:text} : name === 'date' ? {date:text}:
           text;
           setText(name === 'amount' ? new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
          }).format(defaultValue) : text)
          try {
            await mutation.mutateAsync({ queryKey: ['editTransaction', "token.access_token"],variable:newValue,id:id});
            toast({
              description: 'Transaction successfully updated',
              className: 'text-black bg-white',
            });
          } catch (err) {
            console.error(err);
          }finally{
            // toast({
            //     description: 'Transaction successfully updated',
            //     className: 'text-black bg-white',
            //   });
          }
        }

      };

console.log(data,"dataaaaaaaaaaaa");
// const handleClickOutside = (event:any) => {
//     if (divRef.current && !divRef.current.contains(event.target)) {
//       setShowDate(false);
    
//     //   setSelected(false)
//     }
//   }; 

 
  
// useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutside);
//     // handleBlur()
//     setSelected(false)
//     return () => {  
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   },[]) 
const handleCategoryChange=async(value:any)=>{
    
    if(value === defaultValue){
       
        setText(value)
          return;
      }

    if (value !== defaultValue) {
         setText(value)
        try {
          await mutation.mutateAsync({ queryKey: ['editTransaction', "token.access_token"],variable:{category:value},id:id});
          toast({
            description: 'Transaction successfully updated',
            className: 'text-black bg-white',
          });
        } catch (err) {
          console.error(err);
        }finally{
          toast({
              description: 'Transaction successfully updated',
              className: 'text-black bg-white',
            });
        }
      }
}

useEffect(()=>{
    if(selected && inputRef.current ){
        inputRef.current?.focus();
    }
},[selected])

useEffect(()=>{
  if(text === defaultValue){
    return;
  }
    setText(value)
 },[value,text,defaultValue]);

 
   const renderInputField = () => {
    switch (name) {
      case 'category':
        return (
          <Select
            onValueChange={handleCategoryChange}
            value={text}
            defaultValue={text}
            name={name}
          >
            <SelectTrigger
              className={`${className} border-0 outline-none rounded-none bg-transparent`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent id={id}>
              {dataCategory.map((item) => (
                <SelectItem value={item} key={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
      return (
          <>
            {name === 'date' && selected ? (
                <div className={`cursor-text  rounded-[2px] px-[13px] z-[9999] h-[37px] border border-orange-400`} >
                   <div className="relative" ref={divRef}>
                    <DayPicker
                      mode="single"
                      onMonthChange={setMonth}
                      month={month}
                      className=" absolute left-5 overflow-x-hidden z-[100] bg-white rounded-md shadow-md"
                      selected={selectedDate}
                      onSelect={handleDayPickerSelect}
                      />
                    </div>
                </div>
                
            ):(
             <div onClick={()=>setSelected(true)} role="button" className="border-none px-[13px] w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                {text}
              </div>
            
            )}
          </>
      )
      case 'amount':
      case 'description':
    //   case  'date' :
      
        return (
          <div onClick={() => setSelected(true)} className="relative h-full flex  items-center">
           
            {isPending &&  <LoaderCircle className=" animate-spin absolute flex items-center self-center bottom-1/2 right-4 top-1/2 w-4 h-4"/>}
            
            {selected ? (
              <div
                className={`cursor-text rounded-[2px] px-[13px] h-[37px] w-full border border-orange-400`}
              >
                <div className={`${'relative px-[7px] py-[9px] inline-flex w-full'}`}>
             
                  <input
                    ref={inputRef}
                    type={type}
                    value={text}
                    name={name}
                    className={`${className} py-0 px-[5.1px] border-0 m-0 max-w-full w-full flex-1 outline-none text-left leading-tight shadow-none`}
                    defaultValue={text}
                    onChange={(e)=>setText(e.target.value)}
                    placeholder={placeholder}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                  />
                 
                </div>
              </div>
            ) : (
              <div className="border-none px-[13px] w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                 
                {name === 'amount'
                  ? value
                  : text}
              </div>
            )}
            
          </div>
        );
      default:
        return null;
    }
  };  


    return (
        <>
        
          {renderInputField()}
        </>
    )
}