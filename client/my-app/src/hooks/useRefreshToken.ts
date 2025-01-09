import { useMutation } from "@tanstack/react-query"
import { apiClient } from "../api/axios";
import { useAuth } from "../context/userAutthContext";








const useRefreshToken = () => {
    const { setAuth } = useAuth()


    const refresh = async () => {
        const response = await apiClient.post('/auth/refreshtoken',null);
        setAuth((prev: any) => {
            console.log(JSON.stringify(prev));
            console.log(response.data.access_token);
            return { ...prev, access_token: response.data.access_token }
        });
        return response.data.access_token;
    }
    return refresh;
}


export default useRefreshToken;