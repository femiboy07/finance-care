import { Request,Response } from "express";
import accounts from "../models/Account";
import budgets from "../models/Budgets";
import transcation from "../models/Transcation";





export async function createBudgets(req:Request,res:Response){
    const {accountId,category,amount,period,startDate,endDate}=req.body;

    if (!period) {
        return res.status(400).json({ message: "period.. is required..." });
    }
    if (!amount) {
        return res.status(400).json({ message: "amount is required..." });
    }
    // if (!startDate || isNaN(new Date(startDate).getTime())) {
    //     return res.status(400).json({ message: "start Date is required..." });
    // }
    if (!category) {
        return res.status(400).json({ message: "category is required..." });
    }
    if (!accountId) {
        return res.status(400).json({ message: "Account ID is required..." });
    }

    // if(!endDate || isNaN(new Date(endDate).getTime())){
    //     return res.status(400).json({ message: "end  Date is required..." });  
    // }

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
    } else {
        // If period is 'monthly' or 'yearly', dates are not required
        if (startDate || endDate) {
            return res.status(400).json({ message: "Start date and end date should not be provided for non-custom periods..." });
        }
    }
    // const start = new Date(startDate);
    // const end = new Date(endDate);

    // if(start >= end){
    //     return res.status(400).json({ message: "Start date must be before end date..." });
    // }

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
            startDate: period === 'custom' ? new Date(startDate) : undefined,
            endDate: period === 'custom' ? new Date(endDate) : undefined,
        });

        await newBudget.save();

        return res.status(201).json({ data: newBudget, message: "Budget created successfully..." });
    }catch(err){
        return res.status(500).json({ message: "System error, please try again later", err });
    }


}

interface BudgetParams{
    accountId:string;
    category:string;
    period:string;
    startDate:string;
    endDate:string;

}


export async function getBudgets(req:Request<{},{},BudgetParams,{}>, res: Response) {
    try {
        const { accountId, category, startDate, endDate ,period} = req.query as BudgetParams;
        const filters: any = {};

        if (accountId) filters.accountId = accountId;
        if (category) filters.category = category;

    if(period === 'custom'){
        if (startDate && endDate) {
            filters.startDate = { $gte: new Date(startDate) };
            filters.endDate = { $lte: new Date(endDate) };
        }
    }

    if(period === 'monthly'){
        filters.period = 'monthly'
    }

    if(period === 'yearly'){
        filters.yearly='yearly'
    }

     

        const budget = await budgets.find(filters);
        return res.status(200).json({ data: budget });
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
        if (period) budget.period = period;
        if (startDate) budget.startDate = new Date(startDate);
        if (endDate) budget.endDate = new Date(endDate);

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