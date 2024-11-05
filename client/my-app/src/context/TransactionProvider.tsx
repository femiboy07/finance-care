import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBudgets, fetchTransaction, fetchTransactions } from '../api/apiRequest';
import { useLoading } from "./LoadingContext";

interface QueryParams {
    name: string;
    category: string;
    year: string;
    month: string;
    limit: number;
    page: any;
    search: any

}

interface TransactionProps {
    data: any; // Replace 'any' with the specific type for your budget data if available
    isLoading: boolean;
    updateQueryParams: (params: Partial<QueryParams>) => void;
    isError: any;
    latesttransaction: any,
    isReady: boolean

}

export const TransactionContext = createContext<TransactionProps | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactElement }) {
    const [queryParams, setQueryParams] = useState<QueryParams>({
        name: '',
        category: '',
        limit: 25,
        year: '',
        month: '',
        page: 1,
        search: ''
    });
    const [isReady, setIsReady] = useState(true)


    // Fetch budgets using dynamic query params
    const { data, isLoading, isError } = useQuery({
        queryKey: ['alltransactions', queryParams],
        queryFn: fetchTransactions,
        // staleTime: 24 * 60 * 60 * 1000,

        // refetchOnWindowFocus: false
    });

    const { data: latestData, isPending, isSuccess, error } = useQuery({
        queryFn: fetchTransaction,
        queryKey: ["latesttransaction"]
    });

    console.log(latestData, 'lllll')

    // Function to update query parameters
    const updateQueryParams = (params: Partial<QueryParams>) => {
        setQueryParams((prevParams) => ({
            ...prevParams,
            ...params,
        }));
    };








    return (
        <TransactionContext.Provider value={{ data, isLoading, isError, updateQueryParams, latesttransaction: latestData?.transactions, isReady: !!data && !!latestData }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransaction(): TransactionProps {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
}