import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccounts, getMetrics, getUser } from "../api/apiRequest";


interface userProps {
    accounts: [];
    isLoading: boolean
    metrics: any;
    isReady: boolean,
    username: any


}


export const UserContext = createContext<userProps | null>(null);


export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [isReady, setIsReady] = useState(true);
    const { data, isLoading } = useQuery({ queryKey: ["allaccounts"], queryFn: getAccounts })
    const { data: metricsData, isLoading: metricsLoader } = useQuery({
        queryKey: ['metrics'],
        queryFn: getMetrics,

    })
    const { data: usernameData } = useQuery({
        queryKey: ['username'],
        queryFn: getUser,


    })
    useEffect(() => {
        if (data && metricsData && usernameData) {
            setIsReady(false)
        }

    }, [data, metricsData, usernameData])


    return (
        <UserContext.Provider value={{ accounts: data?.allAccounts, isLoading, metrics: metricsData, isReady, username: usernameData }}>
            {children}
        </UserContext.Provider>
    )

}

export const useUser = (): userProps => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
}