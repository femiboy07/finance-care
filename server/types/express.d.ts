import * as express from 'express';

// Declare module augmentation for Express
export declare global {
  namespace Express {
    // Adding token field to the user interface
    interface User {
      userId?:string;
      _id?:mongoose.Schema.Types.ObjectId;
      token?: string; // The `token` field is optional
    }
  }
}