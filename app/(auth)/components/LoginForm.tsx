import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({
        email,
        password,
        rememberMe,
      });
      if (result.success) {
        // Success! Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Show error message
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
    } finally {
        setIsLoading(false);
    }
  };
  return <></>;
};

export default LoginForm;
