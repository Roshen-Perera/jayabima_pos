import React from "react";
import LoginForm from "../components/LoginForm";

export const metadata = {
  title: "Login | JAYABIMA POS",
  description: "Sign in to your JAYABIMA POS account",
};

const page = () => {
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              JAYABIMA POS
            </h1>
            <p className="text-muted-foreground">
              Point of Sale Management System
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default page;
