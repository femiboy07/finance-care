import React, { useEffect, useRef, useState } from "react";
import RouterForm from "../../context/reactrouterform";
import z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import { Input } from "../../@/components/ui/input";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAccountsName, updateAccount } from "../../api/apiRequest";
import { queryClient } from "../..";
import { useToast } from "../../@/components/ui/use-toast";
import DeleteAccountButton from "./DeleteAccountButton";




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
    }).min(1, { message: "required" }).max(9, { message: "cannot exceed this limit" }).refine((val) => {
        const number = parseFloat(val);
        if (Number.isNaN(number)) {
            return false
        }
        return true

    }, { message: 'Not a number pls  input a number' }),
})




export default function EditAccounts({ account, closeSideBar }: { account: any, closeSideBar: any }) {
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false)
    // const [month1, setMonth1] = useState(new Date());
    // const [month2, setMonth2] = useState(new Date());
    const divRef = useRef<HTMLDivElement | null>(null);
    const { toast } = useToast()

    const [newStartValue, setStartNewValue] = useState('');
    const [newEndValue, setEndNewValue] = useState('');
    const type: string[] = ["yearly", "monthly", "custom"]

    const { error, data } = useQuery({
        queryKey: ['accounts', token.access_token],
        queryFn: getAccountsName,
        staleTime: Infinity,

    })
    const mutation = useMutation({
        mutationFn: updateAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alltransactions'] })
            // queryClient.invalidateQueries({ queryKey: ['allBudgets'] })
            queryClient.invalidateQueries({ queryKey: ['allaccounts'] });
            closeSideBar()
            toast({
                description: `account succesfully updated`,

                className: "text-black h-16 bg-green-500"
            })
        },
        onError(error, variables, context) {
            closeSideBar()
            toast({
                description: `${error} `,
                className: "text-white h-16",
                variant: "destructive"
            })
        },
    })
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            balance: account.balance.$numberDecimal,
            name: account.name,
            type: account.type


        },
        mode: "onSubmit"
    })
    const { isPending } = mutation;




    async function handleOnSubmit(values: z.infer<typeof formSchema>) {
        if (!values) return;

        const newamount = parseFloat(values.balance).toFixed(2)
        const newValues = {
            ...values, amount: newamount
        }
        mutation.mutate({ queryKey: ['allaccounts', token.access_token], variable: newValues, id: account._id });

    }

    const originalValuesRef = useRef(form.formState.defaultValues);


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
            <RouterForm className="bg-white dark:bg-card h-full text-foreground w-full mb-20  text-black relative" onSubmit={form.handleSubmit(handleOnSubmit)}>
                <div className="header text-black dark:text-foreground w-full pt-5 text-2xl ">
                    <h1>Account Details</h1>
                </div>
                <div className="border h-fit  py-3 w-full px-3 mt-3 space-y-4 ">


                    <FormField
                        control={form.control}
                        name="name"
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

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem >
                                <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">TYPE</FormLabel>
                                <FormControl>
                                    <Input type="text" className="bg-white"  {...field} />

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
                        <DeleteAccountButton accountId={account._id} closeSideBar={closeSideBar} />
                    </div>

                </div>

                <div className="close-button  sticky bottom-0 py-5 bg-white dark:bg-card  px-3  right-3 border-top  z-[78555]  ">
                    <hr />
                    <div className="mt-5  flex justify-between">
                        <Button onClick={closeSideBar} className={buttonVariants({ variant: "default", className: "px-3  bg-orange-400 hover:bg-orange-500" })}>
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