import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

export const redirectIfAuthenticated=(req:Request,res:Response,next:NextFunction):any=>{
      
    if(!req.isAuthenticated()){
        res.redirect('/register')
    }
  next();

}


export const validateTokensMiddleware = (req:Request, res:Response, next:NextFunction) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.cookies["refreshToken"];

  if (!accessToken) {
      return res.status(401).json({ message: "Access Token Required" });
    }
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token Required" });
    }

  // Proceed to the next middleware (e.g., Passport authentication)
  next();
};

export function verifyToken
(req:Request, res:Response, next:NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY!); // Verify token
    req.user={
      token:token,
      
    }
    next();
  } catch (error:any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
}
