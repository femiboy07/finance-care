import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import "../src/app/globals.css";
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query';
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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // refetchOnMount: "always",
      refetchOnWindowFocus: true,


      retry(failureCount, error) {
        return navigator.onLine
      },
    }

  }
});

// const localStoragePersister = createSyncStoragePersister({
//   storage: window.localStorage,
// })


// persistQueryClient({
//   queryClient,
//   persister: localStoragePersister,
//   maxAge: 24 * 60 * 60 * 1000, // 24 
// })

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);



const router = createBrowserRouter([
  {
    path: '/',
    element: <App />

  },
  {
    path: '/auth',
    element: <AuthLayout />,

    children: [
      {
        path: 'login',
        element: <LoginPage />,

      },
      {
        path: 'register',
        element: <Register />,
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
        <AuthProvider>
          <LoadingProvider>

            <FilterProvider>
              <CategoryProvider>
                <BudgetProvider>
                  <RouterProvider router={router} />
                </BudgetProvider>
              </CategoryProvider>
            </FilterProvider>

          </LoadingProvider>
        </AuthProvider>
      </DataProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
