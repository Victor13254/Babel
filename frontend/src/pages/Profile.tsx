import { useEffect, useMemo, useState } from 'react';
import { endpoints, type Profile } from '../api';
import { useApi } from '../hooks/useApi';
import {useAuth} from "../auth.tsx";

type Editable = Omit<Profile, 'user_id'>;

export default function ProfilePage() {
    const { call } = useApi();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [edit, setEdit] = useState<Editable | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const { me } = useAuth();

    useEffect(() => {
        setLoading(true);
        call<Profile>(endpoints.getMyProfile())
            .then(p => { setProfile(p); setEdit(null); })
            .catch(e => setMsg(String(e.message || e)))
            .finally(() => setLoading(false));
    }, []);

    // diff: solo campos cambiados
    const changes = useMemo(() => {
        if (!profile || !edit) return {};
        const diff: Partial<Editable> = {};
        (['display_name','native_lang','target_lang','target_level','avatar_url','preferences'] as const)
            .forEach(k => {
                const a = (profile as any)[k];
                const b = (edit as any)[k];
                // Comparación simple (si usas objetos en preferences, puedes JSON.stringify)
                const same = typeof a === 'object' ? JSON.stringify(a||null) === JSON.stringify(b||null) : (a || '') === (b || '');
                if (!same) (diff as any)[k] = b;
            });
        return diff;
    }, [profile, edit]);

    const isDirty = useMemo(() => Object.keys(changes).length > 0, [changes]);

    const onEdit = () => {
        if (!profile) return;
        setEdit({
            display_name: profile.display_name || '',
            native_lang: profile.native_lang || '',
            target_lang: profile.target_lang || '',
            target_level: profile.target_level || '',
            avatar_url: profile.avatar_url || '',
            preferences: profile.preferences ?? {},
        });
        setMsg('');
    };

    const onCancel = () => { setEdit(null); setMsg(''); };

    const onSave = async () => {
        if (!isDirty) { setMsg('No hay cambios para guardar'); return; }
        try {
            setLoading(true);
            const res = await call<Profile>(endpoints.updateMyProfile(), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes), // 👈 solo cambios
            });
            setProfile(res);
            setEdit(null);
            setMsg('✅ Guardado');
        } catch (e: any) {
            setMsg(String(e.message || 'Error al guardar'));
        } finally { setLoading(false); }
    };

    if (loading && !profile) return <div style={{ padding: 24 }}>Cargando perfil…</div>;

    return (
        <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Mi Perfil</h2>
            {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'crimson' }}>{msg}</p>}

            {!profile ? (
                <p>No se pudo cargar el perfil.</p>
            ) : edit ? (
                // MODO EDICIÓN
                <div style={{ display: 'grid', gap: 8 }}>
                    <label>
                        <div>Nombre visible</div>
                        <input
                            value={edit.display_name ?? ''}
                            onChange={e => setEdit({ ...(edit as Editable), display_name: e.target.value })}
                        />
                    </label>
                    <label>
                        <div>Idioma nativo (es,en,fr…)</div>
                        <input
                            value={edit.native_lang ?? ''}
                            onChange={e => setEdit({ ...(edit as Editable), native_lang: e.target.value })}
                        />
                    </label>
                    <label>
                        <div>Idioma objetivo (es,en,fr…)</div>
                        <input
                            value={edit.target_lang ?? ''}
                            onChange={e => setEdit({ ...(edit as Editable), target_lang: e.target.value })}
                        />
                    </label>
                    <label>
                        <div>Nivel (A1..C2)</div>
                        <input
                            value={edit.target_level ?? ''}
                            onChange={e => setEdit({ ...(edit as Editable), target_level: e.target.value })}
                        />
                    </label>
                    <label>
                        <div>Avatar URL (opcional)</div>
                        <input
                            value={edit.avatar_url ?? ''}
                            onChange={e => setEdit({ ...(edit as Editable), avatar_url: e.target.value })}
                        />
                    </label>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={onCancel} type="button">Cancelar</button>
                        <button onClick={onSave} disabled={!isDirty || loading} type="button">
                            {loading ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>

                    {!isDirty && <small style={{ opacity: 0.7 }}>No hay cambios</small>}
                </div>
            ) : (
                // MODO LECTURA
                <div style={{ display: 'grid', gap: 6 }}>
                    <div><b>Email:</b> {me?.email} <i></i></div>
                    <div><b>Nombre visible:</b> {profile.display_name || '—'}</div>
                    <div><b>Nativo:</b> {profile.native_lang || '—'}</div>
                    <div><b>Objetivo:</b> {profile.target_lang || '—'}</div>
                    <div><b>Nivel:</b> {profile.target_level || '—'}</div>
                    <div>
                        <b>Avatar:</b>{" "}
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="avatar"
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    verticalAlign: "middle",
                                    marginLeft: 8,
                                }}
                            />
                        ) : (
                            "—"
                        )}
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <button onClick={onEdit}>Editar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
