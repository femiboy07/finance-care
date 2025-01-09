import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLoading } from "../context/LoadingContext";
import { apiClient } from "../api/axios";
import { useData } from "../context/DataProvider";
import { queryClient } from "..";
import { useSelectedFilter } from "../context/TableFilterContext";
import useOnlineStatus from "./useOnlineStatus";
import { useAuth } from "../context/userAutthContext";




const useRequireAuth = () => {
    const {auth,setAuth}=useAuth()
    

    const [isLoading, setLoading] = useState(false);
    const { setIsUserLoggedIn } = useData()
    const { setShowModal } = useLoading()
    const { setRowSelection } = useSelectedFilter();
    const { isOnline } = useOnlineStatus()


    const clearLocalStorageAndState = () => {
        
        localStorage.removeItem("isUserLoggedIn");
        localStorage.removeItem("intervalKey");
        localStorage.removeItem("authToken")
        setIsUserLoggedIn(false);
        setShowModal(false);
        queryClient.clear();
        setRowSelection({});
        setAuth({access_token:null});

        
    };

    const removeToken = async () => {
        // Clear local storage immediately
        clearLocalStorageAndState();

        try {
            // Attempt to log out on the server (optional, handles server-side cleanup)
            await apiClient.post('/auth/logout', null);

            console.log("Successfully logged out from the server.");
        } catch (error) {
            clearLocalStorageAndState()

            console.error("Error during logout request:", error);
            // Log or handle the error appropriately
        } finally {
            // Final cleanup (if required)
            console.log("Local logout completed.");
        }
    };

    const navigate = useNavigate();

    return { auth, removeToken, isLoading, setLoading };
}

export default useRequireAuth;