import React from "react";
import ResetPassword from "./components/ResetPassword";

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
          <ResetPassword />
          <p className="text-center text-sm text-muted-foreground mt-8">
            © 2026 JAYABIMA. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
