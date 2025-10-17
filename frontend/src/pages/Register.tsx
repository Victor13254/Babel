import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { registerApi, type RegisterFullPayload } from "../api";
import "../css/register.css";

type RegisterPayload = {
    firstName: string;
    lastName: string;
    username: string;
    age: number | "";
    country: string;
    nativeLang: string;
    targetLang: string;
    level: "A1"|"A2"|"B1"|"B2"|"C1"|"C2";
    dailyGoalMin: number | "";
    email: string;
    password: string;
    acceptTerms: boolean;
};

const COUNTRIES = ["Colombia","México","España","Argentina","Perú","Chile","EE.UU.","Otro"];
const LANGS = ["Español","Inglés","Francés","Alemán","Italiano","Portugués","Japonés","Coreano","Chino"];
const LEVELS = ["A1","A2","B1","B2","C1","C2"] as const;

export default function Register() {
    const [form, setForm] = useState<RegisterPayload>({
        firstName: "",
        lastName: "",
        username: "",
        age: "",
        country: "Colombia",
        nativeLang: "Español",
        targetLang: "Inglés",
        level: "A1",
        dailyGoalMin: 20,
        email: "",
        password: "",
        acceptTerms: false,
    });

    const [pwd2, setPwd2] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Fortaleza de contraseña
    const strength = useMemo(() => {
        const pwd = form.password;
        let s = 0;
        if (pwd.length >= 8) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[a-z]/.test(pwd)) s++;
        if (/\d/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        return Math.min(100, Math.round((s / 5) * 100));
    }, [form.password]);

    const strengthLabel = useMemo(() => {
        if (strength >= 80) return "Fuerte";
        if (strength >= 60) return "Media";
        if (strength > 0)  return "Débil";
        return "—";
    }, [strength]);

    function update<K extends keyof RegisterPayload>(key: K, val: RegisterPayload[K]) {
        setForm(prev => ({ ...prev, [key]: val }));
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMsg("");

        // Validaciones básicas
        if (!form.firstName || !form.lastName) return setMsg("❌ Ingresa nombre y apellidos");
        if (!form.username || form.username.length < 3) return setMsg("❌ Usuario mínimo 3 caracteres");
        if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) return setMsg("❌ Email no válido");
        if (!form.password || form.password.length < 8) return setMsg("❌ Contraseña mínimo 8 caracteres");
        if (form.password !== pwd2) return setMsg("❌ Las contraseñas no coinciden");
        if (form.age === "" || Number(form.age) < 13 || Number(form.age) > 120) return setMsg("❌ Edad entre 13 y 120");
        if (form.dailyGoalMin === "" || Number(form.dailyGoalMin) < 5 || Number(form.dailyGoalMin) > 180)
            return setMsg("❌ Objetivo diario entre 5 y 180 minutos");
        if (!form.acceptTerms) return setMsg("❌ Debes aceptar Términos y Privacidad");

        const payload: RegisterFullPayload = {
            email: form.email,
            password: form.password,
            first_name: form.firstName,
            last_name: form.lastName,
            username: form.username,
            age: Number(form.age),
            country: form.country,
            native_lang: form.nativeLang,
            target_lang: form.targetLang,
            level: form.level,
            daily_goal_min: Number(form.dailyGoalMin),
            accept_terms: form.acceptTerms,
        };

        setLoading(true);
        try {
            const data = await registerApi(payload);
            setMsg(`✅ Registro exitoso para ${data.email}`);
        } catch (err: any) {
            setMsg(`❌ ${err?.message || "Error en registro"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero-bg auth-bg">
            <main className="auth-container">
                <header className="auth-header">
                    <h1 className="hero-title">BABEL</h1>
                    <p className="hero-subtitle">Crea tu cuenta <span>⚡</span></p>
                </header>

                <section className="glow-card">
                    <div className="glow-border" aria-hidden="true" />
                    <div className="glow-sheen" aria-hidden="true" />

                    <form className="auth-form" onSubmit={onSubmit} autoComplete="on" noValidate>
                        <h2 className="auth-title">Registro</h2>

                        {/* Datos personales */}
                        <div className="grid-2">
                            <label className="auth-field">
                                <span>Nombre</span>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={form.firstName}
                                    onChange={(e) => update("firstName", e.target.value)}
                                    autoComplete="given-name"
                                    required
                                />
                            </label>
                            <label className="auth-field">
                                <span>Apellidos</span>
                                <input
                                    type="text"
                                    placeholder="Apellidos"
                                    value={form.lastName}
                                    onChange={(e) => update("lastName", e.target.value)}
                                    autoComplete="family-name"
                                    required
                                />
                            </label>
                        </div>

                        <div className="grid-2">
                            <label className="auth-field">
                                <span>Usuario</span>
                                <input
                                    type="text"
                                    placeholder="usuario"
                                    value={form.username}
                                    onChange={(e) => update("username", e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </label>

                            <label className="auth-field">
                                <span>Edad</span>
                                <input
                                    type="number"
                                    min={13}
                                    max={120}
                                    placeholder="18"
                                    value={form.age}
                                    onChange={(e) => update("age", e.target.value === "" ? "" : Number(e.target.value))}
                                    inputMode="numeric"
                                    required
                                />
                            </label>
                        </div>

                        <div className="grid-2">
                            <label className="auth-field">
                                <span>País</span>
                                <select
                                    value={form.country}
                                    onChange={(e) => update("country", e.target.value)}
                                >
                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </label>

                            <label className="auth-field">
                                <span>Objetivo diario (min)</span>
                                <input
                                    type="number"
                                    min={5}
                                    max={180}
                                    placeholder="20"
                                    value={form.dailyGoalMin}
                                    onChange={(e) => update("dailyGoalMin", e.target.value === "" ? "" : Number(e.target.value))}
                                    inputMode="numeric"
                                />
                            </label>
                        </div>

                        {/* Idiomas */}
                        <div className="grid-2">
                            <label className="auth-field">
                                <span>Idioma nativo</span>
                                <select
                                    value={form.nativeLang}
                                    onChange={(e) => update("nativeLang", e.target.value)}
                                >
                                    {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </label>

                            <label className="auth-field">
                                <span>Idioma objetivo</span>
                                <select
                                    value={form.targetLang}
                                    onChange={(e) => update("targetLang", e.target.value)}
                                >
                                    {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </label>
                        </div>

                        <label className="auth-field">
                            <span>Nivel actual</span>
                            <div className="level-row">
                                {LEVELS.map(lvl => (
                                    <label key={lvl} className={`pill ${form.level === lvl ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="level"
                                            value={lvl}
                                            checked={form.level === lvl}
                                            onChange={() => update("level", lvl)}
                                        />
                                        {lvl}
                                    </label>
                                ))}
                            </div>
                        </label>

                        {/* Credenciales */}
                        <label className="auth-field">
                            <span>Email</span>
                            <input
                                type="email"
                                inputMode="email"
                                placeholder="tu@correo.com"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
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
                                    value={form.password}
                                    onChange={(e) => update("password", e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="pwd-toggle"
                                    onClick={() => setShowPwd(v => !v)}
                                    aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPwd ? "🙈" : "👁️"}
                                </button>
                            </div>

                            {/* Fortaleza */}
                            <div className="pwd-strength" aria-hidden={form.password.length === 0}>
                                <div className="bar" style={{ width: `${strength}%` }} />
                                <span className="label">{strengthLabel}</span>
                            </div>
                        </label>

                        <label className="auth-field">
                            <span>Confirmar contraseña</span>
                            <div className="pwd-wrap">
                                <input
                                    type={showPwd2 ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={pwd2}
                                    onChange={(e) => setPwd2(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="pwd-toggle"
                                    onClick={() => setShowPwd2(v => !v)}
                                    aria-label={showPwd2 ? "Ocultar confirmación" : "Mostrar confirmación"}
                                >
                                    {showPwd2 ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </label>

                        {/* Términos */}
                        <label className="terms-row">
                            <input
                                type="checkbox"
                                checked={form.acceptTerms}
                                onChange={(e) => update("acceptTerms", e.target.checked)}
                                required
                            />
                            <span>Acepto los <a href="#" rel="noopener noreferrer">Términos</a> y la <a href="#" rel="noopener noreferrer">Política de Privacidad</a>.</span>
                        </label>

                        {msg && <p className="auth-msg" role="alert">{msg}</p>}

                        <div className="auth-actions">
                            <Link to="/" className="btn ghost">Volver</Link>
                            <button className="btn glow" type="submit" disabled={loading}>
                                {loading ? "Creando…" : "Crear cuenta"}
                            </button>
                        </div>

                        <p className="auth-alt">
                            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                        </p>
                    </form>
                </section>
            </main>
        </div>
    );
}
