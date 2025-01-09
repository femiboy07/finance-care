import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import { LoaderCircleIcon } from 'lucide-react';





const LoadingOverlay: React.FC = () => {
  const { isLoading } = useLoading();
  if (!isLoading) return null;
  return (
    <div className="loading-overlay fixed top-0 left-0 right-0 bottom-0 bg-slate-200 opacity-15  flex items-center justify-center z-[89555]">
      <div className="spinner animate-spin">
        <LoaderCircleIcon />
      </div>
      <p className='text-white bg-black px-3  py-3'>Refreshing your session...</p>
    </div>
  );
};

export default LoadingOverlay;