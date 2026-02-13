import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React from "react";

const UserMenu = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  return <div>UserMenu</div>;
};

export default UserMenu;
