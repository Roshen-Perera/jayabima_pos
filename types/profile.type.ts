import { User } from "./user.types";

export type { User };

export interface UpdateProfileData {
    name: string;
    email: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ProfileUpdateResponse {
    success: boolean;
    message: string;
    user?: User;
}