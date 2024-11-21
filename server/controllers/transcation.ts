import { Request ,Response} from "express";
import transcation, { ITranscations, transcationCategory } from "../models/Transcation";
import mongoose, { Decimal128 } from "mongoose";
import accounts from "../models/Account";
import { Server } from "socket.io";
import { Decimal } from "decimal.js";
import budgets from "../models/Budgets";
import CategoryModel from "../models/Category";
import { toDecimal128 } from "../utils/modify";
import {toZonedTime} from 'date-fns-tz'
import {json2csv} from "json-2-csv";




/**
 * 
 * @param req 
 * create a transcation using out create transcation api;
 * @param res 
 * @returns  
 */


export const convertToNumber = (value: any) => {
  if (value && typeof value.toString === 'function') {
      return parseFloat(value.toString());
  }
  return value;
};

export interface CreateTransactionRequest extends Request {
  io?:Server;
  userId?: string;
     user?:{
      _id?:mongoose.Schema.Types.ObjectId,
     } // Assuming userId is added to the request object by authentication middleware
}

interface TransactionDTO{
     type:string;
     amount:Decimal | Decimal128 | number | any;
     description?:string;
     category:transcationCategory;
     accountId:string;
     date:Date;
     month:any;
     year:any;
}



export async function createTranscation(req: CreateTransactionRequest, res: Response): Promise<ITranscations | any> {
  const { type, amount, description, category, accountId, date,month,year } = req.body as TransactionDTO;
  console.log(date,"ass")

  // Validate request fields
  if (!type || !amount || !category || !date || !accountId || !month || !year) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const definedYear=year;
    const definedMonth=month;
    console.log(definedYear,definedMonth,'year,month');
      const account =  await accounts.findOne({ _id: accountId}) ;;
      if (!account) {
          return res.status(404).json({ message: "Account not found or access denied" });
      }

      if (!['income', 'expense'].includes(type.toLowerCase())) {
          return res.status(403).json({ message: "Transaction type must be 'income' or 'expense'" });
      }
      const categoryDoc: mongoose.Types.ObjectId | null = await CategoryModel.findOne({ name: category, userId: null });
      if (!categoryDoc || !categoryDoc._id) {
          return res.status(400).json({ message: 'Category not found or invalid' });
      }

      const categoryId = categoryDoc._id;
      const currentBalance = new Decimal(account.balance.toString());
      if (type.toLowerCase() === 'expense' && currentBalance.lessThan(amount)) {
        return res.status(400).json({ message: "Insufficient funds in the account" });
    }
      const newTransaction = new transcation({
          userId: req.user?._id!,
          accountId,
          type,
          name: account.name,
          amount,
          description,
          category:categoryId,
          date:date,
          month:parseInt(definedMonth,10) + 1,
          year:parseInt(definedYear,10),
      });

    
      await deductBalance(accountId, amount, currentBalance.toString(), type);
      newTransaction.status = "cleared";
      await newTransaction.save();

     

      // Find existing budget to calculate the remaining amount
      const existingBudget = await budgets.findOne({ userId: req.user?._id, category: categoryId,month:newTransaction.month,year:newTransaction.year });
      
      if (existingBudget) {
          // Calculate updated spent and remaining amounts
          const updatedSpent = convertToNumber(existingBudget.spent) + convertToNumber(amount);
          const updatedRemaining = convertToNumber(existingBudget.budget) - updatedSpent;

          // Update the budget entry
          await budgets.findOneAndUpdate(
              { _id: existingBudget._id },
              {
                  $set: {
                      spent: updatedSpent,
                      remaining:existingBudget.budget.toString() !== '0.0' ? updatedRemaining : new mongoose.Types.Decimal128("0.0"),
                  },
              },
               {new:true,upsert:false}
          );
      } else {
        const newBudget=new budgets({
             userId:req.user?._id,
             spent:amount,
             remaining:new mongoose.Types.Decimal128("0.0"),
             budget:new mongoose.Types.Decimal128("0.0"),
             category:categoryId,
             month:newTransaction.month,
             year:newTransaction.year,

          })
          await newBudget.save()
          // No budget entry exists, so only create the transaction
          // sendNotificationMessage(req.io, req.user?._id!, newTransaction, "transaction_alert");
          // return res.status(200).json({ data: newTransaction, message: "New transaction created successfully" });
      }

      // sendNotificationMessage(req.io, req.user?._id!, newTransaction, "transaction_alert");

      return res.status(200).json({ data: newTransaction, message: "Transaction created and budget updated successfully" });
  } catch (err: any) {
      console.log(err, 'error');
      if (err.name === 'ValidationError') {
          const errors = Object.keys(err.errors).map((key) => ({
              field: key,
              message: err.errors[key].message,
          }));
          return res.status(400).json({ errors });
      }
      return res.status(400).json({ message: "Network error, try again", err });
  }
}

