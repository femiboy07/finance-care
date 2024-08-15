import { Request,Response } from "express";
import accounts from "../models/Account";
import budgets from "../models/Budgets";
import { CreateTransactionRequest } from "./transcation";
import transcation from "../models/Transcation";






export async function createBudgets(req:CreateTransactionRequest,res:Response){
    const {accountId,category,amount,period,startDate,endDate}=req.body;

    const existingbudget=await budgets.findOne({userId:req.user?._id,category:category});
    if(existingbudget){
      return res.status(400).json({ message: "Budget for this category already exists" });
    }



    if (!period) {
        return res.status(400).json({ message: "period.. is required..." });
    }
    if (!amount) {
        return res.status(400).json({ message: "amount is required..." });
    }
   
    if (!category) {
        return res.status(400).json({ message: "category is required..." });
    }
    if (!accountId) {
        return res.status(400).json({ message: "Account ID is required..." });
    }

   

    if (period === 'custom') {
        if (!startDate || isNaN(new Date(startDate).getTime())) {
            return res.status(400).json({ message: "Start date is required for custom period..." });
        }
        if (!endDate || isNaN(new Date(endDate).getTime())) {
            return res.status(400).json({ message: "End date is required for custom period..." });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({ message: "Start date must be before end date..." });
        }
    } else{
        // If period is 'monthly' or 'yearly', dates are not required
        if (startDate || endDate) {
            return res.status(400).json({ message: "Start date and end date should not be provided for non-custom periods..." });
        }
    }
    
   

    try{
        const account = await accounts.findOne({_id:accountId});
        if (!account) {
            return res.status(404).json({ message: "Account not found..." });
        }



        // Create the new budget
       const newBudget = await budgets.create({
            userId:req.user?._id!,
            accountId,
            spent:0.0,
            remaining:0.0,
            category,
            amount,
            period,
            startDate: period === 'custom' ? new Date(startDate) : undefined,
            endDate: period === 'custom' ? new Date(endDate) : undefined,
        })

        await newBudget.save();

        return res.status(200).json({ data: newBudget, message: "Budget created successfully..." });
    }catch(err){
        return res.status(500).json({ message: "System error, please try again later", err });
    }


}

interface BudgetParams{
    accountId?:string;
    category?:string;
    period?:string;
    month:string;
    year:string;
    startDate?:string;
    endDate?:string;
    page?:string;
    pageLimit?:string;

}


export async function getBudgets(req:Request<{},{},BudgetParams,{}>, res: Response) {
    try {
        const { accountId, category, startDate, endDate ,period,page,pageLimit} = req.query as BudgetParams;
        const {year,month}=req.params as any;
        
       const userId:any=req.user;
        const filters: any = {userId:userId._id};

        if (accountId) filters.accountId = accountId;
        if (category) filters.category = category;

    if(period === 'custom'){
        if (startDate && endDate) {
            filters.createdAt = { $gte: new Date(startDate) ,$lte:new Date(endDate)};
            
        }
    }

    if(period === 'monthly'){
        filters.period = 'monthly'
        const start = new Date(Date.UTC(year, month - 1, 1)); // Start of the specified month in UTC
        const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); 
        filters.createdAt={$gte:start,$lte:end}
    }

    if(period === 'yearly'){
        filters.yearly='yearly'
         const start = new Date(Date.UTC(year, month - 1, 1)); // Start of the specified month in UTC
        const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); 
        filters.createdAt={$gte:start,$lte:end}
    }

    const start = new Date(Date.UTC(year, month - 1, 1)); // Start of the specified month in UTC
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); 
    console.log(start)
    console.log(start.toISOString(),end.toISOString())
    filters.createdAt = { $gte: start, $lte: end }; 
    const pageNumber = parseInt(page as unknown as string) || 1; // Default to page 1
    const limitNumber = parseInt(pageLimit as unknown as string) || 5;
    const skip = (pageNumber - 1) * limitNumber;
    const budget = await budgets.find(filters).skip(skip).limit(limitNumber);
        const totalItems = await budgets.countDocuments(filters);
        const totalPages = Math.ceil(totalItems / limitNumber);
        return res.status(201).json({ data: budget ,pagination: {
            totalItems,
            totalPages,
            currentPage: pageNumber,
            pageLimit: limitNumber
          },});
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}



export async function updateBudget(req: Request, res: Response) {
    const { id } = req.params;
    const { category, amount, period, startDate, endDate } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Budget ID is required..." });
    }

    try {
        const budget = await budgets.findById(id);
        if (!budget) {
            return res.status(404).json({ message: "Budget not found..." });
        }

        // Update the budget fields
        if (category) budget.category = category;
        if (amount) budget.amount = amount;
        if (period) {
            budget.period = period;
           if(budget.period === 'custom'){
           budget.startDate = new Date(startDate);
           budget.endDate = new Date(endDate);
           }
        }

    await budget.save();

        return res.status(200).json({ data: budget, message: "Budget updated successfully..." });
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}


export async function calculateBudgetSummary(req:Request,res:Response){
    const {category}=req.query;

    if (!category) {
        return res.status(400).json({ message: "Category is required..." });
    }
    try{
      const totalBudgetResult=await budgets.aggregate([
        {$match:{category}},
        {$group:{_id:null,totalBudget:{$sum:"$amount"}}}
      ]);

      const totalBudget = totalBudgetResult[0]?.totalBudget || 0;
      const totalSpentResult = await transcation.aggregate([
        { $match: { category } },
        { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
    ])
    const totalSpent = totalSpentResult[0]?.totalSpent || 0;

    const remainingBudget=totalBudget-totalSpent;
    const remainingBudgetPercentage = totalBudget > 0 
    ? (remainingBudget / totalBudget) * 100 
    : 0;
    return res.status(200).json({
        totalBudget,
        totalSpent,
        remainingBudget,
        remainingBudgetPercentage
    });

    }catch(err){
        return res.status(500).json({ message: "System error, please try again later", err });
    }


}





export async function deleteBudget(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Budget ID is required..." });
    }

    try {
        const result = await budgets.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: "Budget not found..." });
        }

        return res.status(200).json({ message: "Budget deleted successfully..." });
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}