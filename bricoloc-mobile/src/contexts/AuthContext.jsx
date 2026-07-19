import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import Storage from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await Storage.getItem('auth_token');
            if (token) {
                const res = await authAPI.getProfile();
                if (res.data.success) {
                    setUser(res.data.user);
                } else {
                    await Storage.removeItem('auth_token');
                    await Storage.removeItem('user_data');
                }
            }
        } catch {
            await Storage.removeItem('auth_token');
            await Storage.removeItem('user_data');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const data = res.data;
        if (data.success) {
            await Storage.setItem('auth_token', data.token);
            await Storage.setItem('user_data', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, user: data.user };
        }
        return { success: false, message: data.message };
    };

    const register = async (payload) => {
        const res = await authAPI.register(payload);
        const data = res.data;
        if (data.success) {
            await Storage.setItem('auth_token', data.token);
            await Storage.setItem('user_data', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, user: data.user };
        }
        return { success: false, errors: data.errors, message: data.message };
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch {}
        await Storage.removeItem('auth_token');
        await Storage.removeItem('user_data');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await authAPI.getProfile();
            if (res.data.success) {
                setUser(res.data.user);
                await Storage.setItem('user_data', JSON.stringify(res.data.user));
            }
        } catch {}
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            user: null,
            loading: false,
            login: async () => ({ success: false }),
            register: async () => ({ success: false }),
            logout: () => {},
            refreshUser: async () => {},
        };
    }
    return context;
}
