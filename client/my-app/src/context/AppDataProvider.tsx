import { useIsFetching } from '@tanstack/react-query'
import React from 'react'
import { useCategory } from './CategoryProvider'
import { useBudget } from './BudgetContext'
import { useUser } from './UserProvider'
import { useTransaction } from './TransactionProvider'








export function AppDataProvider({ children }: { children: React.ReactNode }) {
    const { isLoading } = useCategory()
    const { isLoading: budgetLoader } = useBudget();
    const { isReady } = useUser();
    const { isLoading: transactionLoader, isReady: isRead } = useTransaction()


    console.log(isLoading, 'category is almost ready');
    console.log(budgetLoader, 'budget is almost ready');
    console.log(isReady, 'user is almost ready')

    return (
        <div>
            {isLoading || budgetLoader || isReady ? <div>
                Loading App.
            </div> : children}
        </div>
    )
}