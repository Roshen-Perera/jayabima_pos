import { Card } from "@/components/ui/card";
import { useProfileStore } from "@/store/profileStore";
import { User } from "@/types/user.types";
import { useState } from "react";

interface ProfileInfoCardProps {
  user: User;
}

export default function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const { updateProfile, isSubmitting } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  });

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
    });
    if (success) {
      setIsEditing(false);
    }
  }

  return (
    <Card></Card>
  )
}
