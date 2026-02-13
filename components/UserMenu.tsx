import { alert } from "@/lib/alert";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const UserMenu = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

    const handleLogout = async () => {
      setIsLoggingOut(true);

      try {
        await logout();
        alert.success("Logged out", "You have been successfully logged out.");
        router.push("/login");
      } catch (error) {
        alert.error("Logout failed", "Something went wrong. Please try again.");
        console.error("Logout error:", error);
      } finally {
        setIsLoggingOut(false);
      }
    };
  return <div>UserMenu</div>;
};

export default UserMenu;
