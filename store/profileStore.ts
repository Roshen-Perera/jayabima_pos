import { User } from "@/types/user.types";
import { create } from "zustand";


interface ProfileState {
    profile: User | null;
    isLoading: boolean;
    isSubmitting: boolean;

    fetchProfile: () => Promise<void>;
    updateProfile: (data: {
        name: string;
        email: string;
        phone?: string;
    }) => Promise<boolean>;
    changePassword: (data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    isLoading: false,
    isSubmitting: false,

}));