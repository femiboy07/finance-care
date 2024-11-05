import mongoose
, { Document,
model, models }from "mongoose";
import { transcationCategory } from "./Transcation";


export interface IBudgets extends Document{
        
        userId: mongoose.Schema.Types.ObjectId,          // ID of the user who owns the budget
        category: mongoose.Schema.Types.ObjectId,        // Category the budget is for (e.g., "food", "entertainment")
        budget: mongoose.Types.Decimal128,          // Budgeted amount
        period: 'monthly' | "yearly" | "custom",// Budget period: "monthly" or "yearly"
        spent:mongoose.Types.Decimal128,
        remaining:mongoose.Types.Decimal128,
        month:number,
        year:number,
        createdAt:Date,      // Date when the budget was created
        updatedAt: Date       // Date when the budget was last updated
}



const userBudgets=new mongoose.Schema<IBudgets>({
    
       userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
       },
       category:{
        type:mongoose.Types.ObjectId,
        ref:"Category",
        required:true,
        default:"",
       },
       budget:{
           type:mongoose.Types.Decimal128,
           default:'',
           required:true,
        },
        month:{
            type:Number,
            
        },
        year:{
            type:Number,
            
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

      
       createdAt:{
        type:Date,
        default:Date.now
       },
       updatedAt:{
        type:Date,
        default:Date.now
       },
},{
        timestamps:true
})



userBudgets.pre('validate', function(next) {
//    if (this.period === 'custom') {
//        if (!this.startDate || !this.endDate) {
//            return next(new Error('Start date and end date are required for custom period.'));
//        }
//        if (new Date(this.startDate) >= new Date(this.endDate)) {
//            return next(new Error('Start date must be before end date.'));
//        }
//    } else {
//        // If period is not 'custom', ensure dates are not provided
//        if (this.startDate || this.endDate) {
//            return next(new Error('Start date and end date should not be provided for non-custom periods.'));
//        }
//    }
   next();
});
const budgets=mongoose.model("Budgets",userBudgets);

export default budgets;


