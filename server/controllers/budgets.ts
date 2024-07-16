import { Request,Response } from "express";
import accounts from "../models/Account";
import budgets from "../models/Budgets";





export async function createBudgets(req:Request,res:Response){
    const {accountId,category,amount,period,startDate,endDate}=req.body;

    if (!period) {
        return res.status(400).json({ message: "period.. is required..." });
    }
    if (!amount) {
        return res.status(400).json({ message: "amount is required..." });
    }
    if (!startDate || isNaN(new Date(startDate).getTime())) {
        return res.status(400).json({ message: "start Date is required..." });
    }
    if (!category) {
        return res.status(400).json({ message: "category is required..." });
    }
    if (!accountId) {
        return res.status(400).json({ message: "Account ID is required..." });
    }

    if(!endDate || isNaN(new Date(endDate).getTime())){
        return res.status(400).json({ message: "end  Date is required..." });  
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    if(start >= end){
        return res.status(400).json({ message: "Start date must be before end date..." });
    }

    try{
        const account = await accounts.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: "Account not found..." });
        }

        // Create the new budget
        const newBudget = await budgets.create({
            accountId,
            category,
            amount,
            period,
            startDate: start,
            endDate: end
        });

        await newBudget.save();

        return res.status(201).json({ data: newBudget, message: "Budget created successfully..." });
    }catch(err){
        return res.status(500).json({ message: "System error, please try again later", err });
    }

}