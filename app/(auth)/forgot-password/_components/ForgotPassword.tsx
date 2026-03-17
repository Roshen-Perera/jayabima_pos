import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { alert } from "@/lib/alert";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert.error("Email required", "Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        alert.success(
          "Email sent!",
          "Check your email for password reset instructions",
        );
      } else {
        alert.error("Failed", data.message || "Could not send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      alert.error("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent password reset instructions to{" "}
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>What&apos;s next?</strong>
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside mt-2">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the reset password link</li>
                <li>Create a new password</li>
                <li>Login with your new password</li>
              </ul>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            No worries! Enter your email and we&apos;ll send you reset instructions
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
