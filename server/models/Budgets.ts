import mongoose
, { model, models }from "mongoose";
import { transcationCategory } from "./Transcation";


export interface IBudgets{
        accountId:mongoose.Schema.Types.ObjectId,
        userId: mongoose.Schema.Types.ObjectId,          // ID of the user who owns the budget
        category: transcationCategory  | "",        // Category the budget is for (e.g., "food", "entertainment")
        amount: mongoose.Types.Decimal128,          // Budgeted amount
        period: 'monthly' | "yearly" | "custom",          // Budget period: "monthly" or "yearly"
        startDate?:Date,      // Start date of the budget period
        endDate?: Date,        // End date of the budget period
        createdAt:Date,      // Date when the budget was created
        updatedAt: Date       // Date when the budget was last updated
}



const userBudgets=new mongoose.Schema<IBudgets>({
     accountId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Accounts",
       required:true,

      },
       userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
       },
       category:{
        type:String,
        enum:transcationCategory || "",
        required:true,
        default:"",
     },
       amount:{
           type:mongoose.Types.Decimal128,
           required:true,
           },

       period:{
        type:"String",
        required:true,
        enum:["monthly","yearly","custom"],
       },
       startDate:{
        type:Date,
        
       },
       endDate:{
        type:Date,
        
       },
       createdAt:{
        type:Date,
        default:Date.now
       },
       updatedAt:{
        type:Date,
        default:Date.now
       },
},{
        timestamps:{createdAt:'createdAt',updatedAt:'updatedAt'}
})



const budgets=mongoose.model("Budgets",userBudgets);


export default budgets;


