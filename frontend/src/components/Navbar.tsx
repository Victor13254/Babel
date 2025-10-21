import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import '../css/navbar.css';

export default function Navbar() {
    const { me, logout } = useAuth();
    const nav = useNavigate();

    const onLogout = () => {
        logout();
        nav('/', { replace: true });
    };

    return (
        <nav className="navbar">
            <div>
                <Link
                    to={me?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'}
                    className="nav-logo"
                >
                    BABEL
                </Link>
            </div>

            <div className="nav-links">
                <Link to="/profile" className="nav-link">Perfil</Link>
                <Link to="/community" className="nav-link">Comunidad</Link>

                {me?.role === 'admin' && (
                    <>
                        <Link to="/admin/courses" className="nav-link">Cursos (Admin)</Link>
                        <Link to="/dashboard/admin" className="nav-link">Admin</Link>
                    </>
                )}

                {me?.role === 'user' && (
                    <>
                        <Link to="/courses" className="nav-link">Cursos</Link>
                        <Link to="/dashboard/user" className="nav-link">User</Link>
                    </>
                )}

                <button onClick={onLogout} className="nav-btn">Logout</button>
            </div>
        </nav>
    );
}
