import React, { createContext, useContext, useState, useEffect, SetStateAction } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchTransactions, fetchBudgets, getUser, fetchCategory, getMetrics, getAccounts, fetchTransaction } from '../api/apiRequest';
import axios, { AxiosResponse } from 'axios';
import { queryClient } from '..';
import { apiClient } from './LoadingContext';


interface TransactionQueryParams {
    name: string;
    category: string;
    year: string;
    month: string;
    limit: number;
    page: any;
    search: any

}


interface BudgetQueryParams {
    name: string;
    category: string;
    year: string;
    month: string;
}

interface DataContextProps {
    // transactions: any;
    // budgets: any;
    // accounts: any;
    // categories: any,
    // metrics: any,
    // username: any,
    // latesttransaction: any,
    logIn: (email: string, password: string) => Promise<AxiosResponse<any, any>>
    // userData: any;
    // updateBudgetQueryParams: (params: Partial<BudgetQueryParams>) => void;
    // updateTransactionQueryParams: (params: Partial<TransactionQueryParams>) => void;
    setIsUserLoggedIn: React.Dispatch<SetStateAction<boolean>>
    // isLoading: boolean;
    // isError: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Track login state


    const logIn = async (email: string, password: string): Promise<AxiosResponse<any, any>> => {
        const res = await axios.post('https://finance-care-14.onrender/api/auth/logIn', {
            email: email,
            password: password,
        }, { withCredentials: false })
        return res;
    }



    useEffect(() => {
        const storedLoginStatus = localStorage.getItem('isUserLoggedIn');
        if (storedLoginStatus === 'true') {
            setIsUserLoggedIn(true);
        }
    }, []);



    return (
        <DataContext.Provider value={{ logIn, setIsUserLoggedIn }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};