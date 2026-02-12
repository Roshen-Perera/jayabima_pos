import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React from "react";

const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  return <></>;
};

export default LoginForm;
