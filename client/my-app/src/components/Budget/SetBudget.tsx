import React, { useEffect, useRef, useState } from 'react';
import MyInput from '../common/MyInput';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../..';
import { toast } from '../../@/components/ui/use-toast';
import { deleteBudget, updateBudget } from '../../api/apiRequest';
import { useOutletContext } from 'react-router-dom';
import { ContextType } from '../../Layouts/DashboardLayout';
import { LoaderCircle, LucideXCircle, XCircle, XCircleIcon } from 'lucide-react';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../@/components/ui/tooltip';
import { Input } from '../../@/components/ui/input';




export default function SetBudget({ placeholder, defaultValue, value, name, className, type, category, remaining, spent, id }: { placeholder: string, defaultValue: any, value: any, name: any, className: any, type: any, category: any, remaining: any, spent: any, id: any }) {
    const { year, month } = useOutletContext<ContextType>();
    const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}')
    const [text, setText] = useState(value);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selected, setSelected] = useState(false);
    const [touch, setOnTouch] = useState(false);
    const mutation = useMutation({
        mutationFn: updateBudget,
        onSuccess: (data: any) => {
            // queryClient.invalidateQueries({ queryKey: ['alltransactions'] })
            queryClient.invalidateQueries({ queryKey: ['editbudget'] })
            queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
            queryClient.invalidateQueries({ queryKey: ['allaccounts'] })
            // updateFrontendBudgets(data)
            console.log(data, 'onSucess')

            toast({
                description: `budget succesfully updated`,
                // variant:"destructive",
                className: "text-black h-16 bg-green-500"
            })

        },
        onError: (error) => {

            toast({
                description: `${error}`,
                className: "text-white h-16",
                variant: "destructive"
            })
            setText('')
        }
    })


    const mutationDelete = useMutation({
        mutationFn: deleteBudget,
        // mutationKey:['delete',token.access_token,{transactionId}],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
            toast({
                description: "budget sucessfully deleted",
                className: "text-black bg-white"
            })
        }
    })


    const handleDelete = async (tokens: string, transaction: string) => {

        mutationDelete.mutate({ queryKey: tokens, variable: transaction });

    }



    const newData = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(text)
    const handleFocus = () => {


        //  setShowDate(true)

        const rawValue = name === 'budget'
            ? text
                .replace(/[₦$,]/g, '') // Remove currency symbols and commas
                .replace(/\.00$/, '') // Remove '.00' if it's at the end
                .trim() // Trim any extra spaces
            : text;
        setText(rawValue);


    };


    const handleBlur = async (e: any) => {
        e.preventDefault();
        setSelected(false)
        setText(newData)


        // if (newData === text) {
        //     return;
        // }
        console.log(text, defaultValue, "sssdff")
        if (name === 'budget' && text === '') {
            setText(value)
            return
        }

        if (name === 'budget' && isNaN(text)) {
            // setText('');
            setText(value)
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
            const modifiedMonth = parseInt(month, 10)
            // Prepare the value based on the input field's name
            // Default case for other field names;
            const newValues = {
                amount: text,
                category: category,
                spent: spent,
                remaining: remaining,
                year: year,
                month: modifiedMonth
            }
            setText(newData)
            // Update the transaction using mutation
            mutation.mutate({ queryKey: ['editbudget', token.access_token], variable: newValues, year, month: modifiedMonth });

        }

    };
    const { isPending } = mutation;
    const { isPending: pendingBudget } = mutationDelete;
    useEffect(() => {
        if (selected && inputRef.current) {
            inputRef.current?.focus();
        }
    }, [selected])

    useEffect(() => {

        setText(value);
        // window.location.reload()
    }, [value]);

    return (
        <div className={`  ${touch ? 'text-orange-400' : ''}    relative hover:border-orange-400 flex flex-shrink flex-grow-0   flex-initial    items-center`}>
            <>
                <td className=' w-8 flex justify-center border-none  h-full items-center  flex-grow-0  ' >
                    {text !== '' && touch ?
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <LucideXCircle onClick={() => handleDelete(token.access_token, id)} className='border-none cursor-pointer text-red-500 z-40' size={18} />
                                </TooltipTrigger>
                                <TooltipContent>unset budget</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        : null}
                    {pendingBudget && <LoaderCircle className=" animate-spin absolute flex items-center self-center bottom-1/2 right-4 top-1/2 w-4 h-4" />}
                </td>
                <td onClick={() => setSelected(true)} className={` h-full w-full flex flex-grow-0 hover:border-1 hover:border-orange-400`}>

                    {isPending && <LoaderCircle className=" animate-spin absolute flex items-center self-center bottom-1/2 right-4 top-1/2 w-4 h-4" />}
                    {/* {pendingBudget && <LoaderCircle className=" animate-spin absolute flex items-center self-center bottom-1/2 right-4 top-1/2 w-4 h-4" />} */}
                    {selected ? (
                        <div className={`cursor-text rounded-[2px] px-[13px] flex-grow-0   h-[37px] max-w-full w-full border border-orange-400`}>
                            {/* <div className={`${'relative  py-[9px] flex flex-grow-0 w-full hover:border-orange-400'}`}> */}

                            <input
                                style={{ height: '100%', width: '100%' }}
                                ref={inputRef}
                                type={type}
                                value={text}
                                name={name}
                                className={`${className} py-0  inline-flex w-fit   px-[5.1px] border-0 m-0 z-20 text-foreground   flex-wrap flex-grow-0   outline-none text-left leading-tight shadow-none`}
                                defaultValue={defaultValue}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={placeholder}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                            />

                            {/* </div> */}
                        </div>
                    ) : (
                        <div className={` h-[37px] text-right hover:border flex-grow-0 hover:border-orange-400 border-l-0 w-full flex `}>
                            <div className='h-[37px] text-right '>
                                <div className='border-none  hover:border-solid   pl-[13px] text-right pr-[13px] w-full h-[36px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis'>
                                    <span className='inline-block w-full overflow-hidden '>{text}</span>
                                </div>

                            </div>
                        </div>
                    )}

                </td>
            </>

        </div>
    )
}