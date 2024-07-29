import  React,{useEffect, useState} from "react"
import RouterForm from "../../context/reactrouterform";
import { ActionFunctionArgs, json, LoaderFunctionArgs, useActionData, useFetcher, useLocation, useNavigate, useNavigation, useRouteError, useSubmit } from "react-router-dom";
import {zodResolver} from "@hookform/resolvers/zod";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "../../@/components/ui/form";
import z, { object } from "zod";
import { useController, useForm, useWatch } from "react-hook-form";
import { Input } from "../../@/components/ui/input";
import axios from "axios";
import { redirect } from "react-router-dom";
import { Button } from "../../@/components/ui/button";
import { useAuth } from "../../context/userAutthContext";
import { useMutation } from "@tanstack/react-query";
// import { LoginUser } from "../../api/apiRequest";
import useRequireAuth from "../../hooks/useRequireAuth";

const formSchema=z.object({
   email:z.string({
    required_error:"email is required pls dont forget this"
   }).trim().email({
    message:"pls provide a valid email address",

   }),
   password:z.string({
    required_error:"password is required",
    message:"pls something is wrong"
   }).max(15,"cannot be more than 15 characters",).min(5,"canot be less than 5")
});

type FormData={
  request:Request,
  params:any

}

type LoginErrors={
  message:string,
}


// export function InvalidUser(){
//   let error=useRouteError();
//   console.log(error)
//   return <div>Dang!! error</div>
// }


// export async function loader(){
//      return json({ok:true})
// }


// export async function action({request,params}:ActionFunctionArgs){
//     const formData=await request.formData();
//     console.log(formData)
//     const errors:LoginErrors={
//       message:"invalid credentials pls check your details",

//     };
    
    
//     //perform post request here ooh;
//   const res= await axios.post('http://localhost:5000/api/auth/logIn',{
//          email:formData.get("email"),
//          password:formData.get("password")
//     },{
//       headers:{
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });
//     console.log(res);

//     // if(res.status === 500){
//     //   return errors;
//     // }

//     // if(res.status === 400 && res.data.msg === "Invalid credentials"){
//     //      redirect('/auth/login')
//     //     return errors;
//     // }

//     if(res.status === 200){
//       localStorage.setItem("userAuthToken",JSON.stringify(res.data));
//       return redirect('/dashboard');
//     }
   
// }


const LoginPage:React.FC=()=>{
    
       const [disabled,setDisabled]=useState<boolean>(true);
       const navigation=useNavigation();
       const [isLoading,setIsLoading]=useState(false);
       const fetcher=useFetcher();
       const submit=useSubmit();
       const errors:any=useActionData();
       const location=useLocation();
       const navigate=useNavigate();
       const {setAuth}=useAuth();
       const auth=useRequireAuth();

      
      
         
  const form=useForm<z.infer<typeof formSchema>>({
          resolver:zodResolver(formSchema),
          defaultValues:{
          email:"",
          password:"",
      },
      
    mode:"onChange"
      
  });

  const field=useWatch({
     control:form.control
  });

  
   
   async function onSubmit(values:z.infer<typeof formSchema>){

    if(!values) return;
      try{
        setIsLoading(true)
      const response=await axios.post('http://localhost:5000/api/auth/logIn',{
      email:values.email,
      password:values.password,
    },{
      headers:{
        'Content-Type':"application/x-www-form-urlencoded"
      }
    })
    if(response.status === 200){
      localStorage.setItem("userAuthToken",JSON.stringify(response.data));
      navigate('/dashboard',{replace:true});
      setIsLoading(false)
    }


   if(response.status === 400 && response.data.msg === "Invalid credentials"){
       form.setError('email',{type:"manual",message:"'Invalid credentials. Please check your email and password."})
    }
    }catch(err){
         console.log(err);
         form.setError('email',{type:"manual",message:"'Invalid credentials. Please check your email and password."})
        setIsLoading(false)
    }
      
          
}

const handleInputChange = () => {
  form.clearErrors(); // Clears all errors
};
    
   

    

useEffect(()=>{
  const email=field.email?.length!;
    const password=field.password?.length!;
    if(password > 0 && email > 0){
      setDisabled(false)
     }else{
      setDisabled(true)
     }
 },[field,disabled])
    
  
console.log(errors && errors.message)


    return (
          <Form {...form}>
           <RouterForm onSubmit={form.handleSubmit(onSubmit)}   className="w-full relative m-auto max-w-sm   h-fit flex rounded-md leading-7 justify-center  py-9  lg:py-5  space-y-5 flex-col bg-white shadow-3xl shadow-[#145sd44] px-4 ">
           <div  className="w-[150px] h-[150px] m-auto flex justify-center items-center flex-col ">
           <div style={{backgroundImage:`url(	https://my.lunchmoney.app/5cc2e62c644a5ab9d2ac.png)`,backgroundRepeat:"no-repeat",backgroundSize:"contain"}} className="circle w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] flex justify-center  rounded-full relative  top-0 animate-logo-bounce "></div>
           <div  className="w-[50px] opacity-[0.5] h-[10px] animate-shadow-move   bg-black rounded-[80%] mt-5"></div>
           </div>
           <h1 className="text-center prose prose-h1:text-lg text-xl md:text-2xl lg:text-5xl">Welcome Back!!</h1>
           {form.formState.errors && form.formState.errors.email?.type === "manual" && <span className="text-white text-center bg-red-600 px-3 rounded-md">{form.formState.errors.email.message}</span>}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-red-600 after:ml-2">EMAIL</FormLabel>
              <FormControl >
                <Input   {...field} onChange={(e)=>{
                  field.onChange(e);
                  handleInputChange()
                }}/>
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
                <Input type="password"  {...field} />
              </FormControl>
            <FormMessage/>
            </FormItem>
          )}
        />
          <div  className="relative py-2 ">
          <button className=" text-right  absolute min-w-[45px] right-0 text-sm justify-end flex">Forgot password?</button>
          </div>
          <Button className="w-full bg-orange-400 p-2 mt-2 rounded-full" type="submit"  disabled={disabled || isLoading}>
          { isLoading  ? "loading...":"LOGIN"}
         </Button>
            
         
          
           </RouterForm>
           </Form>
       
    )
}


export default LoginPage;
