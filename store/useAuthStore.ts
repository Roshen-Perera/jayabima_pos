import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, RegisterData, AuthResponse, AuthUser } from '@/types/auth.types';

export const useAuthStore = create<AuthState>()(
    persist(
        
    )

)