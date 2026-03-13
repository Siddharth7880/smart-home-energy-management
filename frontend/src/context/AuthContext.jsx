import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check persistent storage first (rememberMe was checked), then session-only storage
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch { /* ignore corrupt data */ }
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData, rememberMe = false) => {
        // userData will contain: accessToken, id, username, email, roles
        if (rememberMe) {
            // Persist across browser restarts
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('user');
        } else {
            // Session only – cleared when the tab/browser closes
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('user');
        }
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
    }, []);

    const isAdmin = useCallback(() => {
        return user?.roles?.includes('ROLE_ADMIN');
    }, [user]);

    const isTechnician = useCallback(() => {
        return user?.roles?.includes('ROLE_TECHNICIAN');
    }, [user]);

    const isHomeowner = useCallback(() => {
        return user?.roles?.includes('ROLE_HOMEOWNER');
    }, [user]);

    const value = useMemo(() => ({
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        isAdmin: isAdmin(),
        isTechnician: isTechnician(),
        isHomeowner: isHomeowner(),
        roles: user?.roles || []
    }), [user, login, logout, loading, isAdmin, isTechnician, isHomeowner]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
