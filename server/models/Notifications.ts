import mongoose from "mongoose";



interface BaseMessage {
        title: string;
        message: string;
        action: string;
}
    
export interface TransactionMessage extends BaseMessage {
        details: {
            amount: mongoose.Types.Decimal128;
            category: string;
            date: Date;
            description: string;
        };
 }
    
 export interface BudgetAlertMessage extends BaseMessage {
        details: {
            category: string;
            exceededAmount: mongoose.Types.Decimal128;
            budgetLimit: string;
            period: string;
        };
    }
    
export  interface UpcomingBillMessage extends BaseMessage {
        details: {
            amount: mongoose.Types.Decimal128;
            dueDate: Date;
            service: string;
        };
    }
    
   

export interface Notifications{
        userId: mongoose.Schema.Types.ObjectId,       // ID of the user to whom the notification is sent
        type: string,                              // Type of notification (e.g., "budget_alert", "upcoming_bill","transcation_alert")
        message: TransactionMessage | BudgetAlertMessage | UpcomingBillMessage,         // Notification message content
        status: string,          // Status of the notification: "unread", "read"
        createdAt: Date,      // Date when the notification was created
        updatedAt: Date,       // Date when the notification was last updated
}






const userNotifications=new mongoose.Schema<Notifications>({
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        } ,
        type:String,
        message:Object,
        status:{
            type:String,
            default:"unread"
        },
        createdAt:Date,
        updatedAt:Date,
});


const notification=mongoose.model('Notifications',userNotifications);


export default notification;