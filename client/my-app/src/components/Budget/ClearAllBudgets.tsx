import React from 'react';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../@/components/ui/tooltip';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import { useToast } from '../../@/components/ui/use-toast';
import { queryClient } from '../..';
import { LoaderCircleIcon } from 'lucide-react';







export default function ClearAllBudgets({ month, year }: { month: number, year: number }) {
    const { toasts, toast } = useToast()

    const mutation = useMutation({
        mutationFn: async () => {
            await apiClient.post('/budgets/clearbudget', {
                month: month,
                year: year
            })

        },

        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({ queryKey: ['editbudget'] })
            queryClient.invalidateQueries({ queryKey: ['allbudgets'] })
            queryClient.invalidateQueries({ queryKey: ['allaccounts'] })
            toast({
                description: 'budgets cleared',
                className: 'text-black bg-white border-l-4 border-l-black',
                variant: 'default'
            })
        },

        onError(error, variables, context) {
            toast({
                description: `${error}`,
                variant: 'destructive'
            })
        },
    })


    async function handleClearBudget() {
        mutation.mutate();
    }

    const { isPending } = mutation;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Button onClick={handleClearBudget} className={buttonVariants({ variant: "outline", className: ' text-xs px-8 hover:bg-transparent  text-orange-400 border-orange-400' })}>
                        CLEAR BUDGET
                        <span className='pl-2'>?</span>
                        {isPending && <LoaderCircleIcon size={18} color='orange' />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Unset all of this months budget
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}