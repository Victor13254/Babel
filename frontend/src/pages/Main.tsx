import { Link } from 'react-router-dom';


export default function Main() {
    return (
        <div style={{ maxWidth: 420, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Babel</h1>
            <p style={{ opacity: 0.8 }}>Bienvenido. Elige una opción:</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Link to="/login"><button>LOGIN</button></Link>
                <Link to="/register"><button>REGISTER</button></Link>
            </div>
        </div>
    );
}