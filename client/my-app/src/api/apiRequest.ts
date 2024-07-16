import { MutationFunction, MutationKey, QueryFunction } from "@tanstack/react-query";
import axios from "axios";



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
  const [_key,token]=queryKey
    try{
    const res=axios.get("http://localhost:5000/api/account/get",{
           headers:{
            'Authorization':`Bearer ${token}`
           }
      });

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
  const [_key,token]=queryKey;
  try{
    const res=axios.get("http://localhost:5000/api/transactions/latesttransaction",{
           headers:{
            'Authorization':`Bearer ${token}`
           }
      });

      const data=(await res).data;

      if(data){
          return data;
      }

    }catch(err){
        console.log(err);
    }
}



export async function fetchTransaction({queryKey}:any){
  const [_key,token,{name,category,year,month,page}]=queryKey;
  console.log(_key,name)
  const numbers=[1,2,3,4,5,6,7,8,9];
  

 const convert = month > 0  &&  month <= 9 ? `0${month}` : `${month}`

  try{
    if(name || category || page ){
      const res= await axios.get(`http://localhost:5000/api/transactions/listtransactions/${year}/${convert}?page=${page}&name=${name}&category=${category}`,{
        headers:{
         'Authorization':`Bearer ${token}`
        }
   });
   const data= res.data;
   
   return data;
    }
    const res=axios.get(`http://localhost:5000/api/transactions/listtransactions/${year}/${convert}?page=${page}`,{
           headers:{
            'Authorization':`Bearer ${token}`
           }
      });
    const data=(await res).data;
    

    return data;
      

    }catch(err){
        console.log(err);
    }
}



export async function getMetrics({queryKey}:any):Promise<Metrics | any>{
  const [_key,token]=queryKey;

  try{
  const res= await axios.get('http://localhost:5000/api/transactions/metrics',{
      headers:{
          "Authorization":`Bearer ${token}`
      }
   });

   const data=(await res).data;


   return data;
  }catch(err){
      console.log(err);
  }
}


export async function getAccounts({queryKey}:any){
  const [_key,token]=queryKey
    try{
    const res=axios.get("http://localhost:5000/api/account/get",{
           headers:{
            'Authorization':`Bearer ${token}`
           }
      });

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
    const res=axios.delete(`http://localhost:5000/api/transactions/delete/${variable}`,{
      
      headers:{
        'Authorization':`Bearer ${token}`,
         "Content-Type":'application/x-www-form-urlencoded'
       }  
      });

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

  

 const res=await axios.put(`http://localhost:5000/api/transactions/update/${id}`,
    //  type:variable.type,
    //  category:variable.category,
    //  date:variable.date,
    //  amount:variable.amount,
    //  accountId:variable.accountId,
    //  description:variable.description,
     variable
   
 ,{
   
   headers:{
     'Authorization':`Bearer ${token}`,
      "Content-Type":'application/x-www-form-urlencoded'
    }  
   });

   const data= res.data;

   
   return data;
  

 }catch(err){
     console.log(err);
 }
}

export async function getUser({queryKey}:any){
  const [_key,token]=queryKey;
  try{
    
 const res=await axios.get(`http://localhost:5000/api/transactions/getusername`,{headers:{
   'Authorization':`Bearer ${token}`,
   
  }  
 });

 const data= res.data;

 
 return data;

  }catch(err){
   console.log(err);
  }
}

export async function createTransaction({queryKey,variable}:CreateTransactionParams){
  const [_key,token]=queryKey;
  const data1=variable.newValues;
  console.log(variable,token);
  console.log(variable.type)
  try{
    const res=await axios.post(`http://localhost:5000/api/transactions/create`,{
       type:variable.type,
       category:variable.category,
       description:variable.description,
       amount:variable.amount,
       accountId:variable.accountId,
    },{
      
      headers:{
        'Authorization':`Bearer ${token}`,
         "Content-Type":'application/x-www-form-urlencoded'
       }  
      });

      const data= res.data;
      return data;
  }catch(err){
    return err;
    
  }
}


