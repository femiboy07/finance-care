import { zodResolver } from '@hookform/resolvers/zod';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../@/components/ui/form';
import RouterForm from '../../context/reactrouterform';
import { Input } from '../../@/components/ui/input';
import { DayPicker } from 'react-day-picker';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { format, formatISO, isValid, parse } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createTransaction, fetchCategory, getAccountsName } from '../../api/apiRequest';
import { queryClient } from '../..';
import { useToast } from '../../@/components/ui/use-toast';
import { LoaderCircle } from "lucide-react";
import CustomSelect from '../common/CustomSelect';
import { useOutletContext } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import { useCategory } from '../../context/CategoryProvider';
import { useData } from '../../context/DataProvider';






function isValidDate(dateString: any, formatString: any) {
  // Parse the date string according to the given format
  const parsedDate = parse(dateString, formatString, new Date());

  // Check if the parsed date is valid
  return isValid(parsedDate);
}



const formSchema = z.object({
  type: z.string({
    required_error: "pls type is required",
    message: "type is required"
  }).min(5, { message: "type required" }),
  date: z.string(z.date()).refine((data) => {
    const parsedDate = parse(data, 'PPP', new Date());

    // Check if the parsed date is valid
    return isValid(parsedDate);
  }, {
    message: "Invalid date",
    path: ['date']

  }),

  category: z.string({
    required_error: 'category is required',
    message: 'category needed'
  }).min(2, { message: 'required' }),
  description: z.string().optional(),
  amount: z.string({
    required_error: "amount is required"
  }).min(1, { message: "required" }).max(6, { message: "cannot exceed this limit" }).refine((val) => {
    const number = Number(val);
    if (isNaN(number)) {
      return false
    }
    return true

  }, { message: 'Not a number pls  input a number' }),

  accountId: z.object({
    name: z.string(),
    type: z.string(),
    _id: z.string()
  }, {
    required_error: "pls select account"
  }),
}).refine((data) => {


  // Check if the parsed date is valid
  return isValidDate(data.date, "PPP");
}, {
  message: "Invalid date",
  path: ['date']

});


