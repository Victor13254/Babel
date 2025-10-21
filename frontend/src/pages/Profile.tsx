import { useEffect, useMemo, useState } from 'react';
import { endpoints, type Profile } from '../api';
import { useApi } from '../hooks/useApi';
import {useAuth} from "../auth.tsx";
import '../css/profile.css';

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
        <div className="profile-bg">
            <div className="profile-wrap">
                <h2 className="page-title">Mi Perfil</h2>
                {msg && (
                    <p className={`msg ${msg.startsWith('✅') ? 'ok' : 'bad'}`}>{msg}</p>
                )}

                {!profile ? (
                    <div className="e-card"><div className="e-inner">No se pudo cargar el perfil.</div></div>
                ) : edit ? (
                    /* ===== MODO EDICIÓN ===== */
                    <div className="e-card">
                        <div className="e-inner">
                            <div className="edit-grid two-col">
                                <div className="field">
                                    <label>Nombre visible</label>
                                    <input
                                        className="input"
                                        value={edit.display_name ?? ''}
                                        onChange={e => setEdit({ ...(edit as Editable), display_name: e.target.value })}
                                    />
                                </div>

                                <div className="field">
                                    <label>Idioma nativo (es,en,fr…)</label>
                                    <input
                                        className="input"
                                        value={edit.native_lang ?? ''}
                                        onChange={e => setEdit({ ...(edit as Editable), native_lang: e.target.value })}
                                    />
                                </div>

                                <div className="field">
                                    <label>Idioma objetivo (es,en,fr…)</label>
                                    <input
                                        className="input"
                                        value={edit.target_lang ?? ''}
                                        onChange={e => setEdit({ ...(edit as Editable), target_lang: e.target.value })}
                                    />
                                </div>

                                <div className="field">
                                    <label>Nivel (A1..C2)</label>
                                    <input
                                        className="input"
                                        value={edit.target_level ?? ''}
                                        onChange={e => setEdit({ ...(edit as Editable), target_level: e.target.value })}
                                    />
                                </div>

                                <div className="field span-2 avatar-edit">
                                    <label>Avatar URL (opcional)</label>
                                    <input
                                        className="input"
                                        value={edit.avatar_url ?? ''}
                                        onChange={e => setEdit({ ...(edit as Editable), avatar_url: e.target.value })}
                                        placeholder="https://…"
                                    />
                                    {edit.avatar_url && (
                                        <img className="avatar-preview" src={edit.avatar_url} alt="preview avatar" />
                                    )}
                                    <span className="note">Pega una URL pública (ej. tu CDN). </span>
                                </div>
                            </div>

                            <div className="actions">
                                <button className="btn ghost" onClick={onCancel} type="button">Cancelar</button>
                                <button className="btn glow" onClick={onSave} disabled={!isDirty || loading} type="button">
                                    {loading ? 'Guardando…' : 'Guardar'}
                                </button>
                            </div>

                            {!isDirty && <div className="note">No hay cambios</div>}
                        </div>
                    </div>
                ) : (
                    /* ===== MODO LECTURA ===== */
                    <div className="e-card">
                        <div className="e-inner">
                            <div className="read-grid">
                                <div className="read-row"><b>Email:</b> {me?.email}</div>
                                <div className="read-row"><b>Nombre visible:</b> {profile.display_name || '—'}</div>
                                <div className="read-row"><b>Nativo:</b> {profile.native_lang || '—'}</div>
                                <div className="read-row"><b>Objetivo:</b> {profile.target_lang || '—'}</div>
                                <div className="read-row"><b>Nivel:</b> {profile.target_level || '—'}</div>
                                <div className="read-row read-avatar">
                                    <b>Avatar:</b>
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="avatar" />
                                    ) : '—'}
                                </div>

                                <div className="actions">
                                    <button className="btn glow" onClick={onEdit} type="button">Editar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
