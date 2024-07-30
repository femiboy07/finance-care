import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart,Line,CartesianGrid,XAxis,YAxis, ResponsiveContainer, Legend, Tooltip, Area,AreaChart, CartesianAxis, Bar,BarChart} from 'recharts';
import { apiClient } from '../../context/LoadingContext';;
// import { BarChart } from 'lucide-react';



// interface StatsData{
//     expenseBy
// }


export default function StatsGraph(){
             const [loading,setLoading]=useState(false);
             const [error,setError]=useState('');
             const [data,setData]=useState<any | null>(null);
             const token = JSON.parse(localStorage.getItem('userAuthToken') || '{}');
             

            //  console.log(data,"stats")

             useEffect(()=>{
                if(token.access_token){
                    setLoading(true);
                    apiClient.get("/transactions/statistics?year=2024").then((res:any)=>{
                         
                             setLoading(false)
                             console.log(res.data);
                             setData(res.data.data)
                         
                         console.log(res)
                      }).catch((err:any)=>{
                         console.log(err)
                      });
               
                }
             },[token.access_token]);


       if(loading){
         return <div>Loading..</div>
       }      
    
    return (
         <ResponsiveContainer width="100%" height={300}  className="">
             <LineChart   data={data} margin={{top: 20, right: 20, bottom: 20, left: 20}}  >
       
             <CartesianGrid  strokeDasharray="2 2" />
             <XAxis dataKey="name"/>
             {/* <YAxis dataKey="expense"/>  */}
             <Tooltip/>
            
             <Legend/> 
             <Line dataKey="expense"  fill="#8884d8" />
             <Line dataKey="income" fill="#82ca9d"   />
          </LineChart>
        </ResponsiveContainer>
         
        
    )
}