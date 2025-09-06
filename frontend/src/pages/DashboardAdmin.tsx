
import { useAuth } from '../auth';

export default function DashboardAdmin() {
    const { me } = useAuth();

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 640, margin: '2rem auto' }}>
                <h2>Dashboard (Admin)</h2>
                <p>Hola {me?.email}</p>
                <p>Usa la barra de navegación para moverte.</p>
            </div>
        </div>
    );
}
