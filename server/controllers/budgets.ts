import { Request,Response } from "express";
import accounts from "../models/Account";
import budgets from "../models/Budgets";
import { convertToNumber, CreateTransactionRequest } from "./transcation";
import transcation from "../models/Transcation";
import CategoryModel from "../models/Category";
import mongoose, { AnyBulkWriteOperation, ObjectId } from "mongoose";
import Decimal from "decimal.js";
import { toDecimal128 } from "../utils/modify";



const findTransactionBudgets = async (category: string,userId:any): Promise<number> => {
    const categoryId=await CategoryModel.findOne({userId:userId,name:category});
    const alltransactionBudgets = await transcation.find({ category:categoryId?._id,userId:userId }).populate({path:'category',select:'name type'});
    console.log(alltransactionBudgets);
    
    if (!alltransactionBudgets || alltransactionBudgets.length === 0) {
        return 0.0;
    }

    const getTotalSpent = alltransactionBudgets.reduce((acc: number, current: any) => {
        const amount = parseFloat(current.amount.toString());
        return acc + amount;
    }, 0);

    console.log(getTotalSpent, 'spent');
    return getTotalSpent;
};

// export async function createBudgets(req:CreateTransactionRequest,res:Response){
//     const {accountId,category,amount,period,startDate,endDate}=req.body;

//     const existingbudget=await budgets.findOne({userId:req.user?._id,category:category});
   
//     if(existingbudget){
//       return res.status(400).json({ message: "Budget for this category already exists" });
//     }

//    if (!period) {
//         return res.status(400).json({ message: "period.. is required..." });
//     }
//     if (!amount) {
//         return res.status(400).json({ message: "amount is required..." });
//     }
   
//     if (!category) {
//         return res.status(400).json({ message: "category is required..." });
//     }
//     if (!accountId) {
//         return res.status(400).json({ message: "Account ID is required..." });
//     }

   

//     if (period === 'custom') {
//         if (!startDate || isNaN(new Date(startDate).getTime())) {
//             return res.status(400).json({ message: "Start date is required for custom period..." });
//         }
//         if (!endDate || isNaN(new Date(endDate).getTime())) {
//             return res.status(400).json({ message: "End date is required for custom period..." });
//         }
//         const start = new Date(startDate);
//         const end = new Date(endDate);

//         if (start >= end) {
//             return res.status(400).json({ message: "Start date must be before end date..." });
//         }
//     } else{
//         // If period is 'monthly' or 'yearly', dates are not required
//         if (startDate || endDate) {
//             return res.status(400).json({ message: "Start date and end date should not be provided for non-custom periods..." });
//         }
//     }
    
   

//     try{
//         const account = await accounts.findOne({_id:accountId});
//         if (!account) {
//             return res.status(404).json({ message: "Account not found..." });
//         }

//       const spent=await findTransactionBudgets(category)

//         // Create the new budget
//        const newBudget = await budgets.create({
//             userId:req.user?._id!,
//             accountId,
//             spent:spent,
//             remaining:spent-amount,
//             category,
//             amount,
//             period,
//             startDate: period === 'custom' ? new Date(startDate) : undefined,
//             endDate: period === 'custom' ? new Date(endDate) : undefined,
//         })

//         await newBudget.save();

//         return res.status(200).json({ data: newBudget, message: "Budget created successfully..." });
//     }catch(err){
//         return res.status(500).json({ message: "System error, please try again later", err });
//     }


// }

