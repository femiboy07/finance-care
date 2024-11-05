import mongoose from "mongoose";


export const toDecimal128 = (value: any) => {
    if (typeof value === 'number' || (typeof value === 'string' && value.trim() && !isNaN(Number(value)))) {
        return new mongoose.Types.Decimal128(`${value}`);
    }
    return undefined;
};