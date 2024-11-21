import mongoose, { CallbackWithoutResultAndOptionalError, Model, ValidatorFunction, ValidatorProps } from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";
import { IAccounts } from "./Account";

//mongodb already gives a unique identifier
export interface userTokens{
   google_access_token:string | null | undefined,
   google_refresh_token:string | null | undefined,
}

 enum currencyUser{
    USD="United States Dollar",
    NGN="Nigerian Naira",

}

export interface IUser{
  username: string,        // User's username
  email: string ,           // User's email address
  passwordHash: string,    // Hashed password for authentication
  name: string, 
  accounts:mongoose.Schema.Types.ObjectId | any
  userRefreshTokens:string[],
  tokens?:userTokens,           // Full name of the user
  profilePictureUrl?: string, // URL to the user's profile picture
  currency?: currencyUser,        // Preferred currency for transactions (e.g., "USD")
  createdAt: Date       // Date when the user profile was last updated
}


interface IUserMethods{
    comparePassword:(userPassword:string)=>Promise<string>,
}


type UserModel = Model<IUser, {}, IUserMethods, userTokens>;

const userModel=new mongoose.Schema<IUser,UserModel,IUserMethods>({
     username:{
        type:String,
        required:true,
     },
     email:{
        type:String,
        validate:{
          validator:function(email:string){
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
           const isValidEmail = emailRegex.test(email);
        
            return isValidEmail;
          },
          message:function(props:ValidatorProps){
             return `${props.path} email address is wrong `;
          },
          
        },
        required:true,

    },
    accounts:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Accounts",
       default:[]
    }],
     passwordHash:{
        type:String,
      required:true

     },
   
     userRefreshTokens:{
      type:[String],
      default:[],
     },
     tokens:{
      google_access_token:{
         type:String,
         default:null,
      },
      google_refresh_token:{
         type:String,
         default:null,
      }
     },
  
     name:String,
     profilePictureUrl:{
        type:String,
        default:null
     },
     currency:{
        type:String,
        enum:currencyUser,
        default:currencyUser.USD,
      },
     createdAt:Date,
});



userModel.pre('save', async function(next){
   

    

    if(!this.isModified('passwordHash')){
        return next();   
    }

    try{
        const salt=await bcrypt.genSalt(15);
        const hashedPassword = await bcrypt.hash(this.passwordHash, salt);
        // Replace the plain text password with the hashed one
        this.passwordHash = hashedPassword;
        return next();
    }catch(error:any){
        return next(error)
    }
})


userModel.method('comparePassword',async function comparePassword(userPassword: string){
   return await bcrypt.compare(userPassword,this.passwordHash);

})



const user = mongoose.model<IUser,UserModel>('User', userModel);

export default user;









