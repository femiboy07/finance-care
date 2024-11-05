import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Important to send cookies
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

interface LoadingContextType {
  isLoading: boolean;

  showModal: boolean;
  setIsLoading: (loading: boolean) => void;
  setShowModal: (show: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);




  // Add request interceptor to add token to headers
  apiClient.interceptors.request.use(config => {
    const token = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.access_token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  }, error => Promise.reject(error));

  // Add response interceptor to handle errors and refresh tokens
  const responseInterceptor = apiClient.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (error.config.url === '/auth/logout') {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && error.response.data.message === "Refresh Token Required") {
        setShowModal(true);
        setIsLoading(false)
        localStorage.removeItem("userAuthToken");
        return Promise.reject(error);
      }

      if (error.response?.status === 403 && error.response.data.message === "Invalid Refresh Token") {
        setShowModal(true);
        localStorage.removeItem("userAuthToken");
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        setIsLoading(true);
        try {
          const { data } = await apiClient.post('/auth/refreshtoken', null); // Automatically sends cookies
          localStorage.setItem('userAuthToken', JSON.stringify(data));
          apiClient.defaults.headers['Authorization'] = `Bearer ${data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
          return apiClient(originalRequest); // Retry original request
        } catch (refreshError) {
          setShowModal(true);
          localStorage.removeItem("userAuthToken");
          return Promise.reject(refreshError);
        } finally {
          setIsLoading(false); // Ensure loading is false regardless of the result
        }
      }

      setIsLoading(false); // Ensure loading is false if other errors occur
      return Promise.reject(error);
    }
  );

  // Clean up interceptors on component unmount


  return (
    <LoadingContext.Provider value={{ isLoading, showModal, setIsLoading, setShowModal }}>
      {children}
      {isLoading && <div className="loading-overlay">Loading...</div>}
      {showModal && (
        <div className="modal">
          <p>Your session has expired. Please log in again to continue.</p>
          <button onClick={() => window.location.href = '/auth/login'}>
            Log in again
          </button>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within a LoadingProvider');
  return context;
};