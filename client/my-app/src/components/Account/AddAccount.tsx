import React, { useState } from "react";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import RouterForm from "../../context/reactrouterform";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { useToast } from "../../@/components/ui/use-toast";
import { queryClient } from "../..";
import { apiClient } from "../../context/LoadingContext";






const formSchema = z.object({
  name: z.string({
    required_error: "account name is required",
    message: "name is needed"
  }).min(1, { message: "required" }),
  type: z.string({
    required_error: "account type is required",
  }).min(4),
  balance: z.string({
    required_error: "account balance needs to be inputed"
  }).min(1, { message: "required" }).max(6, { message: "cannot exceed this limit" }).refine((val) => {
    const number = parseFloat(val);
    if (Number.isNaN(number)) {
      return false
    }
    return true

  }, { message: 'Not a number pls  input a number' }),

})


export default function AddAccount({ isAddAccounts, setIsAddAccounts }: { isAddAccounts: any, setIsAddAccounts: any }) {
  const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
  const [reveal, setReveal] = useState(false);
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (data: { name: string, type: string, balance: string }) => {
      return apiClient.post("/account/create", data);

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allaccounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setIsAddAccounts(false);
      toast({
        description: 'accounts successfully created',
        className: 'text-black bg-white border-l-4 border-l-black',
      });
    },
    onError: (error) => {
      new Promise((resolve) => setTimeout(resolve, 5000))
      setIsAddAccounts(false);
      toast({
        description: `${error}`,
        variant: "destructive",
        className: "text-black h-24"
      })
    }

  })
  const onHandleReveal = () => {
    setReveal((prev) => !prev);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      balance: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    mutation.mutate(values);



  }

  const { isPending } = mutation;
  return (
    <Form {...form}>
      <RouterForm className="  bg-white  dark:bg-background text-foreground w-full  p-[0rem] font-custom relative border-l flex flex-col     text-black " onSubmit={form.handleSubmit(onSubmit)}>
        <div className="header text-black dark:text-foreground w-full pt-[2.5em]  px-6 text-2xl ">
          <h1>Add New Accounts</h1>
        </div>
        <div className=" p-[1.5em] overflow-y-auto overflow-x-hidden scrollbar-widths flex-1    mt-3  ">

          <div className='mb-[1em] flex flex-col '>
            <div className=" form-header border px-[1em] space-y-4 mb-[24px] pt-[1em] rounded-md  pb-[1em]">
              <h1 className='border-b'>Details</h1>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">NAME</FormLabel>
                    <FormControl>
                      <Input type="string" className="bg-white"  {...field} />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">BALANCE</FormLabel>
                    <FormControl>
                      <Input type="string" className="bg-white"  {...field} />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">TYPE</FormLabel>
                    <FormControl>
                      <Input type="string" placeholder='write a note' className="bg-white"  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>
        </div>



        <div className="close-button   pt-[1.5em] m-[1.5em] border-t flex items-center justify-between border-top    ">

          <Button className={buttonVariants({ variant: "default", className: "px-3  bg-orange-400 font-bold text-foreground hover:bg-orange-500 " })} onClick={() => setIsAddAccounts(false)}>
            CLOSE
          </Button>
          <Button className={`ml-auto text-foreground dark:text-orange-400 font-bold `} type='submit' disabled={isPending}  >
            {isPending ? "Loading..." : "CREATE ACCOUNTS"}
          </Button>

        </div>


      </RouterForm>

    </Form>
  )
}