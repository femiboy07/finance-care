import { apiClient } from "../context/LoadingContext";



export interface Metrics {
     totalBalance:number;
     totalIncome:number;
     totalExpense:number;
}

interface CreateTransactionParams {
  queryKey: [string, string];
  variable: any;
  month:any;
  year:any;
}


interface updateTransactionParams {
  queryKey: [string, string];
  variable: any;
  id:any
}

interface CreateBudgetParams {
  queryKey: [string, string];
  variable: any;
}


interface updateBudgetParams {
  queryKey: [string, string];
  variable: any;
  month:number;
  year:number
}


interface DeleteTransactionParams {
  queryKey: string; // Adjust this based on the actual structure of your queryKey
  variable: string | string[];
}

interface DeleteAccountParams {
  queryKey: [string, string];
  variable:string | string[];
}


// export interface getMetrics extends QueryFunction{}


export async function getAccountsName({queryKey}:any){
  const [_key]=queryKey
    try{
    const res=apiClient.get("/account/get");

      const data=(await res).data;

      
      const newItem=data.allAccounts.map((item:any)=>{
           return {name:item.name,_id:item._id,type:item.type,systemAccount:item.isSystemAccount}
        })
      return newItem;
  

    }catch(err){
        console.log(err);
    }
}


export async function fetchTransaction({queryKey}:any){
  const [_key]=queryKey;
  try{
    const res=apiClient.get("/transactions/latesttransaction");

      const data=(await res).data;

      
          return data;
      

    }catch(err){
        console.log(err);
    }
}




export async function fetchTransactions({queryKey}:any){
  const [_key,{name,category,year,month,page,search,limit}]=queryKey;
  console.log(_key,name)
  const numbers=[1,2,3,4,5,6,7,8,9];
  

 const convert = month > 0  &&  month <= 9 ? `0${month}` : `${month}`

  try{
    if(name || category || page || search ||  limit){
      const res= await apiClient.get(`/transactions/listtransactions/${year}/${convert}?page=${page}&name=${name}&category=${category}&search=${search}&pageLimit=${limit}`);
     const data= res.data;
    return data;
    }
    // if(page || limit){
    // const res=apiClient.get(`/transactions/listtransactions/${year}/${convert}?page=${page}&pageLimit=${limit}`);
    // const data=(await res).data;
    // return data;
    // }

   
      

    }catch(err){
        console.log(err);
    }
}

export async function fetchBudgets({queryKey}:any){
  const [_key,{category,year,month}]=queryKey;
  console.log(_key)
  
  

 const convert = month > 0  &&  month <= 9 ? `0${month}` : `${month}`

  try{
  
    const res=apiClient.get(`/budgets/listbudgets/${year}/${convert}`);
    const data=(await res).data;
    return data;
    }catch(err){
        console.log(err);
        return err
    }
}



export async function fetchCategory({queryKey}:{queryKey?:any} ){
  const [_key]=queryKey;
  console.log(_key)
  
  
try{
   
    const res=apiClient.get(`/category/get`);
    const data=(await res).data;
    

    return data;
      

    }catch(err){
        console.log(err);
        return err
    }
}












export async function logOutUser(){
  try{
   const res=await apiClient.post('/auth/logout');

   const data=res.data;

   return data;
  }catch(err){
     return err;
  }
}



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



export async function deleteTransaction({queryKey,variable}:DeleteTransactionParams){
     const token=queryKey;
     console.log(token,variable)
     console.log(variable,"variablejjjjjjjj")
     const ids=typeof variable === 'string' ? [variable] : variable;
     console.log(ids)
    try{
    const res=apiClient.post(`/transactions/delete`,{ids:ids});

      const data=(await res).data;

      
      return data;
  

    }catch(err){
        console.log(err);
    }
}

// export async function updateTransaction({queryKey,variable,id}:updateTransactionParams){
//   const [_key,token]=queryKey;
//   console.log(token,variable)
//   console.log(id)
//  try{
//  const res=await apiClient.put(`/transactions/update/${id}`,variable);
//  if(res.status === 200){
//   return res.data;
//  }

