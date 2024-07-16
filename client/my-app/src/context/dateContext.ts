import React, { createContext, useContext } from 'react';



type Picker={
    year:number;
    month:number;
}


const monthPicker=createContext<Picker | null>(null);





