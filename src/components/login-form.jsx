"use client";
import { redirect } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCookie, createCookieToken, login, signup } from '@/app/action';

export function LoginForm({
  className,
  ...props
}) {

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    const promises = [createCookieToken(), createCookie(JSON.stringify(data))];
    login(data).then((res) => {
      console.log("res => ", res);
      if (res.error) {
        console.log("Invalid credentials");
        alert("Invalid credentials");
        return;
      }
      Promise.all(promises).then(() => {
        redirect('/');
      });
    }).catch((error) => {
      console.log(error);
    });
  };
  // console.log(errors);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome To TODO AI Agent</CardTitle>
          <CardDescription>
            Login with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required
                  {...register("email", {required: true, pattern: /^\S+@\S+$/i})} />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" required {...register("password", {required: true})}  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a className="underline underline-offset-4 cursor-pointer" onClick={() => redirect('/signup')}>
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
