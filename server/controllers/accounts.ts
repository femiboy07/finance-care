import { Request, Response } from "express";
import accounts from "../models/Account";
import transcation from "../models/Transcation";
import budgets from "../models/Budgets";
import mongoose from "mongoose";
import { CreateTransactionRequest } from "./transcation";
import user from "../models/User";
import CategoryModel from "../models/Category";





export async function createAccount(req: CreateTransactionRequest, res: Response) {
    const { name, type, balance } = req.body;

    // Validate required fields
    if (!name || !type || balance === undefined || balance < 0) {
        return res.status(400).json({ message: "Name, type, and a valid positive balance are required to create an account" });
    }

    const userId = req.user?._id; // Extract user ID from the request

    if (!userId) {
        return res.status(400).json({ message: "User ID is missing from the request." });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create the account
        const newAccount = new accounts({
            userId: userId,
            name: name,
            type: type,
            balance: balance
        });

        // Save the new account within the transaction
        await newAccount.save({ session });

        // Update user's account list (Assuming 'users' model exists and has accounts array)
        const userAccount = await user.findById(userId).session(session);
        if (!userAccount) {
            throw new Error("User not found");
        }

        // Add the new account's ID to the user's accounts array
        userAccount.accounts.push(newAccount._id);
        await newAccount.save({session})
        await userAccount.save({ session });

        // Create initial transaction if balance > 0
        if (balance > 0) {
        const addCategory=await CategoryModel.findOne({name:"deposit"})
        if(!addCategory){
            throw new Error('not found')
        }
            
            // const initialTransaction =  new transcation({
            //     userId:userId,
            //     accountId: newAccount._id,
            //     category: addCategory._id,
            //     name:userAccount.name,
            //     amount: balance,
            //     status: "cleared",
            //     type: addCategory.type, // Assuming it's an initial deposit
            //     description: 'Initial deposit'
            // });

            // // Save the initial transaction within the transaction
            // (await initialTransaction.save({ session }));

            // // Add the transaction ID to the account's transactions array
            // newAccount.transcations.push(initialTransaction._id);
            await newAccount.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Return success response
        return res.status(200).json({ account: newAccount, message: "Account created successfully" });
    } catch (err) {
        // Rollback transaction if there's an error
        await session.abortTransaction();
        session.endSession();

        // Log the error for debugging
        console.error("Error during account creation:", err);

        // Return error response
        return res.status(500).json({ message: "An error occurred, please check your connection", error: err });
    }
}

export async function updateAccount(req:Request,res:Response){
    const {id}=req.params;
     const {name,type,balance}=req.body; 
     if (!id) {
            return res.status(400).json({ message: "Account ID is required..." });
        }
        try {
                const account = await accounts.findById(id);
                if (!account) {
                    return res.status(404).json({ message: "Account not found..." });
                }
          
                // Update the account fields

              
                if (balance) account.balance = balance;
                if (name)  account.name = name;
                if (type) account.type=type
                
          
               await account.save();
          
                return res.status(200).json({ data: account, message: "Budget updated successfully..." });
            } catch (err) {
                return res.status(500).json({ message: "System error, please try again later", err });
            }

}



export async function deleteAccount(req: Request, res: Response) {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ message: "Account ID is required" });
    }
  
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Find and delete the account
      const account = await accounts.findByIdAndDelete(id).session(session);
  
      if (!account) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Account with ID ${id} not found` });
      }
  
      // Delete all transactions related to the account
      await transcation.deleteMany({ accountId: id }).session(session);
  
      // Delete all budgets related to the account
      await budgets.deleteMany({ accountId: id }).session(session);
  
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
  
      return res.status(200).json({ message: `Account with ID ${id} and its related records have been deleted` });
    } catch (err) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: "An error occurred while deleting the account", err });
    }
  }

  export async function getAccounts(req: CreateTransactionRequest, res: Response) {
    try {
        const userId: any = req.user;

        // Fetch accounts concurrently
        const [allAccount, defaultAccount] = await Promise.all([
            accounts.find({ userId: userId }),
            accounts.findOne({ userId: null, isSystemAccount: true })
        ]);

        if (!allAccount.length && !defaultAccount) {
            return res.status(403).send("You have no accounts yet, please create one");
        }

        const allAccounts = [...allAccount, defaultAccount].filter(Boolean); // Ensures no null/undefined values in array

        return res.status(200).json({
            allAccounts,
            message: "List of accounts retrieved successfully"
        });
    } catch (err) {
        console.error("Error fetching accounts:", err);
        return res.status(500).send("Server error, please check your connection");
    }
}


