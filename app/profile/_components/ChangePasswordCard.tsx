import { useProfileStore } from "@/store/profileStore";
import { useState } from "react";

export default function ChangePasswordCard() {
  const { changePassword, isSubmitting } = useProfileStore();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setErrors({ confirmPassword: "" });
     if (formData.newPassword !== formData.confirmPassword) {
       setErrors({ confirmPassword: "Passwords don't match" });
       return;
     }
     const success = await changePassword(formData);
  }
}
