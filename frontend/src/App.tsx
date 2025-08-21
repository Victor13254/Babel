import { useEffect, useState } from 'react'


function App() {
    const [health, setHealth] = useState('...')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [token, setToken] = useState('')


    useEffect(() => {
        fetch('/api/health')
            .then(r => r.json())
            .then(d => setHealth(d.status))
            .catch(() => setHealth('error'))
    }, [])


    const register = async () => {
        await fetch('/api/users/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        })
    }


    const login = async () => {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString()
        })
        const data = await res.json()
        setToken(data.access_token || '')
    }


    return (
        <div>
            <h1>Babel</h1>
            <p>API health: {health}</p>
            <div>
                <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                <button onClick={register}>Register</button>
                <button onClick={login}>Login</button>
            </div>
            <p>Token: {token ? token.slice(0, 20) + '...' : '(no login)'}</p>
        </div>
    )
}


export default App