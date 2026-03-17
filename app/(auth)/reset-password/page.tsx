import { Card } from "@/components/ui/card";
import { alert } from "@/lib/alert";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [errors, setErrors] = useState({
    confirmPassword: "",
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      alert.error("Invalid Link", "This password reset link is invalid");
      return;
    }

    // Token exists, assume valid (backend will verify on submit)
    setIsValidToken(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ confirmPassword: "" });
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert.success(
          "Password Reset",
          "Your password has been reset successfully",
        );
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        if (
          data.message.includes("expired") ||
          data.message.includes("invalid")
        ) {
          setIsValidToken(false);
        }
        alert.error("Reset Failed", data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert.error("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === false) {
    return <Card className="w-full max-w-md"></Card>;
  }
}
