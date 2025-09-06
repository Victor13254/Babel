import {type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';


export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);


    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            const me = await login(email, password);  // 👈 recibes MeResponse
            nav(me.role === 'admin' ? '/dashboard/admin' : '/dashboard/user', { replace: true });
        } catch (err: any) {
            setMsg(err?.message || 'Error al iniciar sesión');
        } finally { setLoading(false); }
    };


    return (
        <div style={{ maxWidth: 420, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Login</h2>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
                <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
                <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
                <div style={{ display:'flex', gap: 8 }}>
                    <Link to="/"><button type="button">Volver</button></Link>
                    <button type="submit" disabled={loading}>Login</button>
                </div>
            </form>
            {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
            <p style={{ marginTop: 12 }}>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
    );
}