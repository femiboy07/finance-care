import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/userAutthContext";
import { useEffect, useState } from "react";
import { apiClient, useLoading } from "../context/LoadingContext";
import axios from "axios";
import { useData } from "../context/DataProvider";
import { queryClient } from "..";
import useLoadingBanner from "./useLoadingBanner";
import { useSelectedFilter } from "../context/TableFilterContext";




const useRequireAuth = () => {
    // const {auth,setAuth}=useAuth();
    const token = localStorage.getItem('userAuthToken');
    const access_token = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.access_token;
    const [isLoading, setLoading] = useState(false);
    const { setIsUserLoggedIn } = useData()
    const { setShowModal } = useLoading()
    const { setRowSelection } = useSelectedFilter()
    // const [authToken,setAuthToken]=useState<string | null>(null);

    const removeToken = async () => {
        // setLoading(true);
        localStorage.removeItem("userAuthToken");
        setIsUserLoggedIn(false);

        setShowModal(false)
        localStorage.removeItem('isUserLoggedIn');
        queryClient.clear()
        // navigate('/auth/logout', { replace: true })
        setRowSelection({})
        try {
            // Simulate a delay with a promise
            await new Promise<void>((resolve) => setTimeout(resolve, 3000)); // 5 seconds delay
            // Remove the token from local storage
            // Perform the logout request
            await apiClient.post('/auth/logout', null, { withCredentials: true })

        } catch (error) {
            console.error('Error during logout:', error);
            localStorage.removeItem("userAuthToken");
            setIsUserLoggedIn(false);

            setShowModal(false)
            localStorage.removeItem('isUserLoggedIn');
            queryClient.clear()
            // navigate('/auth/logout', { replace: true })
            setRowSelection({})
        } finally {
            // Set loading state to false after all operations
            localStorage.removeItem("userAuthToken");
            setIsUserLoggedIn(false);

            setShowModal(false)
            localStorage.removeItem('isUserLoggedIn');
            queryClient.clear()
            // navigate('/auth/logout', { replace: true })
            setRowSelection({})
            // setLoading(false);

        }
    };

    const navigate = useNavigate();





    // useEffect(() => {
    //     if (!token) {
    //         navigate('/auth/login');

    //     }
    // }, [navigate, token]);

    return { token, removeToken, isLoading, setLoading };
}

export default useRequireAuth;