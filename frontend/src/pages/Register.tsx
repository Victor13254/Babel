import {type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../api.ts';


export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);


    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            const data = await registerApi(email, password);
            setMsg(`✅ Registro exitoso para ${data.email}`);
        } catch (err: any) {
            setMsg(`❌ ${err?.message || 'Error en registro'}`);
        } finally { setLoading(false); }
    };


    return (
        <div style={{ maxWidth: 420, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Register</h2>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
                <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
                <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" />
                <div style={{ display:'flex', gap: 8 }}>
                    <Link to="/"><button type="button">Volver</button></Link>
                    <button type="submit" disabled={loading}>Registro</button>
                </div>
            </form>
            {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
            <p style={{ marginTop: 12 }}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
    );
}