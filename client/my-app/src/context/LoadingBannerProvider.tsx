import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "../hooks/useRequireAuth";
import { useCategory } from "./CategoryProvider";

type LoadingBannerContextType = {
    showBanner: boolean;
    setShowBanner: (show: boolean) => void;
};

const LoadingBannerContext = createContext<LoadingBannerContextType | undefined>(undefined);

export const LoadingBannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showBanner, setShowBanner] = useState(false);
    const { token } = useRequireAuth(); // Adjust based on how you retrieve the token
    const navigate = useNavigate();
    const { categories } = useCategory()
    useEffect(() => {
        // Show the banner when the page loads/reloads
        if (categories) {
            setShowBanner(false)
            return;
        }
        setShowBanner(true);

        // Hide the banner after a 3-second delay (adjust as needed)
        const timeout = setTimeout(() => setShowBanner(false), 3000);

        // Clean up on unmount
        return () => clearTimeout(timeout);
    }, [categories]);

    useEffect(() => {
        // Check if user is logged in and accessing login or register pages
        const currentPath = window.location.pathname;
        if (token && (currentPath === "/login" || currentPath === "/register")) {
            setShowBanner(true);
            const timeout = setTimeout(() => {
                setShowBanner(false);
                navigate("/dashboard", { replace: true });
            }, 10000); // 10 seconds delay

            // Clean up on unmount
            return () => clearTimeout(timeout);
        }
    }, [token, navigate]);

    return (
        <LoadingBannerContext.Provider value={{ showBanner, setShowBanner }}>
            {showBanner && <LoadingBanner />}
            {children}
        </LoadingBannerContext.Provider>
    );
};

// Component to render the loading banner
const LoadingBanner: React.FC = () => (
    <div className="loading-banner  fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-white text-xl">
        Redirecting to dashboard...
    </div>
);

export const useLoadingBanner = () => {
    const context = useContext(LoadingBannerContext);
    if (!context) {
        throw new Error("useLoadingBanner must be used within a LoadingBannerProvider");
    }
    return context;
};