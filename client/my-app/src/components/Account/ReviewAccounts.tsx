import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "../../@/components/ui/card";
import { HomeIcon } from "lucide-react";
import { formatAmount } from "../../utils/formatAmount";


const randomColors = () => {
    let value = '#'; // Start with the hash symbol for hex color
    const hexDigits = '0123456789ABCDEF'; // Hexadecimal digits

    // Loop 6 times to get 6 random characters for a hex color code
    for (let i = 0; i < 6; i++) {
        // Add a random digit from the hexDigits string
        value += hexDigits[Math.floor(Math.random() * 16)];
    }

    return value;
};

export default function ReviewAccounts({ accounts }: { accounts: [] }) {
    console.log(accounts);
    const color = useRef<string | null>('')
    const [bgColor, setBgColor] = useState(randomColors());
    console.log(bgColor);
    const filterAccounts = accounts && accounts.filter((item: any) => item.isSystemAccount !== true)


    return (
        <div id="sticky" className="mb-[4rem] font-custom ">
            <Card className=" relative flex-col flex leading-7 items-center mb-[1em] mx-auto max-w-[260px]  w-[260px] p-[0.75em]">
                <HomeIcon />
                <h1>REVIEW { } ACCOUNTS</h1>
                <h6>Everything looks good</h6>
            </Card>

            <Card className="relative flex-col flex leading-7 text-sm  mb-[1em] mx-auto max-w-[260px] w-[260px] ">
                <div className="border-bottom text-sm flex-col px-[13px]  border-black after:border-bottom-2 w-full h-6 flex text-center  py-4 justify-center">
                    <h1 className="mb-2  mt-2">ACCOUNTS OVERVIEW</h1>
                    <hr className="border-slate-200 w-full" />
                </div>
                <ul className="list-accounts mt-3 mb-3 px-[13px]">
                    {filterAccounts && filterAccounts.map((item: any) => (
                        <li className=" flex  h-full w-full list-image ">
                            <div className="flex flex-col">
                                <span className={` before:w-2 before:content-[''] text-[${bgColor}] before:mr-[5px] before:inline-block before:h-2 before:bg-[${bgColor}] before:rounded-full before:pl-[2px]`}>{item.name}</span>
                                <span>1 active account</span>
                            </div>
                            <span className="ml-auto self-center ">{formatAmount(item.balance.$numberDecimal)}</span>

                        </li>
                    ))}
                    {!filterAccounts && <span className="text-center w-full flex justify-center">You have no accounts linked yet</span>}
                </ul>
            </Card>
        </div >
    )
}