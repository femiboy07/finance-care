import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart,Line,CartesianGrid,XAxis,YAxis, ResponsiveContainer, Legend, Tooltip, Area,AreaChart, CartesianAxis, Bar,BarChart} from 'recharts';
import { apiClient } from '../../context/LoadingContext';;
// import { BarChart } from 'lucide-react';



// interface StatsData{
//     expenseBy
// }


export default function StatsGraph({intervals}:{intervals:string}){
             const [loading,setLoading]=useState(false);
             const [error,setError]=useState('');
             const [data,setData]=useState<any | null>(null);
             const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
             

            //  console.log(data,"stats")

             useEffect(()=>{
                if(token.access_token){
                    setLoading(true);
                    apiClient.get(`/transactions/statistics?interval=${intervals}`).then((res:any)=>{
                         
                             setLoading(false)
                             console.log(res.data);
                             setData(res.data.data)
                         
                         console.log(res)
                      }).catch((err:any)=>{
                         console.log(err)
                      });
               
                }
             },[token.access_token,intervals]);


       if(loading){
         return <div className='text-center flex flex-col justify-center items-center h-full'>Loading..</div>
       }      
    
    return (
         <ResponsiveContainer width="100%" height="90%"  className="">
             <LineChart   data={data} height={500} width={100} margin={{top: 20, bottom: 20,left:20,right:20}}  >
             <CartesianGrid  strokeDasharray="2 2" />
             <XAxis dataKey="name"/>
            
             <Tooltip/>
            
             <Legend/> 
             <Line dataKey="expense"  fill="#8884d8" />
             <Line dataKey="income" fill="#82ca9d"   />
          </LineChart>
        </ResponsiveContainer>
         
        
    )
}