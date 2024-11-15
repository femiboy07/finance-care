import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "../hooks/useRequireAuth";
import { useCategory } from "../context/CategoryProvider";

const useLoadingBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    const { token } = useRequireAuth();
    const navigate = useNavigate();
    const { isLoading, categories } = useCategory();

    useEffect(() => {
        if (!isLoading) {
            setShowBanner(false);
            return;
        }

        setShowBanner(true);
        const timeout = setTimeout(() => {
            setShowBanner(false);
        }, 10000);

        return () => clearTimeout(timeout);
    }, [isLoading]);


    useEffect(() => {
        if (!token) {
            navigate('/auth/logout', { replace: true })
        }
    }, [navigate, token])

    useEffect(() => {
        const currentPath = window.location.pathname;
        const restrictedPaths = ["/auth/login", "/auth/register"];
        if (token && restrictedPaths.includes(currentPath)) {

            setShowBanner(true);
            const timeout = setTimeout(() => {
                setShowBanner(false);
                navigate("/dashboard", { replace: true });
            }, 10000);
            return () => clearTimeout(timeout);
        }

    }, [token, navigate]);

    return { showBanner };
};

export default useLoadingBanner;