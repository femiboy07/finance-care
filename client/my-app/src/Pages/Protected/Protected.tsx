import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/userAutthContext';
import Banner from '../../components/common/Banner';





interface ProtectedPageProps {
  children: React.ReactNode;
}



const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();


  console.log("Auth State:", auth);
  // if (!auth || !auth?.access_token) return <div className='text-blue'>Loading...</div>;
  // Check if `auth` or `access_token` is missing
  if (!auth.access_token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Render children if user is authenticated
  return (
    <>
      {children}
    </>
  )
};

export default ProtectedPage;