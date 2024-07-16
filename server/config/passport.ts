import passport, { Passport } from "passport";
import {Strategy,ExtractJwt, StrategyOptionsWithRequest} from "passport-jwt";
import user, { IUser } from "../models/User";
import { Request } from "express";


console.log(process.env.SECRET_KEY,"secretkey");



const options:StrategyOptionsWithRequest={
   
    passReqToCallback:true,
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.SECRET_KEY!,
    // issuer:"finance@qc.com",


} as StrategyOptionsWithRequest;



passport.use(new Strategy(options, async function(req:Request,payload,done){
  console.log(payload.id,"payload")
  try{
     

     const currentUser:any= await user.findOne({_id:payload.id});

    if(!currentUser){

      return done(null,false)
    }

    req.user=currentUser;
    console.log(req.user);
    // req.user.id=payload.id;
    


    return done(null,currentUser)

   
      }catch(err){
        console.log("Error in authentication:", err);
       return done(err, false);
      }   
}))


export default passport;








