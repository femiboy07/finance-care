import { Request ,Response} from "express";
import transcation, { ITranscations } from "../models/Transcation";
import {google,gmail_v1} from  "googleapis";
import oauth2Client from "../middlewares/googleauthClient";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import mongoose, { Query,Types } from "mongoose";
import user from "../models/User";
import { sendNotificationMessage } from "./notifications";
import accounts from "../models/Account";
import { Server } from "socket.io";
import decimal, { Decimal } from "decimal.js";




/**
 * 
 * @param req 
 * create a transcation using out create transcation api;
 * @param res 
 * @returns  
 */


export interface CreateTransactionRequest extends Request {
  io?:Server;
  userId?: string;
     user?:{
      _id?:mongoose.Schema.Types.ObjectId,
     } // Assuming userId is added to the request object by authentication middleware
}


export async function createTranscation(req:CreateTransactionRequest,res:Response):Promise <ITranscations | any>{
        const {type,amount,description,category,accountId,date}=req.body;

     

        try{
          // if(  !amount || !description || !category){
          //   return res.status(400).json({message:"those values are needed"})
          //  }

          if (!type) {
            return res.status(400).json({ message: "Transaction type is required" });
          }
        if (!amount) {
            return res.status(400).json({ message: "Transaction amount is required" });
        }
        if (!description) {
            return res.status(400).json({ message: "Transaction description is required" });
        }
        if (!category) {
            return res.status(400).json({ message: "Transaction category is required" });
        }
        if (!date) {
          return res.status(400).json({ message: "Transaction date is required" });
      }
       
        if (!accountId) {
            return res.status(400).json({ message: "Account ID is required" });
        }
          const account = await accounts.findOne({ _id: accountId, userId: req.user?._id });
        if (!account) {
            return res.status(404).json({ message: "Account not found or access denied" });
        }

        // Ensure type is either 'credit' or 'debit'
        if (!['income', 'expense'].includes(type.toLowerCase())) {
            return res.status(400).json({ message: "Transaction type must be 'income' or 'expense'" });
        }
         console.log(account.balance ,"accountBalnce");
         const convertToNumber = (value: any) => {
          if (value && typeof value.toString === 'function') {
              return parseFloat(value.toString());
          }
          return value;
      };
        if (type.toLowerCase() === 'expense' && amount > convertToNumber(account.balance)) {
          return res.status(400).json({ message: "Insufficient funds for this transaction" });
       } 
           const newtransaction=await transcation.create({
                userId:req.user?._id!,
                accountId,
                type,
                name:account.name,
                amount,
                description,
                category,
                date:date
             });
             
            
             console.log(req.user?._id);
          
        
             const currentBalance = new Decimal(account.balance.toString());
             await deductBalance(accountId,amount,currentBalance,type);
             newtransaction.status="cleared";
            //  newtransaction.amount=mongoose.Types.Decimal128.fromString(.toFixed(2));
           
           

            await newtransaction.save();
           
            sendNotificationMessage(req.io,req.user?._id!,newtransaction,"transaction_alert");

            return res.json({data:newtransaction,message:"new transcation created succesfully "}).status(200);
    
        }catch(err){
          return res.json({message:"system down am sorry ",err}).status(500);
        }
}



export async function updateTransaction(req: Request, res: Response) {
  const { id } = req.params;
  const { category, type, amount, description, date, accountId } = req.body;
 console.log(req.body)
  try {
      // Find the transaction by ID
      let transaction = await transcation.findById(id);
      if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
      }

      // Update transaction fields
      if (category) {
        transaction.category = category;
        await transaction.save()
      }
      if (type){
         transaction.type = type;
         await transaction.save()
      }
      if (date) {
        // const parsedDate = new Date(date);
        // if (isNaN(parsedDate.getTime())) {
        //   return res.status(400).json({ message: "Invalid date format" });
        // }
        transaction.date = date;
      }
      if (amount) transaction.amount = amount;
      if (description){
         transaction.description = description;

         await transaction.save()
      }

      // If accountId is provided, find the account by ID
      if (accountId) {
          const account = await accounts.findOne({_id:accountId});
          if (!account) {
              return res.status(404).json({ message: "Account not found" });
          }
          transaction.accountId = account._id;
          transaction.name = account.name;

          await transaction.save();
          // return res.status(200).json({ data: transaction, message: "Successfully updated" });
          
      } 
      // If name is provided and accountId is not, find the account by name
     

      // Save the updated transaction
      await transaction.save();

      return res.status(200).json({ data: transaction, message: "Successfully updated" });
  } catch (err) {
      return res.status(500).json({ message: "There is an error", error: err });
  }
}

export async function deleteTranscation(req:Request,res:Response){
    const {id}=req.params;

    try{
       const cancelItem=await transcation.findOneAndDelete({_id:id});

       return res.json({cancelItem}).status(200);
    }catch(err){
       return res.json({message:"something happend pls check your connection"}).status(500);
    }

};

interface QueryParams {
  category?: string;
  type?: string;
  name?:string;
  amount?: string;
  startDate?: string;
  endDate?: string;
  page?:number;
  year:number;
  month:number;
  pageLimit?:number

}


