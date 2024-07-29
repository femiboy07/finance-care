import axios from 'axios';
import { error } from 'console';
import { useLoading } from '../context/LoadingContext';


export const apiClient=axios.create({
    baseURL:"http://localhost:5000/api",
    headers:{
        "Content-Type":"application/x-www-form-urlencoded",

    }
})



apiClient.interceptors.request.use(config=>{
    const token = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.access_token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
},error=>Promise.reject(error));



apiClient.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config;
   
    
    // If the error is due to token expiration
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh the token
        const refreshToken = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.refresh_token;
        console.log(refreshToken,"34");
        const { data } = await axios.post('http://localhost:5000/api/auth/refreshToken', {refreshToken});
        
        // Save the new toke
        console.log(data)
        console.log('Refreshing token with:', refreshToken);
        localStorage.setItem('userAuthToken', JSON.stringify(data));
        apiClient.defaults.headers['Authorization'] = `Bearer ${data.access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
  
        // Set the new token in the original request's headers
        // apiClient.defaults.headers['Authorization'] = `Bearer ${data.access_token}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login);

        console.log('Refresh token failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
  
    return Promise.reject(error);
  });

