import React, { useEffect, useState } from 'react'



export default function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOffline = () => {
            setIsOnline(false);
        }

        const handleOnline = () => {
            setIsOnline(true);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    }, [])
    return { isOnline }
}