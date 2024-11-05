import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form } from "react-router-dom";
import { Input } from "../../@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCategory, updateTransaction } from "../../api/apiRequest";
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
import { format, isValid, parse, formatISO } from "date-fns";
import 'react-datepicker/dist/react-datepicker.module.css'
import { LoaderCircle } from "lucide-react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useCategory } from "../../context/CategoryProvider";
import { useData } from "../../context/DataProvider";




export default function MyInputMutation({ value, type, id, name, placeholder, className, defaultValue }: { value: any, type?: string, id: string, name: string, placeholder: any, className: any, defaultValue: any }) {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');

  const { toast } = useToast();
  const [text, setText] = useState(value);
  const [selected, setSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [month, setMonth] = useState(new Date());
  const divRef = useRef<HTMLDivElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [newValue, setNewValue] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const meet = text;
  const { categories } = useCategory();
  console.log(categories, 'anyyyyy')
  const categoryData = categories?.map((item: any) => item.name)

  const mutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['alltransactions'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['editTransaction'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['allaccounts'] })
      queryClient.invalidateQueries({ queryKey: ['addtransaction'] })
      queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
      toast({
        description: 'Transaction successfully updated',
        className: 'text-black bg-white border-l-4 border-l-black',
      });
    },



    onError: (error) => {
      toast({
        description: error as unknown as string,
        className: 'text-white border-l-white border-l-4 ',
        variant: "destructive",

      });
      setText(value)
    }
  })


  const { isPending, data } = mutation;

  const handleDayPickerSelect = (date: Date | undefined) => {
    if (!date) {
      setText("");
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);

      setText(format(date, "P"));


    }

  };

  const newData = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(text)

  const handleFormatValue = (e: React.ChangeEvent<HTMLInputElement>) => {


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

  const handleBlur = async (e: any) => {
    e.preventDefault();
    setSelected(false);

    if (newData === text) {
      return;
    }
    console.log(text, defaultValue, "sssdff")
    if (name === 'amount' && text === '') {
      setText(value)
      return
    }

    if (name === 'amount' && isNaN(text)) {
      // setText('');
      setText(defaultValue)
      return;
    }

    // if (name === 'amount' && data?.amount > 15) {
    //   return;
    // }

    if (parseFloat(text).toFixed(2) === defaultValue) {
      setText(value)
      return;
    }

    if (text !== defaultValue) {

      // Prepare the value based on the input field's name
      const newValue = name === 'amount' ? { amount: text }
        : name === 'description' ? { description: text }
          : name === 'date' ? { date: text }
            : { [name]: text };  // Default case for other field names
      // setText(text)
      // Update the transaction using mutation
      mutation.mutate({
        queryKey: ['editTransaction', token.access_token],
        variable: newValue,  // Ensure you're passing the correct value structure
        id: id
      });





    }

  };

  console.log(data, "dataaaaaaaaaaaa");

  const handleCategoryChange = async (value: any) => {

    if (value === defaultValue) {
      setText(value)
      return;
    }

    if (value !== defaultValue) {
      setText(value)

      mutation.mutate({ queryKey: ['editTransaction', token.access_token], variable: { category: value }, id: id });
    }
  }

  useEffect(() => {
    if (selected && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [selected])

  useEffect(() => {

    setText(value);
    // window.location.reload()
  }, [value]);

  const rootStyles = {
    zIndex: "8999999",
    Position: "static"
  }



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
            <SelectContent id={id} className=" h-28">

              {categoryData && categoryData.map((item: any) => (
                <SelectItem value={item} key={item}>
                  {isPending && <LoaderCircle className=" animate-spin absolute flex items-center self-center bottom-1/2 right-4 top-1/2 w-4 h-4" />}
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <div className="relative ">
            {name === 'date' && (

              <div id='cont' className={`cursor-text relative   rounded-[2px] w-full h-[37px] `} >

                <DatePicker
                  className={` h-full border-orange-400   border-none px-[13px] w-full absolute top-0 outline-1 border  outline-orange-400 bg-transparent `}
                  popperClassName="left-52 absolute"
                  selected={startDate}
                  value={text}
                  onChange={(date) => setStartDate(date)}
                />


              </div>
            )}

          </div >


        )
      case 'amount':
      case 'description':
        //   case  'date' :

        return (
          <div onClick={() => setSelected(true)} className="relative h-full flex hover:border-orange-400 hover:border  items-center">

            {isPending && <LoaderCircle className=" animate-spin absolute flex items-center self-center bottom-1/2 right-4 top-1/2 w-4 h-4" />}

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
                    className={`${className} py-0 px-[5.1px] border-0 m-0 max-w-full ${name === 'description' ? 'placeholder:content-["Add a note"] hover:content-["Add a note"]' : ''} w-full flex flex-wrap  outline-none text-left leading-tight shadow-none`}
                    defaultValue={defaultValue}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                  />

                </div>
              </div>
            ) : (
              <div className={`border-none px-[13px]  w-full h-full  inline-flex items-center flex-nowrap leading-tight m-0 overflow-hidden text-nowrap   max-w-full  text-ellipsis`}>

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