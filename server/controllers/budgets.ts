import { Request,Response } from "express";
import budgets from "../models/Budgets";
import transcation from "../models/Transcation";
import CategoryModel from "../models/Category";
import mongoose from "mongoose";
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


export async function getBudgets(req: Request, res: Response) {
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
            console.log(categoryBudget,'categoryBudet');
            // const checkCategory=await transcation.find({category:category._id,month:definedMonth ,year:definedYear});
            // console.log(checkCategory,"checkcategory")
            // const amountReduce=checkCategory && checkCategory.reduce((prev:any,current:any)=>prev.amount + current.amount,0);
            // const convertReduce=toDecimal128(amountReduce);
            return {
                category: category.name,
                _id: categoryBudget?._id,
                month:categoryBudget ? categoryBudget.month : null,
                year:categoryBudget ? categoryBudget.year : null,
                budget: categoryBudget ? categoryBudget.budget : new mongoose.Types.Decimal128("0.0"),
                spent: categoryBudget ? categoryBudget.spent  :new mongoose.Types.Decimal128("0.0") ,
                remaining: categoryBudget ? categoryBudget.remaining  :new mongoose.Types.Decimal128("0.0") ,
            };
        });

        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}
export async function updateBudget(req: Request, res: Response) {
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
          const checkCategory=await transcation.find({category:categoryId,month:parseInt(definedMonth,10) + 1 ,year:parseInt(definedYear,10)});
          console.log(checkCategory,"checkcategory")
          const amountReduce=checkCategory && checkCategory.reduce((prev:any,current:any)=>prev.amount + current.amount,0);
          const convertReduce=toDecimal128(amountReduce);
            // Create new budget if none exists
            
            const newBudget = new budgets({
                userId,
                category: categoryId,
                budget: decimalAmount,
                spent:convertReduce   ? parseFloat(convertReduce?.toString())  : decimalSpent,
                remaining: convertReduce && decimalAmount && decimalAmount?.toString() !== '0.0' ? parseFloat(decimalAmount?.toString()) - parseFloat(convertReduce.toString()) : decimalRemaining,
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
                    budget:new mongoose.Types.Decimal128("0.0"),
                    remaining:new mongoose.Types.Decimal128("0.0"),
                    
                }
            },{upsert:false,new:true});
        if (!result) {
            return res.status(404).json({ message: "Cant unset this it has no budget for it..." });
        }
    

        return res.status(200).json({ message: "Budget deleted successfully..." });
    } catch (err) {
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}


export async function clearAllBudgets(req:Request,res:Response){
    const {month,year}=req.body;
  try{
    const unsetAllbudget=await budgets.updateMany(
        {month:month,year:year},
      {$set:{
        budget:new mongoose.Types.Decimal128("0.0"),
        remaining:new mongoose.Types.Decimal128("0.0"),
      }},{upsert:false,new:true}
    )

        
    if (!unsetAllbudget) {
        return res.status(404).json({ message: "An error occured trying to clear all budgets...." });
    }
      return res.status(200).json({ message: "Budget cleared successfully..." });
    }catch(err){
        return res.status(500).json({ message: "System error, please try again later", err });
    }
}