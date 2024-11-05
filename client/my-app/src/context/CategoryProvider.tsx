import React, { useContext, createContext, useState } from 'react';
import { fetchCategory } from '../api/apiRequest';
import { useQuery } from '@tanstack/react-query';




interface categoryProps {
    categories: string[] | null,
    isLoading: boolean
}


export const CategoryContext = createContext<categoryProps | null>(null);



export function CategoryProvider({ children }: { children: React.ReactNode }) {

    const { data: categoryData, isLoading } = useQuery({ queryKey: ['category'], queryFn: fetchCategory })


    return (
        <CategoryContext.Provider value={{ categories: categoryData?.data, isLoading }}>
            {children}
        </CategoryContext.Provider>
    )
}

export const useCategory = (): categoryProps => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error('useCategory must be used within a CategoryProvider');
    return context;
}