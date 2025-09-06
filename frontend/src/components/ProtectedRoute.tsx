import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function ProtectedRoute({
                                           role,
                                           children,
                                       }: {
    role: 'user' | 'admin';
    children: React.ReactNode;
}) {
    const { me, loading } = useAuth();

    if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;
    if (!me) return <Navigate to="/login" replace />;

    // user: cualquier autenticado; admin: solo admin
    if (role === 'admin' && me.role !== 'admin') return <Navigate to="/dashboard/user" replace />;

    return <>{children}</>;
}