export async function updateTransaction(req: CreateTransactionRequest, res: Response) {
  const { id } = req.params;
  const { category, type, amount, description, date, accountId } = req.body as Partial<TransactionDTO>;
  console.log(accountId,"accountId")

  try {
    // Fetch transaction and account details
    const transaction = await transcation.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const account = await accounts.findById(transaction.accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    let accBalance = convertToNumber(account.balance);

    if(accountId){
      
      await transcation.findByIdAndUpdate(
        transaction._id,
        { accountId: accountId }, // Set new accountId here
        { new: true } // Returns the updated document
      );
      
    }

    // Reverse the previous transaction's effect on balance
    accBalance = updateAccountBalanceOnReverse(transaction, accBalance);

    // Handle category change if applicable
    if (category) {
      const categoryId:mongoose.Types.ObjectId | null = await CategoryModel.findOne({ name: category, userId: null });
      
      if (categoryId &&  categoryId._id.toString() !== transaction.category?.toString()) {
        console.log(categoryId._id.toString(),transaction.category?.toString(),'boths')
        await handleCategoryChange(transaction, categoryId, amount);
        await transcation.findByIdAndUpdate({
          _id:transaction._id
        },{$set:{
          category:categoryId._id
        }},{upsert:true,new:false})
      }
    }

    // Handle description update
    if (description !== undefined) transaction.description = description;

    // Handle type update
    if (type) transaction.type = type;

    // Handle date update
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      transaction.date = parsedDate;
      transaction.month = parsedDate.getMonth() + 1;
      transaction.year = parsedDate.getFullYear();
    }

    // Handle amount change if applicable
    if (amount) {
      const numAmount = convertToNumber(amount);
      if (numAmount >= 1000000000) {
        return res.status(400).json({ message: "Amount is too large" });
      }

      await handleAmountChange(transaction, numAmount);

      accBalance = updateAccountBalance(transaction, accBalance, numAmount);
      transaction.amount = numAmount;
    }

    // Update account balance and transaction
    account.balance = accBalance;
    await account.save();
    await transaction.save();

    return res.status(200).json({ data: transaction, message: "Successfully updated" });
  } catch (err: any) {
    console.error("Error during transaction update: ", err);
    return res.status(500).json({ message: "An error occurred during the update process", error: err.message });
  }
}

/**
 * Reverse the transaction effect on the account balance.
 */
function updateAccountBalanceOnReverse(transaction: ITranscations, accBalance: number): number {
  if (transaction.type.toLowerCase() === 'income') {
    return accBalance - convertToNumber(transaction.amount); // Subtract old income
  } else if (transaction.type.toLowerCase() === 'expense') {
    return accBalance + convertToNumber(transaction.amount); // Add back old expense
  }
  return accBalance;
}

/**
 * Update the account balance after applying the new transaction.
 */
function updateAccountBalance(transaction:ITranscations, accBalance: number, newAmount: number): number {
  if (transaction.type.toLowerCase() === 'income') {
    return accBalance + newAmount;
  } else if (transaction.type.toLowerCase() === 'expense') {
    if (convertToNumber(accBalance) < newAmount) {
      throw new Error("Insufficient funds for this transaction");
    }
    return accBalance - newAmount;
  }
  return accBalance;
}

/**
 * Handle category change, update the old and new budget.
 */
