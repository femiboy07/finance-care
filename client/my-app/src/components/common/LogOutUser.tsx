import { createPortal } from "react-dom"
import useRequireAuth from "../../hooks/useRequireAuth"
import UserLoggedOut from "../Modals/UserLoggedOut"
import { getUser } from "../../api/apiRequest";
import { useQuery } from "@tanstack/react-query";








export default function LogOutUser() {
    const { removeToken, isLoading } = useRequireAuth();

    const { data: usernameData, isPending } = useQuery({
        queryKey: ['username'],
        queryFn: getUser,
        staleTime: 24 * 60 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true
    })
    return (
        <>
            <button className={`min-h-[45px] ${isPending ? 'animate-pulse' : ''}  font-bold bg-slate-200 outline-none border-none  cursor-pointer min-w-[45px] flex relative justify-center items-center rounded-full `}>
                <span className="uppercase text-slate-400">{usernameData && usernameData.data[0]}</span>
            </button>

        </>
    )
}