import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { redirect } from 'react-router-dom';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const apiClient=axios.create({
    baseURL:"http://localhost:5000/api",
    withCredentials:true,
    headers:{
        "Content-Type":"application/x-www-form-urlencoded",

    }
})

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  




apiClient.interceptors.request.use(config=>{
  if (config.url === '/auth/logout') {
    return config;
}

    const token = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.access_token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
},error=>Promise.reject(error));



apiClient.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config;

     if (error.config.url === '/auth/logout') {
            return Promise.reject(error);
        }
    
    const expiresIn = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.expiresIn;

    if(error.response.status === 401 && error.response.data.message === "Refresh Token Required"){
         originalRequest._retry=false;
         setIsLoading(false)
         console.log("pls your session is expired login again");
         localStorage.removeItem("userAuthToken")
         window.location.href='/auth/login'
         return;
    }
    
    // If the error is due to token expiration
    if ((error.response.status === 401 && !originalRequest._retry) )  {
      originalRequest._retry = true;
      setIsLoading(true);
      try {
        // Refresh the token
        const refreshToken = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.refresh_token;
        console.log(refreshToken,"34");
        const { data } = await axios.post('http://localhost:5000/api/auth/refreshtoken', null, {withCredentials:true});
        
        // Save the new toke
        console.log(data)
        console.log('Refreshing token with:', refreshToken);
        localStorage.setItem('userAuthToken', JSON.stringify(data));
        apiClient.defaults.headers['Authorization'] = `Bearer ${data.access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
  
        window.location.reload();
        // Set the new token in the original request's headers
        // apiClient.defaults.headers['Authorization'] = `Bearer ${data.access_token}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login);

        console.log('Refresh token failed:', refreshError);
        return Promise.reject(refreshError);
      }finally{
        setIsLoading(false)
      }
    }
  
    return Promise.reject(error);
  });



  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};