async function handleCategoryChange(transaction: ITranscations, newCategoryId: any, newAmount?: number) {
  // Update old budget (subtract the amount)
  console.log(transaction.category,newCategoryId,newAmount,"transaction")
  if (transaction.category) {
    const oldBudget = await budgets.findOne({
      category: transaction.category,
      month: transaction.month,
      year: transaction.year
    });

    if (oldBudget && oldBudget?.budget ) {
     
     await budgets.findOneAndUpdate(
        {
          category: transaction.category,
          month: transaction.month,
          year: transaction.year
           
        },
        {
            $set: {
                
                spent:  toDecimal128(parseFloat(oldBudget.spent.toString()) - parseFloat(transaction.amount.toString())),
                remaining:oldBudget.budget !== new mongoose.Types.Decimal128("0.0") ? toDecimal128(parseFloat(oldBudget.budget.toString()) - (parseFloat(oldBudget.spent.toString()) + parseFloat(transaction.amount.toString())) ) : "0.0"
            }
        },
        { new: true, upsert: false }
    );
    }
  }

  // Update new budget (add the amount)
  const newBudget = await budgets.findOne({
    category: newCategoryId._id,
    month: transaction.month,
    year: transaction.year
  });

  if (newBudget && newBudget.budget) {
    // newBudget.spent += convertToNumber(newAmount);
    // let remaining=convertToNumber(newBudget.remaining);
    // remaining = convertToNumber(newBudget.budget) - convertToNumber(newBudget.spent);
    // await newBudget.save();
    console.log(newBudget.budget.toString(),"let me see")
    await budgets.findOneAndUpdate(
      {
        category: newCategoryId._id,
        month: transaction.month,
        year: transaction.year
         
      },
      {
          $set: {
              
              spent:  toDecimal128(parseFloat(newBudget.spent.toString()) + parseFloat(transaction.amount.toString())),
              remaining:newBudget.budget !== new mongoose.Types.Decimal128("0.0") ? toDecimal128(parseFloat(newBudget.budget.toString()) - (parseFloat(newBudget.spent.toString()) + parseFloat(transaction.amount.toString())) ) : "0.0"
             
          }
      },
      { new: true, upsert: false }
  );
  }
}

/**
 * Handle amount change, update the related budget.
 */
async function handleAmountChange(transaction: ITranscations, newAmount: number) {
  const budget = await budgets.findOne({
    category: transaction.category,
    month: transaction.month,
    year: transaction.year
  });

  if (budget) {
    const amountDifference = newAmount - convertToNumber(transaction.amount);
    // budget.spent += convertToNumber(amountDifference);
    // let remaining=convertToNumber(budget.remaining)
    // remaining = convertToNumber(budget.budget) - convertToNumber(budget.spent);
    // await budget.save();
    await budgets.findOneAndUpdate(
      {
        category: transaction.category,
        month: transaction.month,
        year: transaction.year
         
      },
      {
          $set: {
              
              spent:  toDecimal128(parseFloat(budget.spent.toString()) + parseFloat(amountDifference.toString())),
              remaining:toDecimal128(parseFloat(budget.budget.toString()) - parseFloat(newAmount.toString()))
          }
      },
      { new: true, upsert: false }
  );
  }
}

export async function deleteTranscation(req: Request, res: Response) {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
  }

  try {
      // Fetch transactions to be deleted
      const transactionsToDelete = await transcation.find({ _id: { $in: ids } });

      // Update budgets based on transactions before deleting
      for (const transaction of transactionsToDelete) {
          if (!transaction.amount || !transaction.category) {
              console.warn(`Transaction with ID ${transaction._id} has missing amount or category. Skipping...`);
              continue;
          }

          const transactionAmount = convertToNumber(transaction.amount);
          const findBudget = await budgets.findOne({ category: transaction.category,year:transaction.year,month:transaction.month });

          if (findBudget) {
              const budgetAmount = convertToNumber(findBudget.budget);
              const updatedBudgetAmount = budgetAmount - transactionAmount;

              await budgets.findByIdAndUpdate(
                  findBudget._id,
                  {
                      $set: {
                           // Update the budget field
                          spent:convertToNumber(findBudget.spent) - transactionAmount < 0 ? new mongoose.Types.Decimal128("0.0"): convertToNumber(findBudget.spent) - transactionAmount, // Adjust spent field
                          remaining:convertToNumber(findBudget.remaining)  < 0 ? new mongoose.Types.Decimal128("0.0") : updatedBudgetAmount - convertToNumber(findBudget.spent)
                      }
                  },
                  { new: true }
              );
          }
      }

      // Now delete transactions
      const cancelItem = await transcation.deleteMany({ _id: { $in: ids } });
      if (cancelItem.deletedCount === 0) {
          return res.status(404).json({ message: 'No transactions found with the provided IDs' });
      }

      return res.status(200).json({ message: 'Transactions deleted and budgets updated successfully' });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Something happened, please check your connection' });
  }
}
interface QueryParams {
  category?: string;
  type?: string;
  name?:string;
  amount?: string;
  description?:string;
  search?:string;
  startDate?: string;
  endDate?: string;
  page?:number;
  year:number;
  month:number;
  pageLimit?:number;

}
export async function getLatestTransactions(req: CreateTransactionRequest, res: Response) {
  try {
    const transactions = await transcation.aggregate([
      { $match: { userId: req.user?._id } }, // Filter by user ID if needed
      { $sort: { date: -1 } },               // Sort by date in descending order
      { $limit: 3 },                         // Limit to the latest 3 transactions
      {
        $lookup: {
          from: "categories",                // Collection to join with (replace with your collection name)
          localField: "category",          // Field in the transaction collection
          foreignField: "_id",               // Field in the categories collection
          as: "category"              // Output array field
        }
      },
      // { $unwind: "$categoryDetails" }        // Optional: if you expect a single category, not an array
    ]);

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found." });
    }

    return res.status(200).json({ transactions, message: "Successfully retrieved latest transactions." });
  } catch (err) {
    return res.status(500).json({ message: "Error reaching the server", err });
  }
}
interface ParamsFill{
  month:number;
  year:number;
}