export default function AddTransaction({ setIsAddTransaction, months, transactRef }: { setIsAddTransaction: any, months: any, transactRef: MutableRefObject<HTMLDivElement | null> }) {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');

  const [showDate, setShowDate] = useState(false);
  const [month, setMonth] = useState<Date>(months);
  const divRef = useRef<HTMLDivElement | null>(null);
  const { month: Months, year } = useOutletContext<ContextType>()
  console.log(Months, 'M')
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newValue, setNewValue] = useState('');
  const type: string[] = ["income", "expense"];

  const { data: categories, isLoading: categoryLoading } = useQuery({ queryKey: ['category'], queryFn: fetchCategory, gcTime: 0 });
  const { data } = useQuery({ queryKey: ['accounts'], queryFn: getAccountsName })
  const { isOnline } = useOnlineStatus();
  // console.log(categoryData, "datacategories");
  console.log(data, 'acccontName')
  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alltransactions'] })
      queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['category'] })
      queryClient.invalidateQueries({ queryKey: ['latesttransaction'] })
      queryClient.invalidateQueries({ queryKey: ['editTransaction'] })
      new Promise((resolve) => setTimeout(resolve, 5000))
      setIsAddTransaction(false);
      toast({
        description: 'Transaction successfully updated',
        className: 'text-black bg-white border-l-4 border-l-black',
      });
    },
    onError: (error) => {
      new Promise((resolve) => setTimeout(resolve, 5000))
      setIsAddTransaction(false);
      toast({
        description: `${error}`,
        variant: "destructive",
        className: "text-black h-16"
      })
    }
  })
  const newDate: Date = new Date();
  const isCurrentMonth = newDate.getMonth() === month?.getMonth() && newDate.getFullYear() === month.getFullYear()
  const currentDate: any = isCurrentMonth ? format(newDate, 'PPP') : format(month, 'PPP')


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: {
        name: data[0]?.name,
        _id: data[0]._id,
        type: data[0].type
      },
      type: type[0],
      date: currentDate,
      category: "",
      description: "",
      amount: "",

    },
    mode: "onSubmit"
  })

  console.log(form.getValues("date"))
  const handleDayPickerSelect = (date: Date | undefined) => {
    if (!date) {
      setNewValue("");
      // setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
      // setMonth(date);
      form.setValue('date', format(date, "PPP"));
      setNewValue(format(date, "PPP"));
    }
  };

  const handleFormatValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewValue(e.target.value);
    form.setValue('date', e.target.value)
    const parsedDate = parse(e.target.value, "PPP", new Date());
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
      form.setValue('date', e.target.value)
      //  setNewValue(e.target.value);
      // setMonth(parsedDate);
    } else {
      // form.setValue('date','')
      // setSelectedDate(undefined);
      setNewValue('')
    }
  }

  const handleOnClick = () => {
    setShowDate(true);
  }

  async function handleOnSubmit(values: z.infer<typeof formSchema>) {

    if (!values) return;


    const newamount = parseFloat(values.amount).toFixed(2)
    const definedMonth = parseInt(Months, 10);
    const definedYear = parseInt(year, 10);
    const defaultDate = parse(values.date, 'MMMM do, y', new Date());
    const newValues = { ...values, amount: newamount, date: formatISO(defaultDate) }
    console.log(newValues)
    mutation.mutate({ queryKey: ['addtransaction', token.access_token], variable: newValues, month: definedMonth, year: definedYear })



  }





  const { isPending, isError } = mutation;
  console.log(isError, '197')

  const handleClickOutside = (event: any) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setShowDate(false);
    }
  };

  const handleSelectInput = (e: React.ChangeEvent<HTMLSelectElement>) => {
    form.setValue('category', e.target.value)
  }


  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [])
  return (
    <Form {...form}>

      <RouterForm data-form="add-transaction" className=" bg-white dark:bg-card text-foreground w-full  p-[0rem] font-custom relative border-l flex flex-col    text-black " onSubmit={form.handleSubmit(handleOnSubmit)}>
        <div className="header text-black dark:text-foreground w-full pt-[2.5em]  px-6 text-2xl ">
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
                  <FormItem className=''>
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">TYPE</FormLabel>
                    <CustomSelect
                      placeholder='type'
                      onSelect={(value: any) => value}
                      form={form}
                      name={"type"}
                      options={type}
                      field={field}

                    />


                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">DATE</FormLabel>
                    <FormControl>
                      <Input type='text' onClick={handleOnClick} placeholder={currentDate.toString()} onChange={handleFormatValue} className="bg-white   " value={value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showDate && (
                <div className=" relative " ref={divRef}>
                  <DayPicker
                    mode="single"
                    onMonthChange={setMonth}
                    month={month}
                    className=" absolute left-1/2 top-0  dark:bg-background dark:shadow-[#303030] dark:shadow-md z-[77889999] -translate-x-1/2 bg-white rounded-md shadow-xl "
                    selected={selectedDate}
                    onSelect={handleDayPickerSelect}
                  />
                </div>
              )}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className=''>
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">CATEGORY</FormLabel>
                    {/* {isLoading && <LoaderCircle className='animate-pulse' />} */}
                    {categories &&
                      <CustomSelect
                        placeholder='Select category'
                        onSelect={(value: any) => value}
                        form={form}
                        name={"category"}
                        options={categories.data && categories?.data?.map((item: any) => item.name)}
                        field={field}
                      />}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">AMOUNT</FormLabel>
                    <FormControl >
                      <Input type="text" className="bg-white"   {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel className="after:content-['*']  after:text-red-600 after:ml-2">DESCRIPTION</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder='write a note' className="bg-white"  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem className=''>
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">ACCOUNTID</FormLabel>
                    {data &&
                      <CustomSelect
                        placeholder='Select accountId'
                        onSelect={(value: any) => value}
                        form={form}
                        name={"accountId"}
                        options={data && data.map((item: any) => ({ _id: item._id, name: item.name, type: item.type }))}
                        field={field}
                      />}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>



        <div className="close-button   pt-[1.5em] m-[1.5em] border-t flex items-center justify-between border-top    ">

          <Button className={buttonVariants({ variant: "default", className: "px-3  bg-orange-400 hover:bg-orange-500 " })} onClick={() => setIsAddTransaction(false)}>
            CLOSE
          </Button>
          <Button className="ml-auto" type='submit' disabled={isPending}>
            {isPending ? "Loading..." : "CREATE TRANSACTION"}
          </Button>

        </div>


      </RouterForm>

    </Form>
  )
}