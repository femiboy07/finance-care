import React from "react";
import { useToast } from "../../@/components/ui/use-toast";
import useOnlineStatus from "../../hooks/useOnlineStatus";



export default function ShowNetworkToast() {
    const { toast, toasts } = useToast();
    const { isOnline } = useOnlineStatus();
    if (!isOnline) {
        return toast({ description: 'Network Error', variant: 'destructive', itemID: '4' })
    }

    return null
}