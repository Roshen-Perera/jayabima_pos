import { User } from "@/types/user.types";


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

}