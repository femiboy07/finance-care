// registering a user or sign in or signup a user;
import { Response,Request, NextFunction } from "express";
import user, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { CreateTransactionRequest } from "./transcation";
import transcation from "../models/Transcation";
import mongoose, { isValidObjectId } from "mongoose";


export async function register(req:Request,res:Response,next:NextFunction):Promise<unknown>{
     const {email,password,name,username}=req.body;
     
     if(!email && !password && !name && !username){
      return  res.json({message:"email and password needed to register"}).status(403);
     }

     const existingUser=await user.findOne({email});

     if(existingUser){
        return res.status(403).send("user already exists");
     }

     //create a new user in the database;
     
        const newUser=await user.create({
              username:username,
              name:name,
              email:email,
              passwordHash:password,
              

        }) 
         const payload={id:newUser.id,email}
         const access_token=jwt.sign(payload,process.env.SECRET_KEY!,{expiresIn:'4h'})
         const refresh_token=jwt.sign(payload, process.env.SECRET_KEY!,{expiresIn:'7d'});

         newUser.userRefreshTokens.push(refresh_token);

         newUser.save();
         
        return res.json({access_token,refresh_token,message:"registerd succesfully"});
         
}



export async function signInUser(req:Request,res:Response){
    const {email,password}=req.body;


    try{
        if(!email && !password){
            return res.status(403).json({message:"Please provide your email and password to login"});
        }

        const existingUser=await user.findOne({email});

        if(!existingUser) return res.status(400).json({ msg: 'Invalid credentials' });
        const isMatch = await existingUser.comparePassword(password)
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        const payload = { id: existingUser.id };
        const access_token=jwt.sign(payload,process.env.SECRET_KEY!,{expiresIn:'4h'})
        const refresh_token=jwt.sign(payload, process.env.SECRET_KEY!,{expiresIn:'7d'});
        existingUser.userRefreshTokens.push(refresh_token);
        await existingUser.save();
       return res.json({access_token,refresh_token}).status(200);
       
     }catch(err){
      return res.send(err).status(500);
    }
 
}

export async function getUserName(req:CreateTransactionRequest,res:Response){

  try{
      const userId=req.user?._id;
      const users=await user.findById(userId);
      const data=users?.username;
      return res.status(200).json({data,message:"username gotten succesfully"});
  }catch(err){
     console.log(err);
  }
}

interface IncomeByExpense{
    year:number;

}

export async function getTotalIncomeAndExpense(req: Request<{}, {}, {}, IncomeByExpense>, res: Response) {
    const { year } = req.query;

    // Ensure the year is a number and valid
    if (!year || isNaN(year) || year < 1000 || year > 9999) {
        return res.status(400).json({ message: "Invalid year provided. Please provide a valid year." });
    }

    try {
        const userId: any = req.user; // Assuming req.user contains the authenticated user's ID
        if (!userId) {
            return res.status(401).json({ message: "You need to be authenticated. Please log in again." });
        }

        console.log(`Fetching totals for user: ${userId._id}, year: ${year}`);

        // Construct the date range for the specified year
        const startOfYear = new Date(Date.UTC(year, 0, 1)); // UTC date for January 1st of the given year
        const endOfYear = new Date(Date.UTC(year + 1, 0, 1)); // UTC date for January 1st of the following year
        console.log(startOfYear, endOfYear);

        // Aggregate income by month
        const incomeAggregation = transcation.aggregate([
            { $match: { type: 'income', date: { $gte: startOfYear, $lt: endOfYear }, userId: userId._id } },
            { $project: { month: { $month: '$date' }, amount: 1 } },
            { $group: { _id: '$month', totalIncome: { $sum: '$amount' } } },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // Aggregate expense by month
        const expenseAggregation = transcation.aggregate([
            { $match: { type: 'expense', date: { $gte: startOfYear, $lt: endOfYear }, userId: userId._id } },
            { $project: { month: { $month: '$date' }, amount: 1 } },
            { $group: { _id: '$month', totalExpense: { $sum: '$amount' } } },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        // Wait for both aggregations to complete
        const [incomeResult, expenseResult] = await Promise.all([incomeAggregation, expenseAggregation]);

        console.log('Income aggregation result:', incomeResult);
        console.log('Expense aggregation result:', expenseResult);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const combinedResults = monthNames.map((month, index) => ({
            name: month,
            income: 0,
            expense: 0
        }));
        // Create an object to store combined results
        const convertToNumber = (value: any) => {
            if (value && typeof value.toString === 'function') {
                return parseFloat(value.toString());
            }
            return value;
        };

        // Update the combined results with actual data
        incomeResult.forEach(item => {
            const monthIndex = item._id - 1;
            combinedResults[monthIndex].income = convertToNumber(item.totalIncome);
        });

        expenseResult.forEach(item => {
            const monthIndex = item._id - 1;
            combinedResults[monthIndex].expense = convertToNumber(item.totalExpense);
        });
       // Send the results as a JSON response
        return res.json({ data: combinedResults, message: "Stats retrieved successfully" });
    } catch (err) {
        console.error('Error calculating income and expense:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}