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



export default function MyInputMutation({value,type,id,name,placeholder,className,defaultValue}:{value:any,type?:string,id:string,name:string,placeholder:any,className:any,defaultValue:any}){
    
    const {toast}=useToast();
    const [text,setText]=useState(defaultValue);
    
    const mutation=useMutation({
        mutationFn:updateTransaction,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['alltransactions']})
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            queryClient.invalidateQueries({queryKey:['allaccounts']})
        
      }
    })
  
   
    const {isPending,data}=mutation;

    const handleFocus = () => {

      
        const rawValue = name === 'amount'
        ? text
            .replace(/[₦$,]/g, '') // Remove currency symbols and commas
            .replace(/\.00$/, '') // Remove '.00' if it's at the end
            .trim() // Trim any extra spaces
        : text;
      setText(rawValue);
      };
   
    const handleBlur =  async() => {

        if(name === 'amount' && !parseInt(text)){
            setText('');
            return;
        }
        
       if(text === defaultValue){
       
          setText(value)
            return;
        }
        
    
        if (text !== defaultValue) {
          const newValue = name === 'amount' ? {amount:parseFloat(text)} : name === 'description' ? {description:text}:text;
          try {
            await mutation.mutateAsync({ queryKey: ['editTransaction', "token.access_token"],variable:newValue,id:id});
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
      };
    

    // useEffect(() => {
    //     // Format the value for display
    //     const formatted = name === 'amount'
    //       ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(defaultValue)
    //       : defaultValue;
    //     setText(formatted);
    //     // setFormattedValue(formatted);
    //   }, [defaultValue,name]);

console.log(data,"dataaaaaaaaaaaa");


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
    setText(value)
   },[value])


    return (
        <>
       {name === 'category' ? 
       (
       <Select  onValueChange={handleCategoryChange}  value={text}   defaultValue={text} name={name}   >
            <SelectTrigger className={`${className} border-0 outline-none rounded-none bg-white `}  >
               <SelectValue placeholder={placeholder}  />
           </SelectTrigger>
          <SelectContent  id={id}   >
            {dataCategory.map((item)=>(
                 <SelectItem value={item} >{item}</SelectItem>
            ))}
         
          </SelectContent>
         </Select>):(
          <input
                type={type}
                value={text}
                name={name}
                className={className}
                defaultValue={text}
                onChange={(e)=>{
                    setText(e.target.value)
                    console.log(e.target.value)
                }} 
                placeholder={placeholder}
                onBlur={handleBlur}
                onFocus={handleFocus}
                
            
                />)}
       </>
    )
}