import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState({
        name: 'Utilisateur',
        email: 'user@demo.com',
        role: 'client',
        city: 'Douala',
    });

    const logout = () => {
        setUser(null);
    };

    const login = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            user: { name: 'Visiteur', role: 'client', city: 'Douala' },
            logout: () => {},
            login: () => {},
        };
    }
    return context;
}