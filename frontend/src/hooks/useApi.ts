import { useAuth } from '../auth';

export function useApi() {
    const { token, logout } = useAuth();

    const call = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
        const res = await fetch(input, {
            ...init,
            headers: {
                ...(init?.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (res.status === 401) {
            logout();
            throw new Error('Sesión caducada. Vuelve a iniciar sesión.');
        }
        if (!res.ok) {
            let msg = `Error ${res.status}`;
            try {
                const j = await res.json();
                msg = j?.detail || msg;
            } catch {}
            throw new Error(msg);
        }
        return res.json();
    };

    return { call };
}
