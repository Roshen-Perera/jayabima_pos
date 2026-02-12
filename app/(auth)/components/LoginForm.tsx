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
  return <></>;
};

export default LoginForm;
