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
  const [errors, setErrors] = useState({
    confirmPassword: "",
  });

  const isValidToken = token ? true : false;

  useEffect(() => {
    if (!token) {
      alert.error("Invalid Link", "This password reset link is invalid");
      return;
    }
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
    } catch (error) {}
  };
}
