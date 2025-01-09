import React, { useEffect, useRef, useState } from "react";
import RouterForm from "../../context/reactrouterform";
import z from 'zod';
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { DayPicker } from "react-day-picker";
import { format, formatISO, isValid, parse } from "date-fns";
import DeleteTransactionButton from "./DeleteTransaction";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCategory, getAccountsName, updateTransaction } from "../../api/apiRequest";
import { queryClient } from "../..";
import { useToast } from "../../@/components/ui/use-toast";
import CustomSelect from "../common/CustomSelect";
import { useCategory } from "../../context/CategoryProvider";






const formSchema = z.object({
  date: z.string(z.date()),
  type: z.string(),
  category: z.string(),
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
  // status:z.string(),
  accountId: z.object({
    _id: z.string(),
    name: z.string(),
    type: z.string()
  }),
}).refine((data) => {
  const parsedDate = parse(data.date, 'PPP', new Date());

  // Check if the parsed date is valid
  return isValid(parsedDate);
}, {
  message: "Invalid date",
  path: ['date']

});;



export default function EditTransaction({ transaction, closeSideBar }: { transaction: any, closeSideBar: any }) {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');

  const [showDate, setShowDate] = useState(false);
  console.log(transaction)
  const { toast } = useToast();
  const [accountId, setAccountId] = useState(null)
  const [month, setMonth] = useState(new Date());
  const status: string[] = ["cleared", "pending"]
  const type: string[] = ["income", "expense"];
  const divRef = useRef<HTMLDivElement | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { data: categories, isLoading: categoryLoading, isFetching: categoriesetching } = useQuery({ queryKey: ['category'], queryFn: fetchCategory, gcTime: 0 });
  const { error, data } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccountsName
  })
  const mutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alltransactions'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });

      queryClient.invalidateQueries({ queryKey: ['addtransaction'] })
      queryClient.invalidateQueries({ queryKey: ['editTransactionsmobile'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['allaccounts'] });
      new Promise((resolve) => setTimeout(resolve, 5000))
      closeSideBar()
      toast({
        description: "transaction sucessfully updated",
        className: "text-black bg-white"
      })
    },
    onError(error, variables, context) {
      new Promise((resolve) => setTimeout(resolve, 5000))
      closeSideBar()
      toast({
        description: `${error} `,
        className: "text-white h-16",
        variant: "destructive"
      })
    },
  })
  const { isPending } = mutation;


  const newData = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(transaction.amount.$numberDecimal)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(transaction.date, 'PPP'),
      type: transaction.type,
      category: transaction.category.name,
      description: transaction.description,
      amount: parseInt(transaction.amount.$numberDecimal).toFixed(0),
      accountId: transaction.accountId
    },
    mode: "onChange"
  })

  const [newValue, setNewValue] = useState('');
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

  const handleFormatValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewValue(e.target.value);

    const parsedDate = parse(e.target.value, "PPP", new Date());
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
      form.setValue('date', e.target.value)
      //  setNewValue(parsedDate)
      // setMonth(parsedDate);
    } else {
      setSelectedDate(undefined);
      setNewValue('')
    }
  }
  const originalValuesRef = useRef(form.formState.defaultValues);




  const handleOnSubmit = async (values: z.infer<typeof formSchema>) => {


    const newamount = parseFloat(values?.amount);
    const parsed = parse(newValue, 'MMMM do, y', new Date());
    const defaultDate = parse(values.date, 'MMMM do, y', new Date());


    const newValues = { ...values, amount: newamount, accountId: values.accountId?._id!!, date: newValue === '' ? formatISO(defaultDate) : formatISO(parsed) }
    console.log(newValues, 'form submitted')
    mutation.mutate({ queryKey: ['editTransaction', token.access_token], variable: newValues, id: transaction._id });

    new Promise((resolve) => setTimeout(resolve, 5000))
    // setIsAddTransaction(false);


  }
  const watchedAccountId = useWatch({
    control: form.control,
    name: "accountId",
  });

  const handleOnClick = () => {
    setShowDate(true);
  }

  const handleClickOutside = (event: any) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setShowDate(false);
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
      <RouterForm className="bg-white dark:bg-card text-foreground h-full w-full mb-20  text-black relative" onSubmit={form.handleSubmit(handleOnSubmit)}>
        <div className="header text-foreground w-full pt-5 text-2xl ">
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
                <CustomSelect
                  options={type}
                  name="type"
                  form={form}
                  field={field}
                  placeholder="type"
                  onSelect={(value: any) => value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <FormItem >
                <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">DATE</FormLabel>
                <FormControl>
                  <Input type="text" onClick={handleOnClick} placeholder={value.toString()} onChange={handleFormatValue} className="bg-white" value={newValue} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showDate && (
            <div className=" relative  w-full " ref={divRef}>
              <DayPicker
                mode="single"
                onMonthChange={setMonth}
                month={month}
                className=" absolute left-1/2 z-[888955]  -translate-x-1/2 bg-white dark:bg-background rounded-md shadow-md "
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
                {categories && <CustomSelect
                  options={categories?.data.map((item: { name: any; }) => item.name)}
                  name="category"
                  form={form}
                  field={field}
                  placeholder="category"
                  onSelect={(value: any) => value}
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
                <FormControl>
                  <Input type="text" className="bg-white" {...field} />

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
                <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">DESCRIPTION</FormLabel>
                <FormControl>
                  <Input type="text" defaultValue={field.value} className="bg-white"   {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">ACCOUNT NAME</FormLabel>
                <CustomSelect
                  options={data && data.map((item: any) => ({ _id: item._id, name: item.name, type: item.type }))}
                  name="accountId"
                  placeholder="accountId"
                  form={form}
                  field={field}
                  onSelect={(value: any) => value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="transactions-button  mt-3 mb-5 px-3 h-64  py-3">
          <div >
            I want to...
          </div>
          <div className="space-buttons mt-5">
            <DeleteTransactionButton transactionId={transaction._id} closeSideBar={closeSideBar} />
          </div>

        </div>

        <div className="close-button  sticky bottom-0 py-5 bg-white dark:bg-card  px-3  right-3    border-top  z-[78555]  ">
          <hr />
          <div className="mt-5  flex justify-between">
            <Button onClick={closeSideBar} className={buttonVariants({ variant: "default", className: "px-3  bg-orange-400 hover:bg-orange-500" })}>
              CLOSE
            </Button>
            {(form.formState.isDirty || newValue || JSON.stringify(watchedAccountId) !== JSON.stringify(transaction.accountId)) && <Button className="" type="submit">
              {isPending ? "Loading..." : "SAVE"}
            </Button>}
          </div>
        </div>


      </RouterForm>
    </Form>
  )
}