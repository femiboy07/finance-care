import React from 'react'
import { Button, buttonVariants } from '../../@/components/ui/button'
import { PlusIcon } from 'lucide-react'

function AccountButton({ handleOpenSideBar }: { handleOpenSideBar: () => void }) {
    return (
        <div>
            <Button onClick={handleOpenSideBar} className={buttonVariants({ className: " bg-orange-400 lg:py-6 text-white hover:bg-slate-300 flex justify-center rounded-full items-center hover:opacity-45 lg:h-13  py-7   lg:rounded-md" })}>
                <PlusIcon className="w-[25px]  h-[25px] self-center" />
                <span className=" lg:block hidden">AddAccounts</span>
            </Button>
        </div>
    )
}

export default AccountButton