import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, meApi, type MeResponse } from './api.ts';


interface AuthContextType {
    token: string;
    me: MeResponse | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<MeResponse>;
    logout: () => void;
    refreshMe: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '');
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(false);


    const logout = () => {
        setToken('');
        localStorage.removeItem('token');
        setMe(null);
    };


    const refreshMe = async () => {
        if (!token) { setMe(null); return; }
        try {
            setLoading(true);
            const data = await meApi(token);
            setMe(data);
        } catch {
            logout();
        } finally { setLoading(false); }
    };


    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const t = await loginApi(email, password);
            setToken(t);
            localStorage.setItem('token', t);
            await refreshMe();
            const data = await meApi(t);
            setMe(data);
            return data;
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (token) refreshMe();
    }, []);


    const value = useMemo(() => ({ token, me, loading, login, logout, refreshMe }), [token, me, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}