import { alert } from "@/lib/alert";
import { User } from "@/types/user.types";
import { ca } from "zod/v4/locales";
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
        try {
            const response = await fetch('/api/auth/my-account', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                alert.success('Profile updated!', 'Your changes have been saved');
                set({ profile: result.user });
                return true;
            } else {
                alert.error('Update failed', result.message || 'Could not update profile');
                return false;
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert.error('Error', 'Something went wrong');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },

    changePassword: async (data) => {
        set({ isSubmitting: true });
        try {

        } catch (error) {

        } finally {
            
        }
    }
}));