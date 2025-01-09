import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';


export const toDecimal128 = (value: any) => {
    if (typeof value === 'number' || (typeof value === 'string' && value.trim() && !isNaN(Number(value)))) {
        return new mongoose.Types.Decimal128(`${value}`);
    }
    return undefined;
};

export function generateToken(payload: object, expiry: string) {
    return jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: expiry });
  }
