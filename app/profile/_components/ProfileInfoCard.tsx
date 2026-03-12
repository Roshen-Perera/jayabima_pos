import { useProfileStore } from "@/store/profileStore";
import { User } from "@/types/user.types";
import { useState } from "react";

interface ProfileInfoCardProps {
  user: User;
}

export default function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const { updateProfile, isSubmitting } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
}
