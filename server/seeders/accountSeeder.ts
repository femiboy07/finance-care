
import mongoose from 'mongoose';
import User from '../models/User'; // Ensure the User model is imported
import Category from '../models/Category'; // Ensure the Category model is imported
import UserBudget from '../models/Budgets'; 
import Account from '../models/Account';



const seedDefaultAccount = async () => {
    try {
        const defaultAccountExists = await Account.findOne({ name: 'Cash Transaction' ,type:'def_coin',userId:null});
      const users = await User.find({}); // Get all users
      const categories = await Category.find({}); // Get all categories
  
      for (const user of users) {
        if(!defaultAccountExists){  
          const account= await Account.create({
             userId:null,
             type:'def_coin',
             isSystemAccount:true,
             name:'Cash Transaction',
             balance:0
             
          })

         await account.save()
          
        }else{
            console.log('default account already exists!...')
        }
        
      }
      console.log("Budget seeding complete.");
    } catch (error) {
      console.error("Error seeding budgets:", error);
    }
  };
  
async function clearAccounts() {
    await Account.deleteMany(); // Optionally clear global categories
}

  export {seedDefaultAccount,clearAccounts};
  