import { Response,Request } from "express";
import CategoryModel from "../models/Category";




export async function fetchCategories(req:Request,res:Response){
        const userId:any=req.user;
    try{
     const categories=await CategoryModel.find({},' -_id name');
     
     return res.status(200).json({data:categories,message:"fetched categories"})
    
    }catch(err){
      return res.status(500).json({message:"probmlem fetching categories",err:err});
    
    }
}