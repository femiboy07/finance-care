import axios from 'axios';
import React, { createContext, useContext, useState, ReactNode, useEffect, useLayoutEffect } from 'react';
import { apiClient } from '../api/axios'
import useRefreshToken from '../hooks/useRefreshToken';


interface LoadingContextType {
  isLoading: boolean;

  showModal: boolean;
  setIsLoading: (loading: boolean) => void;
  setShowModal: (show: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false)


  // Clean up interceptors on component unmount


  return (
    <LoadingContext.Provider value={{ isLoading, showModal, setIsLoading, setShowModal }}>
      {children}
      {isLoading && <div className="loading-overlay">Loading...</div>}
      {/* {showModal && (
        <div className="modal">
          <p>Your session has expired. Please log in again to continue.</p>
          <button onClick={() => window.location.href = '/auth/login'}>
            Log in again
          </button>
        </div>
      )} */}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within a LoadingProvider');
  return context;
};

