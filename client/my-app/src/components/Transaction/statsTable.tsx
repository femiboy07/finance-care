import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart,Line,CartesianGrid,XAxis,YAxis, ResponsiveContainer, Legend, Tooltip, Area,AreaChart, CartesianAxis} from 'recharts';



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
                    axios.get("http://localhost:5000/api/transactions/statistics?year=2024",{
                         headers:{
                           "Authorization":`Bearer ${token.access_token}`
                         }
                      }).then((res:any)=>{
                         
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
         <ResponsiveContainer width="100%" height={300}  className=" bg-white">
             <LineChart width={500}  height={300} className='h-full' data={data}  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
             <Line type="monotone"  stroke="#888d48" />
    
             <CartesianAxis stroke="#ccc" strokeDasharray="1 1" />
             <XAxis dataKey="name"/>
             <YAxis/>
             <Tooltip/>
             <Legend verticalAlign='top' horizAdvX={"right"} height={36} /> 
              <Line type={"monotone"} dataKey="income" label={{fill:"orange",fontSize:20,enableBackground:"white",color:"white"}} stroke="#8884d8" />
             <Line type={"monotone"} dataKey="expense" stroke="#82ca9d" /> 
             
          </LineChart>
          </ResponsiveContainer>
         
        
    )
}