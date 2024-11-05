import mongoose from "mongoose";
import { ITranscations } from "./Transcation";
import { IBudgets } from "./Budgets";

export interface IAccounts{
    userId:mongoose.Schema.Types.ObjectId;
    name:string;
    type:string;
    balance:mongoose.Types.Decimal128;
    transcations:any;
    budgets:any;
    isSystemAccount:boolean;
}



const accountsSchema=new mongoose.Schema<IAccounts>({
     userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      default:null,
      
     },
      name:{
        type:String,
         required:true
      },
      type:{
        type:String,
        required:true,
        unique:true,
        default:"current",
      },

      isSystemAccount:{
        type:Boolean,
        default:false,
        
      },
      balance:{
        type:mongoose.Types.Decimal128,
        default:0,
        required:true,
        max:15
      },
      transcations:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Transcations",
      }],
      budgets:[{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Budgets"
      }],
});




const accounts=mongoose.model('Accounts',accountsSchema);


export default accounts;



