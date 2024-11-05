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
import { useToast } from '../../@/components/ui/use-toast';







const removeOrdinalSuffix = (dateString: any) => {
  return dateString.replace(/(\d+)(st|nd|rd|th)/g, '$1');
};


function isValidDate(dateString: any, formatString: any) {
  // Parse the date string according to the given format
  const parsedDate = parse(dateString, formatString, new Date());

  // Check if the parsed date is valid
  return isValid(parsedDate);
}

const MyEnum = ['monthly', 'yearly', 'custom'];


const formSchema = z.object({
  // period: z.string(z.enum(["monthly", "yearly", "custom"])),
  category: z.string({
    required_error: 'category is required',
    message: 'category needed'
  }).min(1, { message: 'required' }),
  amount: z.string({
    required_error: "amount is required"
  }).min(1, { message: "required" }).max(6, { message: "cannot exceed this limit" }).refine((val) => {
    const number = parseFloat(val);
    if (Number.isNaN(number)) {
      return false
    }
    return true

  }, { message: 'Not a number pls  input a number' }),

  // accountId: z.string({
  //   required_error: "pls select account"
  // }).min(5, { message: 'account name is required' }),
  // startDate: z.string(z.date()).optional(),
  // endDate: z.string(z.date()).optional(),
})


export default function AddBudgets({ setIsAddBudget }: { setIsAddBudget: any }) {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false)
  const [month1, setMonth1] = useState(new Date());
  const [month2, setMonth2] = useState(new Date());
  const divRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast()
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);
  const [newStartValue, setStartNewValue] = useState('');
  const [newEndValue, setEndNewValue] = useState('');
  const type: string[] = ["yearly", "monthly", "custom"];
  const { error, data } = useQuery({
    queryKey: ['accounts', token.access_token],
    queryFn: getAccountsName
  })
  const mutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBudgets'] })
      queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
      queryClient.invalidateQueries({ queryKey: ['editbudget'] })

      setIsAddBudget(false);
      toast({
        description: 'budgets successfully created',
        className: 'text-black bg-white border-l-4 border-l-black',
      });

    },

    onError: (error) => {
      new Promise((resolve) => setTimeout(resolve, 5000))
      setIsAddBudget(false);
      toast({
        description: `${error}`,
        variant: "destructive",
        className: "text-black h-24"
      })
    }



  })
  const currentDate: any = format(Date.now(), 'MMMM d, yyyy');



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // accountId: "",
      // period: '',
      category: "",
      amount: "",
      // startDate: "",
      // endDate: ""

    },
    mode: "onSubmit"
  })








  async function handleOnSubmit(values: z.infer<typeof formSchema>) {
    if (!values) return;


    const newamount = parseFloat(values.amount).toFixed(2)



    const newValues = { ...values, amount: newamount }
    mutation.mutate({ queryKey: ['allBudgets', token.access_token], variable: newValues })


  }



  const { isPending } = mutation;


  const handleClickOutside = (event: any) => {
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
  }, [])
  return (
    <Form {...form}>
      <RouterForm className=" bg-white w-full max-w-full p-[0rem] relative border-l flex flex-col md:w-[33%] md:max-w-[450px] lg:w-96  text-black " onSubmit={form.handleSubmit(handleOnSubmit)}>
        <div className="header text-black w-full pt-[2.5em]  px-6 text-2xl ">
          <h1>Set Budget</h1>
        </div>
        <div className=" p-[1.5em] overflow-y-auto overflow-x-hidden scrollbar-widths flex-1    mt-3  ">

          <div className='mb-[1em] flex flex-col '>
            <div className=" form-header border px-[1em] space-y-4 mb-[24px] pt-[1em] rounded-md  pb-[1em]">
              <h1 className='border-b'>Details</h1>



              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">CATEGORY</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}  >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="select your category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className=" z-[11445] overflow-y-auto h-64 ">
                        {dataCategory && dataCategory?.map((item: string) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
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
                  <FormItem >
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">AMOUNT</FormLabel>
                    <FormControl>
                      <Input type="text" className="bg-white"  {...field} />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



            </div>
          </div>
        </div>



        <div className="close-button   pt-[1.5em] m-[1.5em] border-t flex items-center justify-between border-top    ">
          <Button className={buttonVariants({ variant: "default", className: "px-3  bg-orange-400 hover:bg-orange-500 " })} onClick={() => setIsAddBudget(false)}>
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