import express, { Application, NextFunction, Response,Express,Request } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env' });
import mongoose from "mongoose";
import cors from 'cors';
import expresscookie from "cookie-parser";
import passport from "./config/passport";
import jwt from "jsonwebtoken";
import userRouter, { validateOrigin } from './routes/userroutes';
import transcationRouter from './routes/routetranscations';
import accountsRouter from "./routes/routeaccounts";
import budgetsRouter from "./routes/routebudgets";
import categoriesRouter from './routes/routecategory';
import oauth2Client from "./middlewares/googleauthClient";
import user from "./models/User";
import budgets from "./models/Budgets";
import { CreateTransactionRequest } from "./controllers/transcation";
import { getTotalIncomeAndExpense } from "./controllers/user";
import { clearCategories, seedCategories } from "./seeders/categorySeeders";
import { clearBudgets, seedDefaultBudget } from "./seeders/budgetsSeeder";
import { clearAccounts, seedDefaultAccount } from "./seeders/accountSeeder";








const app=express();
const httpServer=createServer(app);
const io=new Server(httpServer,{cors:{
    origin:["http://localhost:3000","http://localhost:3001"]
}})
const port=5000;
app.use(expresscookie());
app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(passport.initialize())
app.use(cors({
    origin:["http://localhost:3000","http://localhost:3001"],
    credentials:true,
}));



app.use((req:CreateTransactionRequest,res,next)=>{
    req.io=io;
    next();
})

function onlyForHandShake(middleware:any){
   return (req:Request,res:Response,next:NextFunction)=>{
         const isHandShake=req.query.sid
   }  
}

//connect to mongoDb database finance;
async function seedDatabase() {
    try {
  // clear the database;
  //     await clearCategories(); // Clear existing categories
  //  await clearBudgets()
      // Run seeders
      await seedCategories();
      // await clearAccounts()
      await seedDefaultAccount();
      // await seedDefaultBudget();
      // Call other seeders here
  
      console.log("Database seeding completed.");
    } catch (error) {
      console.error("Error seeding database:", error)
    }
  }

  async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!, { dbName: "financeApp" });
        console.log("Connected to the database");

        await seedDatabase(); // Call the seed function after connecting

    } catch (err) {
        console.log("Not able to connect to db", err);
    }
}

main()

// mongoose.connect(process.env.MONGODB_URI!,{dbName:"financeApp"}).then(async()=>{
    
//        console.log("connected to the database");
//        await seedDatabase()
    
// }).catch((err)=>{
//     console.log("not able to connect to db",err)
// })



app.use('/api/auth',userRouter);
app.use('/api/transactions',transcationRouter);
app.use('/api/account',accountsRouter);
app.use('/api/budgets',budgetsRouter);
app.use('/api/category',categoriesRouter);
app.get('/oauth2callback', async (req:Request,res:Response)=>{

    const {code,state}=req.query as {code:string|any,state:string|any};
    if(code){
       try{
        
        const decodedToken = jwt.verify(state, process.env.SECRET_KEY!) as jwt.JwtPayload;
         if(decodedToken !== state){
            res.end("possible csrf attack aahhhn !!!!!!!!!!");
         }
    
        const userId = decodedToken.id;
    
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
    
        // Assuming req.user.id is the user's ID
        const users = await user.findById(userId);
    
        
        if(!users){
            return res.json({message:"aaahn You cant access my site sorry nigga"}).status(403);
        }
    
        // Update user's tokens
      users.tokens={
        google_access_token:tokens.access_token,
        google_refresh_token:tokens.refresh_token,
      }
       await users.save();
       res.redirect('/dashboard');
       }catch(err){
         console.log(err);
       }
    }})
    

app.get('/', (req, res:Response) => {
    res.send('Hello World!');
})

app.get('/dashboard',passport.authenticate("jwt",{session:false}),(req,res:Response)=>{
    console.log(req.user)
   return res.send("Welcome to the dashboard")
});



// io.on("connection",(socket)=>{
//   // getting the namespace  
//   socket.on("register",(userId:any)=>{
//       if(userId){
//           socket.join(userId); 
//              socket.on('trackBudget',async()=>{
//                 const budget=await budgets.find({userId});
//                 socket.emit('initialData',budget);
//                 const changeStream=budgets.watch();
//                 changeStream.on('change',async(change)=>{
//                     if (change.operationType === 'update' || change.operationType === 'insert') {
//                         const updatedBudget = await budgets.findById(change.documentKey._id);
//                         if (updatedBudget?.userId.toString() === userId) {
//                           socket.emit('budgetUpdate', updatedBudget);
//                         }
//                       }
//                 })

//              })
//       } 
//   })


// })




httpServer.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})
