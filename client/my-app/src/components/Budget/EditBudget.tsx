import React, { useEffect, useRef, useState } from "react";
import RouterForm from "../../context/reactrouterform";
import z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
// import DeleteTransactionButton from "./DeleteTransaction";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAccountsName, updateBudget } from "../../api/apiRequest";
import { queryClient } from "../..";
import { useToast } from "../../@/components/ui/use-toast";
import DeleteBudgetButton from "./DeleteBudget";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../Layouts/DashboardLayout";






const formSchema = z.object({
  // period: z.string(z.enum(["monthly", "yearly", "custom"])),
  category: z.string({
    required_error: 'category is required',
    message: 'category needed'
  }).min(1, { message: 'required' }),
  amount: z.string({
    required_error: "amount is required"
  }).min(1, { message: "required" }).max(6, { message: "cannot exceed this limit" }).refine((val) => {
    const number = Number(val);
    if (isNaN(number)) {
      return false
    }
    return true

  }, { message: 'Not a number pls  input a number' }),
})




export default function EditBudget({ budgets, closeSideBar }: { budgets: any, closeSideBar: any }) {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
  console.log(budgets, 'aaa')
  const { year, month } = useOutletContext<ContextType>()
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false)
  const divRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast()

  const type: string[] = ["yearly", "monthly", "custom"]

  const { error, data } = useQuery({
    queryKey: ['accounts', token.access_token],
    queryFn: getAccountsName
  })
  const mutation = useMutation({
    mutationFn: updateBudget,
    onSuccess: (data: any) => {
      // queryClient.invalidateQueries({ queryKey: ['alltransactions'] })
      queryClient.invalidateQueries({ queryKey: ['editbudget'] })
      queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
      queryClient.invalidateQueries({ queryKey: ['allaccounts'] })
      // updateFrontendBudgets(data)
      console.log(data, 'onSucess')
      closeSideBar()
      toast({
        description: `budget succesfully updated`,
        // variant:"destructive",
        className: "text-black h-16 bg-green-500"
      })

    },
    onError: () => {
      closeSideBar()
      toast({
        description: ` pls you already have a budget created for this just edit it `,
        className: "text-white h-16",
        variant: "destructive"
      })
    }
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // accountId: budgets.accountId,
      // period: budgets.period,
      category: budgets.category,
      amount: budgets.budget.$numberDecimal,
      // startDate: budgets.startDate && format(budgets.startDate, 'MMMM d, yyyy'),
      // endDate: budgets.endDate && format(budgets.endDate, 'MMMM d, yyyy')

    },
    mode: "onSubmit"
  })
  const { isPending } = mutation;
  // const period = form.watch('period');







  async function handleOnSubmit(values: z.infer<typeof formSchema>) {
    if (!values) return;
    const modifiedMonth = parseInt(month, 10)

    const newamount = values.amount
    const newValues = {
      amount: newamount,
      category: budgets.category,
      spent: budgets.spent,
      remaining: budgets.remaining,
      year: year,
      month: modifiedMonth
    }
    mutation.mutate({ queryKey: ['editbudget', token.access_token], variable: newValues, year, month: modifiedMonth });

  }


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
      <RouterForm className="bg-white dark:bg-background text-foreground h-full w-full mb-20  text-black relative" onSubmit={form.handleSubmit(handleOnSubmit)}>
        <div className="header  w-full pt-5 text-2xl ">
          <h1>Budget Details</h1>
        </div>
        <div className="border h-fit  py-3 w-full px-3 mt-3 space-y-4 ">
          <div className=" form-header flex justify-between pt-2">
            <span>Details</span>
            <span className="text-green-600">Cleared</span>
          </div>




          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">CATEGORY</FormLabel>
                <Input type="text" className="bg-white"   {...field} readOnly />
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

        <div className="transactions-button  mt-3 mb-5 px-3 h-64  py-3">
          <div >
            I want to...
          </div>
          <div className="space-buttons mt-5">
            <DeleteBudgetButton budgetId={budgets._id} closeSideBar={closeSideBar} />
          </div>

        </div>

        <div className="close-button  sticky bottom-0 py-5  px-3  right-3    border-top  z-[78555]  ">
          <hr />
          <div className="mt-5  flex justify-between">
            <Button onClick={closeSideBar} className={buttonVariants({ variant: "default", className: "px-3 font-bold  bg-orange-400 hover:bg-orange-500" })}>
              CLOSE
            </Button>
            {(form.formState.isDirty) && <Button type="submit">
              {isPending ? "Loading..." : "SAVE"}
            </Button>}
          </div>
        </div>


      </RouterForm>
    </Form>
  )
}