import React from 'react';
import { Button, buttonVariants } from '../../@/components/ui/button';
import { Circle } from 'lucide-react';
import { useSelectedFilter } from '../../context/TableFilterContext';



const DeselectTransaction = () => {
    const { setRowSelection } = useSelectedFilter()
    return (
        <Button className={buttonVariants({ variant: "outline", className: 'relative border-orange-300 w-full h-full text-orange-300 ' })} onClick={() => setRowSelection({})}>
            <div className='absolute left-0 top-0 bottom-0 flex justify-center items-center bg-slate-200 h-full w-8 '>
                <Circle className=' w-full h-5' />
            </div>
            <div className=''>DESELECT ALL</div>
        </Button>
    )
}

export default DeselectTransaction;