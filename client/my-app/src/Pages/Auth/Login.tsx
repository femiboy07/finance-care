import React, { useEffect, useState } from "react"
import RouterForm from "../../context/reactrouterform";
import { Link, useActionData, useFetcher, useLocation, useNavigate, useNavigation, useSubmit } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "../../@/components/ui/input";
import { Button, buttonVariants } from "../../@/components/ui/button";
import { useAuth } from "../../context/userAutthContext";
import useRequireAuth from "../../hooks/useRequireAuth";
import { useLoading } from "../../context/LoadingContext";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { queryClient } from "../..";
import { useData } from "../../context/DataProvider";
import lunchMoneyImg from '../../assets/luncho.png';

const formSchema = z.object({
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

const LoginPage: React.FC = () => {

  const [disabled, setDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setShowModal } = useLoading();
  const { isOnline } = useOnlineStatus();
  const { logIn, setIsUserLoggedIn } = useData();
  const { token } = useRequireAuth();




  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
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
      const response = await logIn(values.email, values.password);
      if (!isOnline) {
        form.setError('root', { type: "custom", message: "No internet connection available" });
        return;
      }

      if (response.status === 200) {
        localStorage.setItem("userAuthToken", JSON.stringify(response.data));
        navigate('/dashboard', { replace: true });
        setIsLoading(false);
        setIsUserLoggedIn(true)
        queryClient.invalidateQueries({ queryKey: ["username"] })
        setShowModal(false)
        localStorage.setItem('isUserLoggedIn', 'true');
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
    if (!isOnline) {
      form.setError('root', { type: "custom", message: "No internet connection available" });
      return;
    }
    const email = field.email?.length!;
    const password = field.password?.length!;
    if (password > 0 && email > 0) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [field, disabled, isOnline, form])





  return (
    <Form {...form}>
      <div className="w-full font-custom bg-card dark:bg-card   dark:shadow-sm  max-w-sm h-fit text-black dark:text-foreground  overflow-y-auto overflow-x-hidden flex rounded-md leading-7 justify-center  py-4  lg:py-4  space-y-5 flex-col bg-white  shadow-[0px_0px_4px_3px_rgb(238,238,238)] px-4 border-black ">
        <div className="block max-w-[1600px] w-[90%] mx-auto h-fit">
          <div className="w-[100px] h-[100px] m-auto flex justify-center items-center flex-col ">
            <div style={{ backgroundImage: `url(${lunchMoneyImg})`, backgroundRepeat: "no-repeat", backgroundSize: "contain" }} className="circle w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] flex justify-center  rounded-full relative  top-0 animate-logo-bounce "></div>
            <div className="w-[50px] opacity-[0.5] h-[10px] animate-shadow-move   bg-black rounded-[80%] mt-5"></div>
          </div>
          <h1 className="text-center prose prose-h1:text-lg text-xl dark:text-foreground md:text-2xl text-stone-700 lg:text-3xl font-bold text-nowrap">Welcome Back!!</h1>
          {/* {!isOnline && <span>No internet connection</span>} */}
          <RouterForm onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col m-[1em_0px_2em] space-y-4">
            {form.formState.errors && form.formState.errors.email?.type === "manual" && <span className="text-white text-center bg-red-600 px-3 rounded-md">{form.formState.errors.email.message}</span>}
            {form.formState.errors && form.formState.errors.root?.type === "custom" && <span className="text-white text-center bg-red-600 px-3 rounded-md">{form.formState.errors.root.message}</span>}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">EMAIL</FormLabel>
                  <FormControl >
                    <Input className="text-foreground"  {...field} onChange={(e) => {
                      field.onChange(e);
                      handleInputChange()
                    }} autoComplete="additional-name" />
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
                  <FormControl>
                    <Input className="text-foreground" type="password" autoComplete="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="relative py-2 ">
              <button className=" text-right  absolute min-w-[45px] right-0 text-sm justify-end font-bold text-teal-500 flex">Forgot password?</button>
            </div>
            <Button className={buttonVariants({ variant: 'default', className: "w-full bg-orange-400 p-2 mt-2 hover:bg-orange-400 text-foreground" })} type="submit" disabled={disabled || isLoading}>
              {isLoading ? "loading..." : "LOGIN"}
            </Button>

            <span className="text-center mt-2 text-sm">Not registerd yet? <Link to={'/auth/register'} className="text-teal-500 font-bold">Create an account.</Link></span>
          </RouterForm>
        </div>

      </div>
    </Form>

  )
}


export default LoginPage;
