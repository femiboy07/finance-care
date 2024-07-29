import { useMutation } from "@tanstack/react-query"
// import { refreshToken } from "../api/apiRequest"
import { useEffect } from "react";







const useRefreshToken=()=>{
    const token=JSON.parse(localStorage.getItem("userAuthToken") || "{}")
    // const mutation=useMutation({
    //     mutationFn:refreshToken,
        

    // });
    
    // useEffect(()=>{
    //     const handleRefresh=async()=>{
            
    //         await mutation.mutateAsync({ queryKey: ['addtransaction', token.refresh_token]})
    //     }

    //     handleRefresh()
    // },[mutation, token.refresh_token])

    

}


export default useRefreshToken;