export async function getTranscations(req:Request<{},{},{},QueryParams>,res:Response){
  
  const {category,type,amount,startDate,endDate,pageLimit,page,name,description,search} =req.query as QueryParams;
  const {year,month}=req.params as any;
  const timeZone='Africa/Lagos'
  try{
    const userId:any=req.user;
    if(!userId){
      return res.json({message:"cant proceed you need to be authenticated pls login again"}).status(400)
    }
    console.log(userId,'ssssssssssss');
    let query:any = {userId:userId._id};
  
   // Dynamically add properties to the query object based on the presence of query parameters
   
    if(search){
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { 'category.name': searchRegex }
      ];
    }

    if (category && !search) {
      const categoryDoc = await CategoryModel.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    if(name){
        query.name= name;
    }
    if(description && !search){
      query.description=new RegExp(description,'i')
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
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt= { $lte: new Date(endDate) };
    }
   
    // const start = new Date(Date.UTC(year, month - 1, 1)); // Start of the specified month in UTC
    // const end = new Date(Date.UTC(year, month, 1),-1); 
    const startOfMonthLocal = new Date(year, month - 1, 1); 
const startOfMonthUtc = toZonedTime(startOfMonthLocal, timeZone);

// End of the month in the local "Africa/Lagos" timezone
const endOfMonthLocal = new Date(year, month, 0, 23, 59, 59, 999); 
const endOfMonthUtc = toZonedTime(endOfMonthLocal, timeZone)
    // console.log(start)
    // console.log(start.toISOString(),end.toISOString())
    query.date = { $gte: startOfMonthUtc, $lte: endOfMonthUtc };
    const pageNumber = parseInt(page as unknown as string) || 5; // Default to page 1
    const limitNumber = parseInt(pageLimit as unknown as string) || 25;
    const skip = (pageNumber - 1) * limitNumber;
   
    
    const listTransactions=await transcation?.find(query).populate({path:'category',select:'name type'}).populate({path:'accountId',select:'name _id type '}).skip(skip).limit(limitNumber).sort({date:-1})

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

          const cashAccount=await accounts.findOne({name:"Cash Transaction",type:'def_coin',isSystemAccount:true,userId:null})

          if(!cashAccount){
            return res.status(403).json({message:"Cash Transaction needs to be present"})
          }
          
          const balanceAggregation = accounts.aggregate([
            {$match:{userId:userId._id, _id: { $ne: cashAccount._id } },},
            {$group:{_id:null,totalBalance:{$sum:"$balance"}}}

          ]);

          const currentDate=new Date();
          const currentMonth=currentDate.getUTCMonth();
          const currentYear=currentDate.getUTCFullYear();
          console.log(currentYear,currentMonth);
          const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1)); // Start of the month (e.g., June 1, 2024)
          const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1)); // Start of the next month (e.g., July 1, 2024)

         
          const incomeAggregation = transcation.aggregate([
            { 
              $match: { 
                type: 'income', 
                date: { $gte: startOfMonth, $lt: startOfNextMonth }, 
                userId: userId._id,
                // accountId: { $ne: cashAccount._id } // Exclude Cash Transaction
              } 
            },
            { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
          ]);
      
          // Aggregate expenses, excluding transactions with account "Cash Transaction" and type "def_coin"
          const expenseAggregation = transcation.aggregate([
            { 
              $match: { 
                type: 'expense', 
                date: { $gte: startOfMonth, $lt: startOfNextMonth }, 
                userId: userId._id,
                // accountId: { $ne: cashAccount._id } // Exclude Cash Transaction
              } 
            },
            { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
          ]);
         

        const budgetAggregation=budgets.aggregate([
          { $match: {  createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }, userId: userId._id } },
          { $group: { _id: null, totalBudget: { $sum: '$budget' } } },
        ])

        const convertToNumber = (value: any) => {
          if (value && typeof value.toString === 'function') {
              return parseFloat(value.toString());
          }
          return value;
      };

        const [balance,income,expense,budget]=await Promise.all([balanceAggregation,incomeAggregation,expenseAggregation,budgetAggregation]);
         const totalBalance=balance.length > 0 ? convertToNumber(balance[0].totalBalance) :0;
         const totalIncome = income.length > 0 ? convertToNumber(income[0].totalIncome) : 0;
         const totalExpense = expense.length > 0 ? convertToNumber(expense[0].totalExpense) : 0;
         const totalBudget = budget.length > 0 ? convertToNumber(budget[0].totalBudget) : 0;

         return res.json({ 
          totalBalance:totalBalance,
          totalIncome: totalIncome, 
          totalExpense: totalExpense, 
          totalBudget:totalBudget,
          message: "Monthly totals retrieved successfully" 
      });
         }catch(err){
          console.error('Error calculating monthly totals:', err);
          res.status(500).json({ message: "Internal server error" });
         }
}



