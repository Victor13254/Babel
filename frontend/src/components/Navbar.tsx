import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Navbar() {
    const { me, logout } = useAuth();
    const nav = useNavigate();

    const onLogout = () => {
        logout();
        nav('/', { replace: true });
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            background: '#222',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div>

                <Link to={me?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
                    Babel
                </Link>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Perfil</Link>
                <Link to="/community" style={{ color: '#fff', textDecoration: 'none' }}>Comunidad</Link>
                {me?.role === 'admin' && (
                    <>
                        <Link to="/admin/courses" style={{ color: '#fff', textDecoration: 'none' }}>Cursos (Admin)</Link>
                        <Link to="/dashboard/admin" style={{ color: '#fff', textDecoration: 'none' }}>Admin</Link>
                    </>
                )}
                {me?.role === 'user' && (
                    <>
                        <Link to="/courses" style={{ color: '#fff', textDecoration: 'none' }}>Cursos</Link>
                        <Link to="/dashboard/user" style={{ color: '#fff', textDecoration: 'none' }}>User</Link>
                    </>
                )}
                <button onClick={onLogout} style={{ background: 'crimson', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: 4 }}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
