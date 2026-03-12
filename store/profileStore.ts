import { User } from "@/types/user.types";


interface ProfileState {
    profile: User | null;
    isLoading: boolean;
    isSubmitting: boolean;
}