export async function getLatestTranscations(req:CreateTransactionRequest,res:Response){
    try{
      const transactions = await transcation.aggregate([
        { $match: { userId: req.user?._id! } }, // Filter by user ID if needed
        { $sort: { date:  -1} }, // Sort by date in descending order1
        { $limit: 3 } // Limit to the specified number of latest transactions
    ]);
    
       
       if(!transactions){
        return res.status(403).send("your not found in the user record")
       }
       return res.json({transactions,message:"succesfully gotten latest transcations"}).status(200)
    }catch(err){
      return res.status(500).send("Error cant reach the server");
    }
}

interface ParamsFill{
  month:number;
  year:number;
}

export async function getTranscations(req:Request<{},{},{},QueryParams>,res:Response){
  
  const {category,type,amount,startDate,endDate,pageLimit,page,name} =req.query as QueryParams;
  const {year,month}=req.params as any;
  try{
    const userId:any=req.user;
    if(!userId){
      return res.json({message:"cant proceed you need to be authenticated pls login again"}).status(400)
    }
    console.log(userId,'ssssssssssss');
    // const userObjectId = new Types.ObjectId(userId._id);
  
    let query:any = {userId:userId._id};
  
   // Dynamically add properties to the query object based on the presence of query parameters
    if (category) {
      query.category = category;
    }
    if(name){
        query.name=name;
    }
    if (type) {
      query.type = type;
    }
    if (amount) {
      const amountNumber = parseFloat(amount);
      if (!isNaN(amountNumber)) {
        query.amount = amountNumber;
      } // Consider using a number conversion here if amount should be numeric
    }
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
   
    const start = new Date(Date.UTC(year, month - 1, 1)); // Start of the specified month in UTC
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); 
    console.log(start)
    console.log(start.toISOString(),end.toISOString())
    query.date = { $gte: start, $lte: end };
    const pageNumber = parseInt(page as unknown as string) || 1; // Default to page 1
    const limitNumber = parseInt(pageLimit as unknown as string) || 5;
    const skip = (pageNumber - 1) * limitNumber;
   
    
    const listTransactions=await transcation?.find(query).skip(skip).limit(limitNumber);

    const totalItems = await transcation.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNumber);

    return res.status(200).json({
      listTransactions,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageLimit: limitNumber
      },
      message: "List of transactions successfully retrieved"
    });

    
  }catch(err){
   return res.send('an error happened in getting the list of transcation').status(500);
  }
}


export async function metrics(req:CreateTransactionRequest,res:Response){
         try{
          const userId:any=req.user;
          const balanceAggregation = accounts.aggregate([
            {$match:{userId:userId._id}},
            {$group:{_id:null,totalBalance:{$sum:"$balance"}}}

          ]);

          const currentDate=new Date();
          const currentMonth=currentDate.getUTCMonth();
          const currentYear=currentDate.getUTCFullYear();
          console.log(currentYear,currentMonth);
          const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1)); // Start of the month (e.g., June 1, 2024)
          const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1)); // Start of the next month (e.g., July 1, 2024)

          const incomeAggregation = transcation.aggregate([
            { $match: { type: 'income', date: { $gte: startOfMonth, $lt: startOfNextMonth }, userId: userId._id } },
            { $group: { _id: null, totalIncome: { $sum: '$amount' } } },
        ]);

        // Aggregate expenses for the current month
        const expenseAggregation = transcation.aggregate([
            { $match: { type: 'expense', date: { $gte: startOfMonth, $lt: startOfNextMonth }, userId: userId._id } },
            { $group: { _id: null, totalExpense: { $sum: '$amount' } } },
        ]);

        const convertToNumber = (value: any) => {
          if (value && typeof value.toString === 'function') {
              return parseFloat(value.toString());
          }
          return value;
      };

        const [balance,income,expense]=await Promise.all([balanceAggregation,incomeAggregation,expenseAggregation]);
         const totalBalance=balance.length > 0 ? convertToNumber(balance[0].totalBalance) :0;
         const totalIncome = income.length > 0 ? convertToNumber(income[0].totalIncome) : 0;
         const totalExpense = expense.length > 0 ? convertToNumber(expense[0].totalExpense) : 0;

         return res.json({ 
          totalBalance:totalBalance,
          totalIncome: totalIncome, 
          totalExpense: totalExpense, 
          message: "Monthly totals retrieved successfully" 
      });
         }catch(err){
          console.error('Error calculating monthly totals:', err);
          res.status(500).json({ message: "Internal server error" });
         }
}



//utils for transcations


async function deductBalance(accountId:string,amount:Decimal,balance:Decimal,type:string){

   if(type.toLowerCase() === 'expense'){
  
    const currentBalance=balance.minus(amount);
    const account = await accounts.findByIdAndUpdate(accountId,{
      $set:{balance:balance.minus(amount)},new:true
    });
    if(account){
      account.balance=mongoose.Types.Decimal128.fromString(currentBalance.toFixed(2))
      await account?.save();
    }
   
   }

   if(type.toLowerCase() === 'income'){
    const currentBalance=balance.plus(amount);
    const account = await accounts.findByIdAndUpdate(accountId,{
      $set:{balance:currentBalance},new:true
    });
    if(account){
    account.balance=mongoose.Types.Decimal128.fromString(currentBalance.toFixed(2))
    await account?.save();
    }
   }
}



export async function totalIncome(req:Request,res:Response){

}
















