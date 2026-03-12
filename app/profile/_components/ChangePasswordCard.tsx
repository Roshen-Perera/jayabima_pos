import { useProfileStore } from "@/store/profileStore";
import { useState } from "react";

export default function ChangePasswordCard() {
  const { changePassword, isSubmitting } = useProfileStore();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
}
