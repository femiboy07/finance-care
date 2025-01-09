import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "./useRequireAuth";
import { useCategory } from "../context/CategoryProvider";
import { useAuth } from "../context/userAutthContext";

const useLoadingBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const { auth } = useAuth();
    const navigate = useNavigate();
    

    


    // useEffect(() => {
    //     if (!auth) {
    //         navigate('/auth/logout', { replace: true })
    //     }
    // }, [navigate, auth])

    useEffect(() => {
        const currentPath = window.location.pathname;
        const restrictedPaths = ["/auth/login", "/auth/register"];
        if (auth && restrictedPaths.includes(currentPath)) {

            setShowBanner(true);
            const timeout = setTimeout(() => {
                setShowBanner(false);
                navigate("/dashboard", { replace: true });
            }, 10000);
            return () => clearTimeout(timeout);
        }

    }, [auth, navigate]);

    return { showBanner };
};

export default useLoadingBanner;