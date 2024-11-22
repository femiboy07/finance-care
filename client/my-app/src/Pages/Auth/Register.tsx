import React, { useEffect, useState } from "react"
import RouterForm from "../../context/reactrouterform";
import { Link, useActionData, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "../../@/components/ui/input";
import axios from "axios";
import { Button } from "../../@/components/ui/button";
import lunchMoneyImg from '../../assets/luncho.png'
import useRequireAuth from "../../hooks/useRequireAuth";
import { apiClient } from "../../context/LoadingContext";

const formSchema = z.object({
    name: z.string(),
    username: z.string(),
    email: z.string({
        required_error: "email is required pls dont forget this"
    }).trim().email({
        message: "pls provide a valid email address",

    }),
    password: z.string({
        required_error: "password is required",
        message: "pls something is wrong"
    }).max(15, "cannot be more than 15 characters",).min(5, "canot be less than 5")
});




const RegisterPage: React.FC = () => {

    const [disabled, setDisabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const errors: any = useActionData();
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useRequireAuth()



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            username: ''
        },

        mode: "onChange"

    });

    const field = useWatch({
        control: form.control
    });



    async function onSubmit(values: z.infer<typeof formSchema>) {

        if (!values) return;
        try {
            setIsLoading(true)
            const response = await axios.post('https://finance-care-14.onrender.com/api/auth/register', {
                name: values.name,
                username: values.username,
                email: values.email,
                password: values.password,
            }, { withCredentials: false, headers: { "Content-Type": "application/x-www-form-urlencoded" }, })
            if (response.status === 200) {
                localStorage.setItem("userAuthToken", JSON.stringify(response.data));
                localStorage.setItem("isNew", JSON.stringify({ user: true }))
                navigate('/dashboard', { replace: true });
                setIsLoading(false)
            }


            if (response.status === 400 && response.data.msg === "Invalid credentials") {
                form.setError('email', { type: "manual", message: "'Invalid credentials. Please check your email and password." })
            }
        } catch (err) {
            console.log(err);
            form.setError('email', { type: "manual", message: "'Invalid credentials. Please check your email and password." })
            setIsLoading(false)
        }


    }

    const handleInputChange = () => {
        form.clearErrors(); // Clears all errors
    };

    useEffect(() => {
        if (token) {
            navigate('/dashboard')
        }
    }, [navigate, token])



    useEffect(() => {
        const email = field.email?.length!;
        const password = field.password?.length!;
        const name = field.name?.length!;
        const username = field.username?.length!
        if (password > 0 && email > 0 && name > 0 && username > 0) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [field, disabled])


    console.log(errors && errors.message)


    return (
        <Form {...form}>
            <div className="lg:w-[95%]  h-[95%]  max-w-md max-md:w-full font-custom mx-auto lg:max-w-4xl lg:mx-[4em] my-auto text-black  dark:text-white overflow-y-auto  flex lg:flex-row  flex-col rounded-md leading-7 justify-center   lg:px-[3em] lg:py:[2em]  space-y-5  bg-white dark:bg-card dark:shadow-none dark:text-foreground shadow-[0px_0px_4px_3px_rgb(238,238,238)]  px-4  border-black ">
                <div className=" flex flex-col justify-between w-full my-auto  px-0 py-[1.25rem]  items-center  text-center">
                    <div></div>
                    <div className="lg:w-1/2 h-full w-full ">
                        <div id='logo-container' style={{ height: '100px', width: '100px', margin: '1em auto', backgroundRepeat: 'no-repeat' }}>
                            <div id="logo" className=" animate-logo-bounce relative top-0 left-[10px]" style={{
                                backgroundImage: `url(${lunchMoneyImg})`,
                                width: '75px', height: '75px', backgroundRepeat: 'no-repeat', backgroundSize
                                    : 'contain'
                            }} ></div>
                            <div id="shadow" className="w-[50px] h-[10px] text-center mx-auto opacity-[0.5px] rounded-[80%] bg-black animate-shadow-move "></div>
                        </div>
                        <h2 className=" p-0  w-full text-xl md:text-3xl text-center font-bold font-900" style={{ margin: 'calc(0.142857em - 2rem) 0rem 1rem' }}>Welcome to The First Day Of Your New Financial Journey</h2>

                        <div>
                            <p className="mt-[1rem] leading-[1.4285em]">Already signed in</p>
                            <Link to={'/auth/login'} className=" font-[700] text-teal-600 m">Log in to your account</Link>
                        </div>
                    </div>
                </div>
                <div className=" px-[0px] lg:w-1/2 flex-shrink-0  w-full max-sm:w-full py-[1.25rem] mx-auto m-[0em]">
                    <RouterForm onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-col max-w-full w-full relative">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] border-orange-400  after:text-red-600 after:ml-2">USERNAME</FormLabel>
                                    <FormControl >
                                        <Input className="dark:text-foreground"  {...field} onChange={(e) => {
                                            field.onChange(e);
                                            handleInputChange()
                                        }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">NAME</FormLabel>
                                    <FormControl >
                                        <Input className="dark:text-foreground" {...field} onChange={(e) => {
                                            field.onChange(e);
                                            handleInputChange()
                                        }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">EMAIL ADDRESS</FormLabel>
                                    <FormControl >
                                        <Input className="dark:text-foreground" {...field} onChange={(e) => {
                                            field.onChange(e);
                                            handleInputChange()
                                        }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">PASSWORD</FormLabel>
                                    <FormControl >
                                        <Input className="dark:text-foreground" type="password" {...field} onChange={(e) => {
                                            field.onChange(e);
                                            handleInputChange()
                                        }} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button className="w-full bg-orange-400 p-2 mt-[1em] " type="submit" disabled={disabled || isLoading}>
                            {isLoading ? "loading..." : "GET STARTED"}
                        </Button>
                        <p className=" text-[0.85em] block text-center mb-0 mt-1">No credit card required.Cancel anytime</p>
                    </RouterForm>
                </div>
            </div>
        </Form >

    )
}


export default RegisterPage;
