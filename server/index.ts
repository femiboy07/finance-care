import express, { Application, NextFunction, Response,Express,Request } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env' });
import mongoose from "mongoose";
import cors from 'cors';
import passport from "./config/passport"
import userRouter, { validateOrigin } from './routes/userroutes';
import transcationRouter from './routes/routetranscations';
import accountsRouter from "./routes/routeaccounts";
import budgetsRouter from "./routes/routebudgets";
import jwt from "jsonwebtoken";
import oauth2Client from "./middlewares/googleauthClient";
import user from "./models/User";
import { CreateTransactionRequest } from "./controllers/transcation";
import { getTotalIncomeAndExpense } from "./controllers/user";
import budgets from "./models/Budgets";






const app=express();
const httpServer=createServer(app);
const io=new Server(httpServer,{cors:{
    origin:["http://localhost:3000","http://localhost:5000"]
}})
const port=5000;

app.use(cors({
    origin:[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5000"
    ],
    
}));

app.use(passport.initialize())
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use((req:CreateTransactionRequest,res,next)=>{
    req.io=io;
    next();
})

//connect to mongoDb database finance;

mongoose.connect(process.env.MONGODB_URI!,{dbName:"financeApp"}).then((data)=>{
    if(data){
       console.log("connected to the database");
    }
}).catch((err)=>{
    console.log("not able to connect to db",err)
})



app.use('/api/auth',userRouter);
app.use('/api/transactions',transcationRouter);
app.use('/api/account',accountsRouter);
app.use('api/budgets',budgetsRouter);
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
   return res.send("Welcome to the dashboard");
})

io.on("connection",(socket)=>{
  // getting the namespace  
  socket.on("register",(userId:any)=>{
      if(userId){
          socket.join(userId); 
             socket.on('trackBudget',async()=>{
                const budget=await budgets.find({userId});
                socket.emit('initialData',budget);
                const changeStream=budgets.watch();
                changeStream.on('change',async(change)=>{
                    if (change.operationType === 'update' || change.operationType === 'insert') {
                        const updatedBudget = await budgets.findById(change.documentKey._id);
                        if (updatedBudget?.userId.toString() === userId) {
                          socket.emit('budgetUpdate', updatedBudget);
                        }
                      }
                })

             })
      } 
  })


})




httpServer.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})