// }catch (err: any) { // Update this to ensure `err` is of type `any`
//   // Check if the error has a response and message
//   if (err.response) {
//     return Promise.reject(err.response.data.message || 'An error occurred'); // Reject the error to propagate it
//   }
//   return Promise.reject(err.message || 'An unexpected error occurred');
// }
// }



export async function updateTransaction({queryKey,variable,id}:updateTransactionParams){
  const [_key,token]=queryKey;
  console.log(token,variable)
  console.log(id)
 try{
 const res=await apiClient.put(`/transactions/update/${id}`,variable);
 
  
    return res.data;
  
 

}catch (err: any) { // Update this to ensure `err` is of type `any`
  // Check if the error has a response and message
  
  if (err.response) {
    return Promise.reject(err.response.data.message || 'An error occurred'); // Reject the error to propagate it
  }
  return Promise.reject(err.message || 'An unexpected error occurred');
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

export async function createTransaction({queryKey, variable,month,year}: CreateTransactionParams) {
  const [_key] = queryKey;
  const data1 = variable.newValues;
  console.log(variable);
  console.log(variable.type);

  try {
    if (!variable) return;
    const res = await apiClient.post(`/transactions/create`, {
      type: variable.type,
      date: variable.date,
      category: variable.category,
      description: variable.description,
      amount: variable.amount,
      accountId: variable.accountId._id,
      month,
      year
    });

    
      return res.data;
    
  } catch (err: any) { // Update this to ensure `err` is of type `any`
    // Check if the error has a response and message
    if (err.response) {
      return Promise.reject(err.response.data.message || 'An error occurred'); // Reject the error to propagate it
    }
    return Promise.reject(err.message || 'An unexpected error occurred');
  }
}
export async function createBudget({queryKey,variable}:CreateBudgetParams){
  const [_key]=queryKey;
  const data1=variable.newValues;
  console.log(variable);
  console.log(variable.type)
  try{
    if(!variable) return;
    const res=await apiClient.post(`/budgets/create`,variable);
    const data= res.data;
    return data;
  }catch(err:any){
    if (err.response) {
      return Promise.reject(err.response.data.message || 'An error occurred'); // Reject the error to propagate it
    }
    return Promise.reject(err.message || 'An unexpected error occurred');
    
    
  }
}


export async function deleteBudget({queryKey,variable}:DeleteTransactionParams){
  const token=queryKey;
  console.log(token,variable)
 try{
 const res=apiClient.delete(`/budgets/delete/${variable}`);

   const data=(await res).data;
    return data;


 }catch(err){
  
     console.log(err);
     return err;
 }
}


export async function deleteAccount({queryKey,variable}:DeleteAccountParams){
  const [_,token]=queryKey;
  console.log(token,variable)
 try{
 const res=apiClient.delete(`/account/delete/${variable}`);
 const data=(await res).data;
   return data;
}catch(err){
     console.log(err);
     return err
 }
}


export async function updateBudget({queryKey,variable,year,month}:updateBudgetParams){
  const [_key,token]=queryKey;
  console.log(token,variable)
  
 try{
  const res= await apiClient.put(`/budgets/update/${year}/${month}`,variable);
   

   
    return res.data
   
   
  }catch (err: any) { // Update this to ensure `err` is of type `any`
    // Check if the error has a response and message
    if (err.response) {
      return Promise.reject(err.response.data.message || 'An error occurred'); // Reject the error to propagate it
    }
    return Promise.reject(err.message || 'An unexpected error occurred');
  }
 }




export async function updateAccount({queryKey,variable,id}:updateTransactionParams){
  const [_key,token]=queryKey;
  console.log(token,variable)
  console.log(id)
 try{
  const res=await apiClient.put(`/account/update/${id}`,variable);
   const data= res.data;
   return data;
  }catch(err:any){
    if (err.response) {
      return Promise.reject(err.response.data.message || 'An error occurred'); // Reject the error to propagate it
    }
    return Promise.reject(err.message || 'An unexpected error occurred');
 }
}


interface LoginParams{
  queryKey: string;
  variable: any;
}



