import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Card } from "../../@/components/ui/card";
import { useSelectedFilter } from "../../context/TableFilterContext";
import DeleteTransactionButton from "./DeleteTransaction";
import { formatAmount } from "../../utils/formatAmount";
import DeselectTransaction from "./DeselectTransaction";







const SelectedTransactions = ({ secondBox }: { secondBox: React.MutableRefObject<HTMLDivElement | null> }) => {

    const { selectedTotal, rowSelection, setSelectedTotal } = useSelectedFilter();
    // const selectedRef = useRef<HTMLDivElement | null>(null);

    let extractors: any = []
    console.log(rowSelection)

    const reflectOn = () => {
        for (let p in rowSelection) {
            const item = p.slice(0, 24);
            extractors.push(item)
        }
        return extractors;
    }

    const total = Number(selectedTotal);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         if (Object.keys(rowSelection).length > 0) {
    //             if (selectedRef.current) {
    //                 const scrollY = window.scrollY;
    //                 const tabOffsetTop = Math.abs(selectedRef.current.offsetHeight);
    //                 console.log(tabOffsetTop, "tabOffset")

    //                 // When the user scrolls past the element's original position
    //                 if (scrollY >= tabOffsetTop) {

    //                     // tabRef.current.style.top += 50;
    //                     selectedRef.current.style.position = 'fixed';
    //                     selectedRef.current.style.top = '1rem';  // Fix it 1rem from the top
    //                     // firstTab.current.style.display = 'none'
    //                 } else if (scrollY <= tabOffsetTop) {
    //                     // Reset position when scrolling back up
    //                     selectedRef.current.style.position = 'static';
    //                     // firstTab.current.style.display = 'flex'
    //                 }
    //             }
    //         }
    //     }


    //     window.addEventListener('scroll', handleScroll);

    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //     };
    // }, [rowSelection, selectedRef]);


    console.log(Object.keys(rowSelection), "rowselection")
    return (
        <div className=" mt-5 px-0 " ref={secondBox}>
            <>
                <div className=" flex-col group group-first:mt-[0em]  min-h-0 bg-white py-0 px-[0.5em] flex items-center  mb-[1em] mx-auto max-w-full w-[260px]  border first:border-t-0">
                    <div className="flex-grow mt-[2px] block after:block after:content-[''] after:h-0  after:overflow-hidden after:clear-both">
                        <div className="uppercase tracking-[0.5px] leading-normal text-center">Selected Transactions</div>
                    </div>
                    <div className="border-t-2 w-full bg-none m-0  flex-grow py-[0.75em] px-[0.5em] ">
                        <div className="average-amount flex flex-col text-[1em] mb-0  ">
                            <div className="flex justify-between items-center font-custom2 ">
                                <span className="pr-[20px] w-[70%]">Selected Total</span>
                                <span>{formatAmount(total)}</span>
                            </div>
                        </div>
                        <div className="mt-[0.5rem] flex-col space-y-2">
                            <DeleteTransactionButton transactionId={reflectOn()} icon={true} />
                            <DeselectTransaction />
                        </div>
                    </div>

                </div>
            </>
        </div>
    )
}

export default SelectedTransactions