//utils for transcations

async function deductBalance(accountId: string, currentBalance:any, amount: any, type: string) {
  // Fetch the account by ID
  const account = await accounts.findById(accountId);

  // Check if the account exists
  if (!account) {
    throw new Error('Account not found.');
  }

  // Check if it is a Cash Transaction account of type def_coin
  const isCashTransaction = account.name === 'Cash Transaction' && account.type === 'def_coin' && account.isSystemAccount === true;

  if (type.toLowerCase() === 'expense') {
    if (isCashTransaction) {
      // Handle expense for cash transaction without deducting from a balance
      // Deduct from balance for non-cash transactions
      const balance=1000000000000;
      console.log('Processing cash expense. No balance deduction needed.');
      await accounts.findByIdAndUpdate(accountId, {
        $set: { balance:balance}, new: true
      });
      account.balance=mongoose.Types.Decimal128.fromString(balance.toFixed(2))
      // You may want to log the transaction or do some other processing
    } else {
      // const currentBalance = convertToNumber(account.balance) - parseFloat(amount.toString());
      // Deduct from balance for non-cash transactions
      const balance=parseFloat(currentBalance)
      await accounts.findByIdAndUpdate(accountId, {
        $set: { balance:balance - amount}, new: true
      });
      account.balance = mongoose.Types.Decimal128.fromString(balance.toString());
      await account.save();
    }
  }

  if (type.toLowerCase() === 'income') {
    // const currentBalance = convertToNumber(account.balance) + parseFloat(amount.toString());
    // Update balance for income
    if (isCashTransaction) {
      // Handle expense for cash transaction without deducting from a balance
      // Deduct from balance for non-cash transactions
      const balance=1000000000000;
      console.log('Processing cash expense. No balance deduction needed.');
      await accounts.findByIdAndUpdate(accountId, {
        $set: { balance:balance}, new: true
      });
      account.balance=mongoose.Types.Decimal128.fromString(balance.toFixed(2))
      // You may want to log the transaction or do some other processing
    }else{ 
      const balance=parseFloat(currentBalance)
    await accounts.findByIdAndUpdate(accountId, {
      $set: { balance: balance + amount }, new: true
    });
    account.balance = mongoose.Types.Decimal128.fromString(balance.toString());
    await account.save();
  }
  }
}



export async function csvExportTransaction(req:CreateTransactionRequest, res: Response) {
  const { year, month } = req.body;

  if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required.' });
  }

  try {
      // Fetch transactions based on the year, month, and userId
      const data = await transcation.find({
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          userId: req.user?._id,
      }).populate('category','name _id');

      if (!data.length) {
          return res.status(404).json({ message: 'No transactions found for the specified criteria.' });
      }
      console.log(data,'sd');
      
     
      const covertAllAmount=()=>{
       const dataall= data.map((item)=>({_id:item._id,date:item.date,category:item.category,description:item.description,amount:convertToNumber(item.amount)}));
       return dataall;
      }

      const converted=covertAllAmount();

      // Convert the data to CSV format
      const fields = ['_id', 'amount', 'date', 'name', 'description']; // Adjust fields as per your schema
      const parser = json2csv(converted,{keys:['category','_id','amount','date','description']});
      const csv = parser;

      // Set headers and send the CSV
      res.header('Content-Type', 'text/csv');
      res.attachment(`transaction_data_${year}_${month}.csv`);
      res.send(csv);
  } catch (err) {
      console.error('Error exporting transactions:', err);
      return res.status(500).json({ message: 'Internal server error', error: err });
  }
}