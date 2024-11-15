import React from "react";
import { Link } from "react-router-dom";
import lunchMoneyImg from '../../assets/luncho.png'


export default function LogOut() {
    return (
        <div className="loading-banner fixed top-0 left-0  z-[8888]  bg-black bg-opacity-50 text-white text-xl">
            <div className="flex min-h-full justify-center items-center m-0 w-full">
                <div className="max-w-md w-full text-black shadow-md text-center h-fit py-4 px-4 bg-white flex flex-col">
                    <div className="max-w-[1600px] w-[90%] mx-auto block">
                        <div className="w-[100px] h-[100px] my-[1em] mx-auto flex justify-center  items-center flex-col ">
                            <div style={{ backgroundImage: `url(${lunchMoneyImg})`, backgroundRepeat: "no-repeat", backgroundSize: "contain" }} className="circle w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] flex justify-center  rounded-full relative  top-0 animate-logo-bounce "></div>
                            <div className="w-[50px] opacity-[0.5] h-[10px] animate-shadow-move   bg-black rounded-[80%] mt-5"></div>
                        </div>
                        <h1 className=" leading-[1.28571429em] font-[900] text-[#4f4f47] text-[2.5rem]">See you again soon</h1>
                        <Link to={'/auth/login'} className="text-teal-400 font-[700]" >log back in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}