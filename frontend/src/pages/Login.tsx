import { type FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import "../css/login.css"; // ⬅️ importa los estilos del login

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);
        try {
            const me = await login(email, password); // MeResponse
            nav(me.role === "admin" ? "/dashboard/admin" : "/dashboard/user", { replace: true });
        } catch (err: any) {
            setMsg(err?.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero-bg auth-bg">
            <main className="auth-container">
                <header className="auth-header">
                    <h1 className="hero-title">BABEL</h1>
                    <p className="hero-subtitle">Bienvenido de vuelta <span></span></p>
                </header>

                <section className="glow-card">
                    <div className="glow-border" aria-hidden="true" />
                    <div className="glow-sheen" aria-hidden="true" />

                    <form className="auth-form" onSubmit={onSubmit} autoComplete="on" noValidate>
                        <h2 className="auth-title">Iniciar sesión</h2>

                        <label className="auth-field">
                            <span>Email</span>
                            <input
                                type="email"
                                inputMode="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label className="auth-field">
                            <span>Contraseña</span>
                            <div className="pwd-wrap">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="pwd-toggle"
                                    onClick={() => setShowPwd((v) => !v)}
                                    aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPwd ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </label>

                        {msg && <p className="auth-msg" role="alert">{msg}</p>}

                        <div className="auth-actions">
                            <Link to="/" className="btn ghost" aria-label="Volver al inicio">Volver</Link>
                            <button className="btn glow" type="submit" disabled={loading}>
                                {loading ? "Ingresando…" : "Entrar"}
                            </button>
                        </div>

                        <p className="auth-alt">
                            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
                        </p>
                    </form>
                </section>
            </main>
        </div>
    );
}
