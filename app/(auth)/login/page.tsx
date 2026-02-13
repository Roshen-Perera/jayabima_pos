import React from "react";
import LoginForm from "../components/LoginForm";

export const metadata = {
  title: "Login | JAYABIMA POS",
  description: "Sign in to your JAYABIMA POS account",
};

const page = () => {
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center p-4">
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
          <p className="text-center text-sm text-muted-foreground mt-8">
            © 2026 JAYABIMA. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
