import mongoose
, { model, models }from "mongoose";
import { transcationCategory } from "./Transcation";


export interface IBudgets{
        accountId:mongoose.Schema.Types.ObjectId,
        userId: mongoose.Schema.Types.ObjectId,          // ID of the user who owns the budget
        category: transcationCategory  | "",        // Category the budget is for (e.g., "food", "entertainment")
        amount: mongoose.Types.Decimal128,          // Budgeted amount
        period: 'monthly' | "yearly" | "custom",// Budget period: "monthly" or "yearly"
        spent:mongoose.Types.Decimal128,
        remaining:mongoose.Types.Decimal128,
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
        spent:{
           type:mongoose.Types.Decimal128,
           default:0.0,
           required:true,
        },
        remaining:{
           type:mongoose.Types.Decimal128,
           default:0.0,
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



userBudgets.pre('validate', function(next) {
   if (this.period === 'custom') {
       if (!this.startDate || !this.endDate) {
           return next(new Error('Start date and end date are required for custom period.'));
       }
       if (new Date(this.startDate) >= new Date(this.endDate)) {
           return next(new Error('Start date must be before end date.'));
       }
   } else {
       // If period is not 'custom', ensure dates are not provided
       if (this.startDate || this.endDate) {
           return next(new Error('Start date and end date should not be provided for non-custom periods.'));
       }
   }
   next();
});
const budgets=mongoose.model("Budgets",userBudgets);

export default budgets;


