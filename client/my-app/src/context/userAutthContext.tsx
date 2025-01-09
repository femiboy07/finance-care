import { Dispatch } from "@reduxjs/toolkit";
import React, { ReactNode, createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { apiClient } from "../api/axios";


interface UserAuth {
  auth: { access_token: string | null };
  setAuth: React.Dispatch<React.SetStateAction<any | null>>;
}

const UserContextAuth = createContext<UserAuth | undefined>(undefined);

export const useAuth = (): UserAuth => {
  const context = useContext(UserContextAuth);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<{ access_token: string | null }>({ access_token: localStorage.getItem("authToken") });


  useEffect(() => {
    if (auth.access_token) {
      localStorage.setItem("authToken", auth.access_token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [auth]);

  // useLayoutEffect(() => {
  //   // Save auth to localStorage whenever it changes
  //   const validateToken = async () => {
  //     if (auth.access_token) {
  //       try {
  //         const response = await apiClient.get('/auth/validate');
  //         if (response.status === 200) {
  //           console.log(response.data.access_token, 'access_token');
  //           setAuth({ access_token: response.data.access_token })
  //         }
  //       } catch (err: any) {
  //         console.log(err)
  //         setAuth({ access_token: null })
  //       }
  //     }
  //   }
  //   validateToken()
  // }, [auth]);




  useLayoutEffect(() => {

    const request = apiClient.interceptors.request.use((config: any) => {

      config.headers['Authorization'] = auth ? `Bearer ${auth?.access_token}` : config.headers.Authorization;
      return config;

    })

    return () => {
      apiClient.interceptors.request.eject(request)
    }
  }, [auth])


  useLayoutEffect(() => {



    const response = apiClient.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.config.url === '/auth/logout') {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && error.response.data.message === "Refresh Token Required") {
          // setShowModal(true);
          // setIsLoading(false);

          localStorage.removeItem("userAuthToken");
          return Promise.reject(error);
        }

        if (error.response?.status === 403 && error.response.data.message === "Invalid Refresh Token") {
          // setShowModal(true);

          localStorage.removeItem("userAuthToken");
          return Promise.reject(error);
        }
        // const expirationTime = getTokenExpiration(token);
        // const now = Date.now();
        // const buffer = 5 * 60 * 1000;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // setIsLoading(true);
          try {
            const response = await apiClient.post('/auth/refreshtoken', null);
            setAuth((prev: any) => {
              console.log(JSON.stringify(prev));
              console.log(response.data.access_token);
              return { ...prev, access_token: response.data.access_token }
            });
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
            return apiClient(originalRequest); // Retry original request
          } catch (refreshError) {
            setAuth({ access_token: null })
            // setShowModal(true);
            return Promise.reject(refreshError);
          } finally {
            // setIsLoading(false); // Ensure loading is false regardless of the result
          }
        }

        // setIsLoading(false); // Ensure loading is false if other errors occur
        return Promise.reject(error);
      }
    );
    return () => {
      apiClient.interceptors.response.eject(response)
    }
  }, [setAuth])


  return (
    <UserContextAuth.Provider value={{ auth, setAuth }}>
      {children}
    </UserContextAuth.Provider>
  );
};


export default AuthProvider;



