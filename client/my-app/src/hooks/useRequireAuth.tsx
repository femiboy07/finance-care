import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/userAutthContext";
import { useEffect, useState } from "react";
import { apiClient, useLoading } from "../context/LoadingContext";
import axios from "axios";
import { useData } from "../context/DataProvider";
import { queryClient } from "..";
import useLoadingBanner from "./useLoadingBanner";
import { useSelectedFilter } from "../context/TableFilterContext";
import useOnlineStatus from "./useOnlineStatus";




const useRequireAuth = () => {
    // const {auth,setAuth}=useAuth();
    const token = localStorage.getItem('userAuthToken');
    const access_token = JSON.parse(localStorage.getItem('userAuthToken') || "{}")?.access_token;
    const [isLoading, setLoading] = useState(false);
    const { setIsUserLoggedIn } = useData()
    const { setShowModal } = useLoading()
    const { setRowSelection } = useSelectedFilter();
    const { isOnline } = useOnlineStatus()
    // const [authToken,setAuthToken]=useState<string | null>(null);

    const clearLocalStorageAndState = () => {
        localStorage.removeItem("userAuthToken");
        localStorage.removeItem("isUserLoggedIn");
        localStorage.removeItem("intervalKey");
        setIsUserLoggedIn(false);
        setShowModal(false);
        queryClient.clear();
        setRowSelection({});
    };

    const removeToken = async () => {
        // Clear local storage immediately
        clearLocalStorageAndState();

        try {
            // Attempt to log out on the server (optional, handles server-side cleanup)
            await apiClient.post('/auth/logout', null, { withCredentials: true });

            console.log("Successfully logged out from the server.");
        } catch (error) {
            console.error("Error during logout request:", error);
            // Log or handle the error appropriately
        } finally {
            // Final cleanup (if required)
            console.log("Local logout completed.");
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