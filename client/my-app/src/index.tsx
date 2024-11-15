import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import "../src/app/globals.css";
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import { onlineManager, QueryClient, QueryClientProvider, } from '@tanstack/react-query';
import "react-day-picker/dist/style.css";


//import components here;
import LoginPage from './Pages/Auth/Login';

import AuthLayout from './Layouts/AuthLayout';
import Register from './Pages/Auth/Register';
import DashBoardLayout from './Layouts/DashboardLayout';
import DashBoard from './Pages/DashBoard/dashboard';
import AccountPage from './Pages/DashBoard/account';
import TransactionPage, { loader } from './Pages/DashBoard/transactions';
import AuthProvider from './context/userAutthContext';
import { LoadingProvider } from './context/LoadingContext';
import BudgetsPage from './Pages/DashBoard/budgets';
import FilterProvider from './context/TableFilterContext';
import NotFound from './Pages/Errors/NotFound';
import { BudgetProvider } from './context/BudgetContext';

import { CategoryProvider } from './context/CategoryProvider';
import { AppDataProvider } from './context/AppDataProvider';
import { UserProvider } from './context/UserProvider';
import { TransactionProvider } from './context/TransactionProvider';
import { DataProvider } from './context/DataProvider';
import { QueryPersister } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import localforage from 'localforage';
import LogOut from './Pages/Auth/Logout';
import { toast, useToast } from './@/components/ui/use-toast';
import ShowNetworkToast from './components/common/ShowNetworkToast';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry infinitely for queries while offline
      retry: (failureCount, error) => {
        // Keep retrying if offline, stop retrying if online and fails
        return !navigator.onLine;
      },
      // retryOnMount: true,         // Retry when the component remounts
      // refetchOnWindowFocus: true, // Refetch on focus
      // refetchOnReconnect: true,   // Refetch when reconnected
      // refetchOnMount: 'always',   // Always refetch on mount
      staleTime: 0,               // No stale time, always fetch fresh
      // retryDelay: (retryAttempt) => Math.min(1000 * 2 ** retryAttempt, 30000), // Exponential backoff up to 30 seconds
    },
    mutations: {
      // Mutations won't retry automatically
      retry: false,

      onMutate: () => {
        if (!navigator.onLine) {
          throw new Error("Network Error: You are offline.");
        }
      },
      // Handle errors globally
      onError: (error) => {

        if (error.message === "Network Error: You are offline.") {
          // alert("Network Error: You are offline.");
          toast({
            description: 'Network Error',
            variant: 'destructive'
          })

        } else {
          console.error("Global Mutation Error:", error.message);
        }
      },
    },

  },
});

// const localStoragePersister = createSyncStoragePersister({
//   storage: window.localStorage,
// })


// persistQueryClient({
//   queryClient,
//   persister: localStoragePersister,
//   maxAge: 24 * 60 * 60 * 1000, // 24 
// })

onlineManager.setEventListener((setOnline) => {
  const handleOnline = () => setOnline(true);
  const handleOffline = () => setOnline(false);

  // Detect network changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Cleanup event listeners when no longer needed
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);



const router = createBrowserRouter([
  ...(process.env.NODE_ENV !== 'production') ?
    [{
      path: '/',
      element: <App />

    }] : [],
  {
    path: '/auth',

    element:

      <AuthLayout />
    ,

    children: [
      {
        path: 'login',
        element: <LoginPage />,

      },
      {
        path: 'register',
        element: <Register />,
      },

      {
        path: 'logout',
        element: <LogOut />
      }

    ],
  },
  {
    path: "dashboard",
    element: <DashBoardLayout />,
    children: [
      {
        index: true,

        element: <DashBoard />
      },
      {

        path: "transactions",
        element:
          <TransactionPage />,
      },
      {
        path: "transactions/:year?/:month?",
        element:
          <TransactionPage />,
      },

      {
        path: "accounts",
        element: <AccountPage />
      },

      {
        path: "budgets",
        element: <BudgetsPage />
      },
      {
        path: "budgets/:year?/:month?",
        element: <BudgetsPage />
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

root.render(
  <React.StrictMode>

    <QueryClientProvider client={queryClient}>

      <DataProvider>
        <LoadingProvider>




          {/* <LoadingProvider> */}
          {/* <AuthProvider> */}
          <FilterProvider>
            <CategoryProvider>
              <BudgetProvider>
                <RouterProvider router={router} />
              </BudgetProvider>
            </CategoryProvider>
          </FilterProvider>
          {/* </AuthProvider> */}
          {/* </LoadingProvider> */}




        </LoadingProvider>
      </DataProvider>

    </QueryClientProvider>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
