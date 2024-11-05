import CategoryModel from '../models/Category';

const defaultCategories = [
  { name: 'Food', type: 'expense', userId: null },
  { name: 'Transportation', type: 'expense', userId: null },
  { name: 'Salary', type: 'income', userId: null },
  { name: 'Entertainment', type: 'expense', userId: null },
  { name: 'CoffeeShops', type: 'expense', userId: null },
  { name: 'Income', type: 'income', userId: null },
  { name: 'Food', type: 'expense', userId: null },
  { name: 'Rent', type: 'expense', userId: null },
  { name: 'deposit', type: 'expense', userId: null },
  { name: 'PaymentTransfer', type: 'expense', userId: null },
  { name: 'Groceries', type: 'income', userId: null },
  { name: 'Withdrawal', type: 'expense', userId: null },
  { name: 'Travel', type: 'expense', userId: null },
  { name: 'Gifts', type: 'expense', userId: null },
  { name: 'Resturants', type: 'expense', userId: null },
  { name: 'Personal Care', type: 'expense', userId: null },
  { name: 'Gas, Transportation', type: 'expense', userId: null },
  { name: 'Bank Fees', type: 'income', userId: null },
  { name: 'Shopping', type: 'expense', userId: null },

];

async function seedCategories() {
  try {
    for (const category of defaultCategories) {
      const existingCategory = await CategoryModel.findOne({
        name: category.name,
        userId: null,
      });

      if (!existingCategory) {
        await CategoryModel.create(category);
        console.log(`Category ${category.name} added to the database.`);
      }
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

async function clearCategories() {
  await CategoryModel.deleteMany({ userId: null }); // Optionally clear global categories
}

export { seedCategories, clearCategories };