import { useEffect, useMemo, useState } from 'react'

type TokenResponse = {
    access_token: string
    token_type: 'bearer'
}

type MeResponse = {
    id: number
    email: string
    is_active: boolean
}

function App() {
    // Base del backend desde .env (Vite expone variables VITE_*)
    const API_BASE = useMemo(() => import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '', [])
    const API = useMemo(() => `${API_BASE}/api`, [API_BASE])

    const [health, setHealth] = useState('...')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '')
    const [me, setMe] = useState<MeResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<string>('')

    // Healthcheck
    useEffect(() => {
        fetch(`${API}/health`)
            .then(r => r.json())
            .then(d => setHealth(d.status ?? 'unknown'))
            .catch(() => setHealth('error'))
    }, [API])

    const register = async () => {
        setMsg('')
        setLoading(true)
        try {
            const res = await fetch(`${API}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            if (res.ok) {
                const body = await res.json()
                setMsg(`✅ Registrado: ${body.email}`)
            } else if (res.status === 409) {
                setMsg('⚠️ El email ya está registrado')
            } else if (res.status === 422) {
                setMsg('⚠️ Datos inválidos (revisa email y contraseña)')
            } else {
                const text = await res.text()
                setMsg(`❌ Error al registrar (${res.status}): ${text}`)
            }
        } catch (e) {
            setMsg('❌ Error de red al registrar')
        } finally {
            setLoading(false)
        }
    }

    const login = async () => {
        setMsg('')
        setLoading(true)
        try {
            const form = new URLSearchParams()
            form.append('username', email.trim())
            form.append('password', password)

            const res = await fetch(`${API}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: form.toString(),
            })

            const data: Partial<TokenResponse> = await res.json().catch(() => ({}))
            if (!res.ok || !data.access_token) {
                setToken('')
                localStorage.removeItem('token')
                setMsg('❌ Credenciales incorrectas')
                return
            }

            setToken(data.access_token)
            localStorage.setItem('token', data.access_token)
            setMsg('✅ Login exitoso')
        } catch {
            setMsg('❌ Error de red al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    const fetchMe = async () => {
        setMsg('')
        setLoading(true)
        setMe(null)
        try {
            if (!token) {
                setMsg('ℹ️ No hay token. Inicia sesión primero.')
                return
            }
            const res = await fetch(`${API}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const text = await res.text()
                setMsg(`❌ Error /me (${res.status}): ${text}`)
                return
            }
            const data: MeResponse = await res.json()
            setMe(data)
            setMsg('✅ Token válido')
        } catch {
            setMsg('❌ Error de red al consultar /me')
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setToken('')
        localStorage.removeItem('token')
        setMe(null)
        setMsg('🔒 Sesión cerrada')
    }

    return (
        <div style={{ maxWidth: 520, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Babel</h1>
            <p>
                <b>API:</b> {API || '(no VITE_API_BASE)'} — <b>health:</b> {health}
            </p>

            <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                <input
                    placeholder="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <input
                    placeholder="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={register} disabled={loading}>Register</button>
                    <button onClick={login} disabled={loading}>Login</button>
                    <button onClick={fetchMe} disabled={loading || !token}>/me</button>
                    <button onClick={logout} disabled={loading || !token}>Logout</button>
                </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 14 }}>
                <p><b>Token:</b> {token ? token.slice(0, 24) + '…' : '(no login)'}</p>
                {me && (
                    <p><b>Me:</b> {me.email} (id: {me.id}, activo: {String(me.is_active)})</p>
                )}
                {msg && <p>{msg}</p>}
            </div>
        </div>
    )
}

export default App
