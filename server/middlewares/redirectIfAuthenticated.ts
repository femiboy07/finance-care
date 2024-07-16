import { NextFunction, Request, Response } from "express";

export const redirectIfAuthenticated=(req:Request,res:Response,next:NextFunction):any=>{
      
    if(!req.isAuthenticated()){
        res.redirect('/register')
    }
  next();

}