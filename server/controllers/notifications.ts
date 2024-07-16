import { Server } from "socket.io";
import notification, { Notifications, TransactionMessage } from "../models/Notifications";
import { CreateTransactionRequest } from "./transcation";
import { ITranscations } from "../models/Transcation";
import mongoose from "mongoose";











export const modifMessages=(message:any)=>{
     
    return ``
}






export const sendNotificationMessage=async(io:any,userId:mongoose.Schema.Types.ObjectId,message:ITranscations,type:string)=>{

     
        switch(type){
            case "transaction_alert":
              const modifiedmessage={
                title:"New Transaction Alert",
                message:`You have a new transaction of ${message.amount} for '${message.category}'.`,
                action: "View Details",
                details: {
                    amount: message.amount,
                    category: message.category,
                    date: message.date,
                    description: message.description,
                }
             }
             const transactionNotify=await notification.create({
                     userId:userId,
                     type,
                     message:modifiedmessage,
                     createdAt:new Date(),
                     updatedAt:new Date()

                     
             })

             io.to(userId.toString()).emit('notification',modifiedmessage);

             await transactionNotify.save();

             default :
               return null;
         }
        

}