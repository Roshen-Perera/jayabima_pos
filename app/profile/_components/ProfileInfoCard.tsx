import { useProfileStore } from "@/store/profileStore";
import { User } from "@/types/user.types";

interface ProfileInfoCardProps {
  user: User;
}

export default function ProfileInfoCard({ user }: ProfileInfoCardProps) {
    const { updateProfile, isSubmitting } = useProfileStore();
}