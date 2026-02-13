"use client"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { alert } from "@/lib/alert";
import { useAuthStore } from "@/store/useAuthStore";
import { Label } from "@radix-ui/react-label";
import {
  AlertCircle,
  Mail,
  EyeOff,
  Eye,
  Loader2,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  MailIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";

const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login({
        email,
        password,
        rememberMe,
      });
      if (result.success) {
        alert.success(
          "Login successful!",
          `Welcome back, ${result.user?.name || "User"}!`,
        );
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
       alert.error(
         "Login failed",
         result.message || "Invalid email or password. Please try again.",
       );
      }
    } catch (error) {
      alert.error(
        "Something went wrong",
        "An unexpected error occurred. Please try again later.",
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@jayabima.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <a
                href="#forgot-password"
                className="text-sm text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </a>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-5">
            {/* Login Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="#register"
                className="text-primary font-medium hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Sign up
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </>
  );
};

export default LoginForm;
