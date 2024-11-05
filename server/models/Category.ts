import mongoose,{Document, Schema} from "mongoose";
import { value } from "./Transcation";

// Define the Category interface
interface Category extends Document {
  userId: mongoose.Schema.Types.ObjectId | null; // null for global categories
  name: string;
  type: 'income' | 'expense'; // Specifies the category type
  createdAt: Date;
  updatedAt: Date;
}

// Create the Mongoose schema
const categorySchema = new Schema<Category>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Default to null for global categories
  },
  name: {
    type: String,
    required: true,
    unique: true // Ensures unique category names
  },
  type: {
    type: String,
    enum: ['income', 'expense'], // Enforces type as income or expense
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update `updatedAt` field on document update
categorySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model from the schema
const CategoryModel = mongoose.model<Category>('Category', categorySchema);

export default CategoryModel;