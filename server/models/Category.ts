import mongoose from "mongoose";

interface Category{

        userId:mongoose.Schema.Types.ObjectId,          // ID of the user (for custom categories) or null for global categories
        name: string,            // Name of the category (e.g., "food", "transportation")
        type: string,            // Type of category: "income" or "expense"
        createdAt:Date,      // Date when the category was created
        updatedAt: Date       // Date when the category was last updated
      
}



const userCategory=new mongoose.Schema<Category>({
         userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
         } ,
         name:String,
         type:String,
         createdAt:Date,
         updatedAt:Date,

})


const category=mongoose.model('Category',userCategory);


export default category;