interface BudgetParams{
    accountId?:string;
    category?:string;
    period?:string;
    month:string;
    year:string;
    startDate?:string;
    endDate?:string;
   

}
export async function getBudgets(req: CreateTransactionRequest, res: Response) {
    try {
        const { year, month } = req.params;
        const userId = req.user?._id; // Assuming `req.user` has been populated via authentication middleware.

        // Fetch all categories to show each one in the response, even if no budget entry exists.
        const allCategories = await CategoryModel.find({});
         const definedYear=parseInt(year,10);
         const definedMonth=parseInt(month,10);
        // Set date range filters for the specified month and year
        const start = new Date(Date.UTC(definedYear, definedMonth-1, 1));
        const end = new Date(Date.UTC(definedYear, definedMonth, 0, 23, 59, 59, 999));
        
        // Find budgets for this user, year, and month, grouped by category.

        const budget = await budgets.find({
            userId:userId,
            month:definedMonth,
            year:definedYear,
            // createdAt: { $gte: start, $lte: end },
           
        }).populate({ path: 'category', select: 'name type' }).lean();
        console.log(budget,"budgets")

        // Map each category to a budget entry, adding defaults for missing categories.
        const data = allCategories.map((category:any) => {
            const categoryBudget:any = budget.find((b:any) => b.category._id.toString() === category._id.toString());
            console.log(categoryBudget,'categoryBudet')
            return {
                category: category.name,
                _id: categoryBudget?._id,
                month:categoryBudget ? categoryBudget.month : null,
                year:categoryBudget ? categoryBudget.year : null,
                budget: categoryBudget ? categoryBudget.budget : new mongoose.Types.Decimal128("0.0"),
                spent: categoryBudget ? categoryBudget.spent :new mongoose.Types.Decimal128("0.0") ,
                remaining: categoryBudget ? categoryBudget.remaining :new mongoose.Types.Decimal128("0.0") ,
            };
        });

        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}
export async function updateBudget(req: CreateTransactionRequest, res: Response) {
    const { category, amount, spent, remaining, year, month } = req.body;
    const userId = req.user?._id;
  console.log(spent,remaining,amount)
    try {
        const definedMonth=month;
        const definedYear=year;
        // Retrieve category by name and validate
        const categoryDoc = await CategoryModel.findOne({ name: category, userId: null });
        if (!categoryDoc || !categoryDoc._id) {
            return res.status(400).json({ message: 'Category not found or invalid' });
        }

        // Ensure category ID is valid
        const categoryId = mongoose.isValidObjectId(categoryDoc._id)
            ? categoryDoc._id
            : new mongoose.Types.ObjectId();

        // Helper function to safely convert to Decimal128
      

        // Convert amounts safely
        const decimalAmount = toDecimal128(amount);
        const decimalSpent = toDecimal128(spent);
        const decimalRemaining = toDecimal128(remaining);
        console.log(decimalAmount,decimalSpent,decimalRemaining,'dd');

        // Check if a budget entry already exists for this category, user, year, and month;
        const prevBudget=await budgets.findOne({category:categoryDoc._id,year:parseInt(definedYear,10),month:parseInt(definedMonth,10)+1,userId})
        
        console.log(prevBudget?.spent.toString())
        let budgetEntry = await budgets.findOneAndUpdate(
            {
                userId,
                category: categoryDoc._id,
                year: parseInt(definedYear, 10),
                month: parseInt(definedMonth, 10) + 1,
            },
            {
                $set: {
                    budget: decimalAmount,
                    spent:  decimalSpent,
                    remaining: prevBudget && prevBudget.spent.toString() !== "0.0" ?  parseFloat(amount) - parseFloat(prevBudget.spent.toString()) :   decimalRemaining,
                }
            },
            { new: true, upsert: false }
        );
        console.log(budgetEntry,'entry')
    
        if (!budgetEntry) {
            // Update existing budget
          //lets check if this new budget created already has some transactions
          const checkCategory=await transcation.findOne({category:categoryId,month:parseInt(definedMonth,10) + 1 ,year:parseInt(definedYear,10)});
            // Create new budget if none exists
            const newBudget = new budgets({
                userId,
                category: categoryId,
                budget: decimalAmount,
                spent:checkCategory && decimalSpent ? parseFloat(checkCategory.amount.toString()) -parseFloat(decimalSpent?.toString()) : decimalSpent,
                remaining: checkCategory && decimalSpent && decimalAmount ? parseFloat(decimalAmount?.toString()) - parseFloat(checkCategory.amount.toString()) : decimalRemaining,
                year: parseInt(definedYear, 10),
                month: parseInt(definedMonth, 10) + 1,
            });
            await newBudget.save();
            return res.status(201).json({ message: 'Budget created', data: newBudget });
        }
        return res.status(200).json({ message: 'Budget updated', data: budgetEntry });
    } catch (error: any) {
        console.error('Error in updateBudget:', error);
        return res.status(500).json({ error: 'Failed to upsert budget', details: error.message });
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
        const result = await budgets.findOneAndUpdate({
            _id:id},
            {
                $set:{
                    budget:new mongoose.Types.Decimal128(""),
                    remaining:new mongoose.Types.Decimal128("0.0")
                }
            });
        if (!result) {
            return res.status(404).json({ message: "Cant unset this it has no budget for it..." });
        }
    

        return res.status(200).json({ message: "Budget deleted successfully..." });
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}