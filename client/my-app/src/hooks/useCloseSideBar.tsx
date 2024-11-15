import { useState, useEffect, Ref, MutableRefObject, useCallback, RefObject } from "react";





export const useCloseSideBar = (container: MutableRefObject<HTMLDivElement | null>) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [isSideTransaction, setIsSideTransation] = useState(true);
    const [isOpenAccounts, setIsOpenAccounts] = useState(true);
    const [isEditAccounts, setIsEditAccounts] = useState(true);

    const handleSide = useCallback((e: any) => {

        e.stopPropagation()

        const clickedInsideAddTransaction = e.target.closest('[data-bar="add-bar"]');
        const clickedInsideEditTransaction = e.target.closest('[data-bar="edit-bar"]');
        const clickedInsideHomeSideBar = document.querySelector('[data-bar="home-bar"]');
        const clickedInsideTransactionPage = document.querySelector('[data-page="transaction"]');

        console.log(e.target, "e.target")

        const body = document.querySelector('[data-portal="port"]');
        const atrr = body?.getAttribute('data-state')
        // Check if the click was inside any of the sidebar/portal areas
        if ((container.current && atrr === 'open') || (container.current && atrr === 'closed')) {
            return;
        }


        if ((container.current && !clickedInsideAddTransaction && !clickedInsideEditTransaction) || (container.current && e.target.contains(clickedInsideHomeSideBar))) {

            if (isOpen) {
                setIsOpen(false);
            }
            if (isSideTransaction) {
                setIsSideTransation(false);
            }
            if (isOpenAccounts) {
                setIsOpenAccounts(false);
            }
            if (isEditAccounts) {
                setIsEditAccounts(false)

            }
        }


    }, [container, isEditAccounts, isOpen, isOpenAccounts, isSideTransaction])

    useEffect(() => {
        document.addEventListener('mousedown', handleSide);

        return () => {
            document.removeEventListener('mousedown', handleSide)
        }
    }, [handleSide]);


    ;
    return { isOpen, setIsOpen, isSideTransaction, isEditAccounts, isOpenAccounts, setIsEditAccounts, setIsSideTransation };

}