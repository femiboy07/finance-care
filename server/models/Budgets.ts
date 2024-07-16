import mongoose
, { model, models }from "mongoose";


export interface IBudgets{
        accountId:mongoose.Schema.Types.ObjectId,
        userId: mongoose.Schema.Types.ObjectId,          // ID of the user who owns the budget
        category: string,        // Category the budget is for (e.g., "food", "entertainment")
        amount: any,          // Budgeted amount
        period: string,          // Budget period: "monthly" or "yearly"
        startDate:Date,      // Start date of the budget period
        endDate: Date,        // End date of the budget period
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
       category:String,
       amount:{
           type:mongoose.Types.Decimal128,
           required:true,
           
       },

       period:{
        type:"String",
        required:true,
        enum:["daily","weekly",'monthly','year'],
       },
       startDate:{
        type:Date,
        required:true
       },
       endDate:{
        type:Date,
        required:true
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


