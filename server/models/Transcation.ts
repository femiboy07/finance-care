import mongoose,{Document, Schema} from "mongoose";
import CategoryModel from "./Category";


export enum transcationCategory {
    Food='Food',
    Rent='Rent',
    Salary='Salary',
    Entertainment='Entertainment',
    BankFees="Bank Fees",
    CoffeeShops="CoffeeShops",
    deposit="deposit",
    Income="Income",
    PaymentTransfer="PaymentTransfer",
    Withdrawal="Withdrawal",
    Travel="Travel",
    PersonalCare='Personal Care',
    Transportation='Transportation',
    Resturants='Resturants',
}

export const value=['Food',"Rent",'Salary','Entertainment','BankFees','CoffeeShops','deposit','Income','PaymentTransfer','Withdrawal','Travel','Personal Care','Transportation','Resturants'] ;

enum typeTranscation{
    expense='expense',
    income='income'
}

enum statusTranscation{
    pending='pending',
    cleared='cleared',
    
}

 export interface ITranscations extends Document{
  userId:mongoose.Schema.Types.ObjectId,       // ID of the user who made the transaction
  accountId:mongoose.Types.ObjectId | null,  
  type: typeTranscation | string,              // Type of transaction: "income" or "expense"
  amount:mongoose.Types.Decimal128,                              // Amount of the transaction
  category:mongoose.Types.ObjectId | null,     // Category of the transaction (e.g., "food", "rent")
  description?: string,                      // Optional description for the transaction
  status:statusTranscation | string,
  name:string,
  month:number,
  year:number,
  date: Date,                               // Date of the transaction

 // Date when the transaction was last updated
}




const userTranscations=new Schema<ITranscations>({
     userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
     },
     accountId:{
         type:mongoose.Types.ObjectId,
         ref:"Accounts",
         
     },
     month:{
      type:Number,
     },
     year:{
      type:Number,
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
        max:15
     },
     category:{
        type:mongoose.Types.ObjectId,
        ref:'Category',
        required:true,
        
     },
     status:{
        type:String,
        enum:statusTranscation ,
        default:statusTranscation.pending,
     },
     description:{
        type:String,
        
        required:false
      //   required:true,
        
     },
     date:{
        type:Date,
        default:Date.now
     },
    
}, { timestamps: true });



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