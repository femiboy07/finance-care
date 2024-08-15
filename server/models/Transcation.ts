import mongoose from "mongoose";

export enum transcationCategory{
    Food='Food',
    Rent='Rent',
    Salary='Salary',
    Entertainment='Entertainment',
    BankFees="Bank Fees",
    CoffeeShops="CoffeShops",
    deposit="deposit",
    Income="Income",
    PaymentTransfer="PaymentTransfer",
    Withdrawal="Withdrawal",
    Travel="Travel",
    PersonalCare='Personal Care',
    Transportation='Transportation',
    Resturants='Resturants',
}

enum typeTranscation{
    expense='expense',
    income='income'
}

enum statusTranscation{
    pending='pending',
    cleared='cleared',
    
}

export interface ITranscations{
  userId:mongoose.Schema.Types.ObjectId,       // ID of the user who made the transaction
  accountId:any,  
  type: typeTranscation | string,              // Type of transaction: "income" or "expense"
  amount:mongoose.Types.Decimal128,                              // Amount of the transaction
  category:transcationCategory | string,     // Category of the transaction (e.g., "food", "rent")
  description: string,                      // Optional description for the transaction
  status:statusTranscation | string,
  name:string,
  date: Date,                               // Date of the transaction
  createdAt:Date,                          // Date when the transaction was logged
  updatedAt: Date,
 // Date when the transaction was last updated
}




const userTranscations=new mongoose.Schema<ITranscations>({
     userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
     },
     accountId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Accounts",
         
     },

     type:{
        type:String,
        required:true,
     },
     name:{
       type:String,
       required:true
     },
     amount:{
        type:mongoose.Types.Decimal128,
        required:true,
     },
     category:{
        type:String,
        enum:transcationCategory || "",
        required:true,
        default:"",
     },
     status:{
        type:String,
        enum:statusTranscation ,
        default:statusTranscation.pending,
     },
     description:{
        type:String,
      //   required:true,
        
     },
     date:{
        type:Date,
        default:Date.now
     },
     createdAt:Date,
     updatedAt:Date,
},);



userTranscations.pre('save',async function(next){
     
   try {
      console.log(this)
      // Use `await` to wait for the `populate` method to complete
      await this.populate({
         path: 'accountId',       // First, populate the `accountId` field
         select: 'name'           // Specify that we only want the `name` field from `accountId`
     }) 
      next();
  } catch (error:any) {
      // Pass any errors to the next middleware
      next(error);
  }

})


const transcation=mongoose.model('Transcation',userTranscations);


export default transcation;