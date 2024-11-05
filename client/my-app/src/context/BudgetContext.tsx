import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBudgets } from '../api/apiRequest';
import { useLoading } from "./LoadingContext";

interface QueryParams {
    name: string;
    category: string;
    year: string;
    month: string;
}

interface BudgetProps {
    data: any; // Replace 'any' with the specific type for your budget data if available
    isLoading: boolean;
    updateQueryParams: (params: Partial<QueryParams>) => void;
    error: Error | null;

}

export const BudgetContext = createContext<BudgetProps | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactElement }) {
    const [queryParams, setQueryParams] = useState<QueryParams>({
        name: '',
        category: '',
        year: '',
        month: '',
    });



    // Fetch budgets using dynamic query params
    const { data, isLoading, error } = useQuery({
        queryKey: ['allbudgets', queryParams],
        queryFn: fetchBudgets,
        staleTime: 24 * 60 * 60 * 1000,

        // refetchOnWindowFocus: false
    });

    // Function to update query parameters
    const updateQueryParams = (params: Partial<QueryParams>) => {
        setQueryParams((prevParams) => ({
            ...prevParams,
            ...params,
        }));
    };






    return (
        <BudgetContext.Provider value={{ data, isLoading, error, updateQueryParams }}>
            {children}
        </BudgetContext.Provider>
    );
}

export function useBudget(): BudgetProps {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
}