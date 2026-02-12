import { AuthResponse, AuthUser, LoginCredentials } from '@/types/auth.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
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
                        credentials: 'include', // ⭐ Important for cookies
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

            logout: async () => {
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include', // ⭐ Important for cookies
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

                    const response = await fetch('/api/auth/my-account', {
                        credentials: 'include', // ⭐ Important for cookies
                    });

                    const data = await response.json();

                    if (data.success && data.user) {
                        set({
                            user: data.user,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        // ⭐ Auth failed - clear everything
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                        });
                    }
                } catch (error) {
                    console.error('Check auth error:', error);
                    // ⭐ Error checking auth - clear everything
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);