

import mongoose from 'mongoose';
import User from '../models/User'; // Ensure the User model is imported
import Category from '../models/Category'; // Ensure the Category model is imported
import UserBudget from '../models/Budgets'; // Your userBudgets schema model

// Default budget values
const defaultBudgetAmount = new mongoose.Types.Decimal128("0.0"); // Default amount
const defaultSpent = new mongoose.Types.Decimal128("0.0");
const defaultRemaining = defaultBudgetAmount;

const seedDefaultBudget = async () => {
  try {
    const users = await User.find({}); // Get all users
    const categories = await Category.find({}); // Get all categories

    for (const user of users) {
      for (const category of categories) {
        // Check if the budget exists for the user and category
        const existingBudget = await UserBudget.findOne({
          userId: user._id,
          category: category._id,
        });

        if (!existingBudget) {
          // Create a new budget document with default values
          await UserBudget.create({
            userId: user._id,
            category: category._id,
            budget: defaultBudgetAmount,
            spent: defaultSpent,
            remaining: defaultRemaining,
          });
          console.log(`Default budget created for user ${user._id} and category ${category.name}`);
        }
      }
    }
    console.log("Budget seeding complete.");
  } catch (error) {
    console.error("Error seeding budgets:", error);
  }
};


async function clearBudgets() {
    await UserBudget.deleteMany(); // Optionally clear global categories
  }

export {seedDefaultBudget,clearBudgets};