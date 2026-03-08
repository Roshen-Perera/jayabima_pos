import { User } from "./user.types";

export type { User };

export interface UpdateProfileData {
    name: string;
    email: string;
    phone?: string;
}