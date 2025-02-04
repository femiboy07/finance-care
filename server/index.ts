import express, {  NextFunction, Response,Request } from "express";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env' });
import mongoose from "mongoose";
import cors from 'cors';
import expresscookie from "cookie-parser";
import passport from "./config/passport";
import jwt from "jsonwebtoken";
import userRouter from './routes/userroutes';
import transcationRouter from './routes/routetranscations';
import accountsRouter from "./routes/routeaccounts";
import budgetsRouter from "./routes/routebudgets";
import categoriesRouter from './routes/routecategory';
import oauth2Client from "./middlewares/googleauthClient";
import user from "./models/User";
import {  seedCategories } from "./seeders/categorySeeders";
import { seedDefaultAccount } from "./seeders/accountSeeder";








const app=express();

const port=process.env.PORT || 5000;



const allowedOrigins = [
  "https://finance-care-1.vercel.app", // Production URL
  "http://localhost:3000",            // Local development URL for frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from allowed origins or no origin (e.g., Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, Authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow required methods
  allowedHeaders: ['Content-Type', 'Authorization'],   //
}));

// app.options('*', (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); // Echo back the origin or use a default value
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.send();
// });

app.use(expresscookie());
app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(passport.initialize())




//connect to mongoDb database finance;
async function seedDatabase() {
    try {
  // clear the database;
  //     await clearCategories(); // Clear existing categories
  //  await clearBudgets()
      // Run seeders
      await seedCategories();
      // await seedDefaultAccount();
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




app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})
