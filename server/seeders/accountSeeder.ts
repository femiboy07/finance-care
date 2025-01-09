
import mongoose from 'mongoose';
import User from '../models/User'; // Ensure the User model is imported
import Category from '../models/Category'; // Ensure the Category model is imported
import UserBudget from '../models/Budgets'; 
import Account from '../models/Account';

const seedDefaultAccount = async () => {
  try {
    const users = await User.find({}); // Get all users

    for (const user of users) {
      // Check if the default account exists for each user
      const defaultAccountExists = await Account.findOne({
        name: 'Cash Transaction',
        type: 'def_coin',
        userId: user._id, // Check for user-specific default account

      });

      if (!defaultAccountExists) {
        const account = new Account({
          userId: user._id, // Tie account to the specific user
          type: 'def_coin',
          isSystemAccount: true,
          name: 'Cash Transaction',
          balance: 'unlimited',
        });

        await account.save();
        console.log(`Default account created for user: ${user._id}`);
      } else {
        console.log(`Default account already exists for user: ${user._id}`);
      }
    }

    console.log("Default account seeding complete.");
  } catch (error) {
    console.error("Error seeding default accounts:", error);
  }
};
  
async function clearAccounts() {
    await Account.deleteMany(); // Optionally clear global categories
}

  export {seedDefaultAccount,clearAccounts};
  