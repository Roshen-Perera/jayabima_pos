import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, RegisterData, AuthResponse, AuthUser } from '@/types/auth.types';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user: AuthUser | null) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                });
            },

            login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                    });
                    const data = await response.json();
                    if (data.success && data.user) {
                        set({
                            user: data.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
                    return data;
                } catch (error) {
                    console.error('Login error:', error);
                    return {
                        success: false,
                        message: 'An error occurred during login',
                    };
                }
            },
            register: async (registerData: RegisterData): Promise<AuthResponse> => {
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(registerData),
                    });
                    const data = await response.json();
                    if (data.success && data.user) {
                        set({
                            user: data.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
                    return data;
                } catch (error) {
                    console.error('Register error:', error);
                    return {
                        success: false,
                        message: 'An error occurred during registration',
                    };
                }
            },
            logout: async () => {
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                    });
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
            },
            checkAuth: async () => {
                try {
                    set({ isLoading: true });
                } catch (error) {

                }
            }
        })
    )

)