import React from 'react';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/axios';
import { Download, DownloadCloudIcon } from 'lucide-react';
import CsvDownloadButton from 'react-json-to-csv';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../@/components/ui/tooltip';
import { useToast } from '../../@/components/ui/use-toast';




export default function ExportDataToCsv({ month, year, data }: { month: any, year: any, data: [] }) {

    const toast = useToast()



    if (!data) {
        return null;
    }


    const handleData = data && data?.map((item: any) => ({ _id: item._id, category: item.category.name, amount: item.amount.$numberDecimal, description: item.description, account: item.name }))

    return (

        <TooltipProvider>
            <Tooltip >
                <TooltipTrigger >
                    <CsvDownloadButton filename={`transaction_data_${year}_${month}.csv`} className=' contents-none text-foreground' data={handleData} headers={['_id', 'category', 'amount', 'description', 'account']} >
                        <Download className=' dark:text-foreground text-orange-400 ' />
                    </CsvDownloadButton>
                </TooltipTrigger>
                <TooltipContent className='absolute right-6 bottom-5 w-fit'>Export to csv</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}