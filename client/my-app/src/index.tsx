import React from 'react';
import ReactDOM from 'react-dom/client';
import "../src/app/globals.css";
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient,QueryClientProvider, } from '@tanstack/react-query';
import "react-day-picker/dist/style.css";


//import components here;
import LoginPage,{InvalidUser, action as LoginAction} from './Pages/Auth/Login';
import AuthLayout from './Layouts/AuthLayout';
import Register from './Pages/Auth/Register';
import DashBoardLayout from './Layouts/DashboardLayout';
import DashBoard from './Pages/DashBoard/dashboard';
import AccountPage from './Pages/DashBoard/account';
import TransactionPage, { loader } from './Pages/DashBoard/transactions';
import { ProtectedPage } from './Pages/Protected/Protected';
import EditTransaction from './components/Transaction/EditTransaction';


export const queryClient=new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router=createBrowserRouter([
  {
    path:'/',
    element:
   
     <App/>
  },
  {
    path:'/auth',
    element:
    
    <AuthLayout/>
    ,
    children:[
      {
        path:'login',
        element:
        
        <LoginPage/>
        ,
        action:LoginAction,
        errorElement:<InvalidUser/>
      },
      {
        path:'register',
        element:<Register/>,
      }
      
    ],
  },
  

  {
    path:"/dashboard",
    
    element:
   <QueryClientProvider client={queryClient}>
   <ProtectedPage>
   <DashBoardLayout/>
   </ProtectedPage>,
  </QueryClientProvider>,
   children:[
      {
        index:true,
        element:
       <DashBoard/>
       
      },
      {
        path:"transactions",
        element:
        <TransactionPage/>,
       
      
      },

      {
        path:"transactions/:year?/:month?",
        element:
        <TransactionPage/>,
       
      
      },

      {
        path:"accounts",
        element:<AccountPage/>
      }
    ]
  }

]);

root.render(
  <React.StrictMode>
  <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
