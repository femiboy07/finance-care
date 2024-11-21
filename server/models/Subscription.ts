import mongoose, { Document } from "mongoose";

interface subscriptionModel extends Document {
    userId:mongoose.Schema.Types.ObjectId;
    subscriptionStatus:'active'|'free'|'inactive',
    subscriptionPlan:'monthly' | 'annual'  ,
    subscriptionEndDate:Date,

}



const subscriptionSchema= new mongoose.Schema<subscriptionModel>({
       userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
       },
       subscriptionStatus:{
          type:String,
          enum:['active','free','inactive']
       },
       subscriptionPlan:{
        type:String,
        enum:['monthly','annual'],
        default:null 
       },
       subscriptionEndDate:{
        type:Date,
      }
})



const subscription =mongoose.model('Subscription',subscriptionSchema);


export default subscription;