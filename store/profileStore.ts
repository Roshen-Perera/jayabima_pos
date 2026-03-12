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

    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch('/api/auth/my-account', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                set({ profile: data.user });
            } else {
                alert.error('Failed to load profile', data.message || 'Could not fetch profile');
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
            alert.error('Error', 'Something went wrong while fetching profile');
        } finally {
            set({ isLoading: false });
        }
    },

    updateProfile: async (data) => {
        set({ isSubmitting: true });
    }
}));