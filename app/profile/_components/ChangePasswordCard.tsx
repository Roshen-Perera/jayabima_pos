import { useProfileStore } from "@/store/profileStore";

export default function ChangePasswordCard() {
  const { changePassword, isSubmitting } = useProfileStore();
}
