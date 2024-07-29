import { MutationFunction, MutationKey, QueryFunction } from "@tanstack/react-query";
import axios from "axios";
import { apiClient } from "./axios";



export interface Metrics {
     totalBalance:number;
     totalIncome:number;
     totalExpense:number;
}

interface CreateTransactionParams {
  queryKey: [string, string];
  variable: any;
}


interface updateTransactionParams {
  queryKey: [string, string];
  variable: any;
  id:any
}



// export interface getMetrics extends QueryFunction{}


export async function getAccountsName({queryKey}:any){
  const [_key]=queryKey
    try{
    const res=apiClient.get("/account/get");

      const data=(await res).data;

      
      const newItem=data.allAccounts.map((item:any)=>{
           return {name:item.name,_id:item._id}
        })
      return newItem;
  

    }catch(err){
        console.log(err);
    }
}


export async function fetchTransactions({queryKey}:any){
  const [_key]=queryKey;
  try{
    const res=apiClient.get("/transactions/latesttransaction");

      const data=(await res).data;

      if(data){
          return data;
      }

    }catch(err){
        console.log(err);
    }
}




export async function fetchTransaction({queryKey}:any){
  const [_key,{name,category,year,month,page}]=queryKey;
  console.log(_key,name)
  const numbers=[1,2,3,4,5,6,7,8,9];
  

 const convert = month > 0  &&  month <= 9 ? `0${month}` : `${month}`

  try{
    if(name || category || page ){
      const res= await apiClient.get(`/transactions/listtransactions/${year}/${convert}?page=${page}&name=${name}&category=${category}`);
   const data= res.data;
   
   return data;
    }
    const res=axios.get(`/transactions/listtransactions/${year}/${convert}?page=${page}`);
    const data=(await res).data;
    

    return data;
      

    }catch(err){
        console.log(err);
    }
}

// export async function refreshToken({queryKey}:any){
//   const [_key,token]=queryKey;
//      try{
//            const res=await apiClient.post("/api/auth/refreshToken",{
//               refreshToken:token
//            })
//             localStorage.setItem("userAuthToken",JSON.stringify(res.data))
//            return res.data;
//      }catch(err){
//             console.log(err)
//      }
// }



export async function getMetrics({queryKey}:any):Promise<Metrics | any>{
  const [_key]=queryKey;

  try{
  const res= await apiClient.get('/transactions/metrics');

   const data= res.data;


   return data;
  }catch(err){
      console.log(err);
  }
}


export async function getAccounts({queryKey}:any){
  const [_key]=queryKey
    try{
    const res=apiClient.get("/account/get");

      const data=(await res).data;

      
      return data;
  

    }catch(err){
        console.log(err);
    }
}

interface DeleteTransactionParams {
  queryKey: string; // Adjust this based on the actual structure of your queryKey
  variable: string;
}


export async function deleteTransaction({queryKey,variable}:DeleteTransactionParams){
     const token=queryKey;
     console.log(token,variable)
    try{
    const res=apiClient.delete(`/transactions/delete/${variable}`);

      const data=(await res).data;

      
      return data;
  

    }catch(err){
        console.log(err);
    }
}

export async function updateTransaction({queryKey,variable,id}:updateTransactionParams){
  const [_key,token]=queryKey;
  console.log(token,variable)
  console.log(id)
 try{

  

 const res=await apiClient.put(`/transactions/update/${id}`,variable);

   const data= res.data;

   
   return data;
  

 }catch(err){
     console.log(err);
 }
}

export async function getUser({queryKey}:any){
  const [_key]=queryKey;
  try{
    
 const res=await apiClient.get(`/transactions/getusername`);

 const data= res.data;

 
 return data;

  }catch(err){
   console.log(err);
  }
}

export async function createTransaction({queryKey,variable}:CreateTransactionParams){
  const [_key]=queryKey;
  const data1=variable.newValues;
  console.log(variable);
  console.log(variable.type)
  try{
    if(!variable) return;
    const res=await apiClient.post(`/transactions/create`,{
       type:variable.type,
       date:variable.date,
       category:variable.category,
       description:variable.description,
       amount:variable.amount,
       accountId:variable.accountId,
    });

      const data= res.data;
      return data;
  }catch(err){
    console.log(err);
    return err;
    
    
  }
}

interface LoginParams{
  queryKey: string;
  variable: any;
}



