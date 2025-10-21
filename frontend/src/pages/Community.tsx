import { useEffect, useState } from 'react';
import { endpoints, type Thread, type Post } from '../api';
import { useApi } from '../hooks/useApi';
import '../css/community.css';

export default function CommunityPage() {
    const { call } = useApi();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selected, setSelected] = useState<Thread | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [newThread, setNewThread] = useState('');
    const [newPost, setNewPost] = useState('');
    const [msg, setMsg] = useState('');

    const loadThreads = () =>
        call<Thread[]>(endpoints.listThreads()).then(setThreads).catch(e => setMsg(String(e.message || e)));

    useEffect(() => { loadThreads(); }, []);

    const openThread = async (t: Thread) => {
        setSelected(t);
        setPosts([]);
        try {
            const ps = await call<Post[]>(endpoints.listPosts(t.id));
            setPosts(ps);
        } catch (e: any) { setMsg(e.message); }
    };

    const createThread = async () => {
        if (!newThread.trim()) return;
        try {
            await call<Thread>(endpoints.createThread(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newThread }),
            });
            setNewThread(''); loadThreads();
        } catch (e: any) { setMsg(e.message); }
    };

    const createPost = async () => {
        if (!selected || !newPost.trim()) return;
        try {
            await call<Post>(endpoints.createPost(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ thread_id: selected.id, body_md: newPost }),
            });
            setNewPost(''); openThread(selected);
        } catch (e: any) { setMsg(e.message); }
    };

        return (
            <div className="community-bg">
                <div className="community-wrap">
                    <h2 className="page-title">Comunidad</h2>
                    {msg && <p className="hint-bad">{msg}</p>}

                    <div className="community-grid">
                        {/* Columna izquierda: Hilos */}
                        <div className="e-card thread-card">
                            <div className="e-inner">
                                <div className="composer">
                                    <input
                                        className="input"
                                        placeholder="Nuevo hilo"
                                        value={newThread}
                                        onChange={e => setNewThread(e.target.value)}
                                    />
                                    <button className="btn glow" onClick={createThread}>Crear</button>
                                </div>

                                <div className="thread-list">
                                    {threads.map(t => {
                                        const isActive = selected?.id === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                className={`thread-item ${isActive ? 'active' : ''}`}
                                                onClick={() => openThread(t)}
                                                title={t.title}
                                            >
                                                <span>{t.pinned ? '📌 ' : ''}{t.title}</span>
                                                {t.pinned && <span className="pin">Pin</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha: Posts */}
                        <div className="e-card">
                            <div className="e-inner">
                                {selected ? (
                                    <>
                                        <div className="posts-header">
                                            <h3>{selected.title}</h3>
                                        </div>

                                        <div className="posts-composer">
                                            <input
                                                className="input"
                                                placeholder="Nuevo comentario"
                                                value={newPost}
                                                onChange={e => setNewPost(e.target.value)}
                                            />
                                            <button className="btn glow" onClick={createPost}>Publicar</button>
                                        </div>

                                        <div className="post-list">
                                            {posts.length ? posts.map(p => (
                                                <div key={p.id} className="post">{p.body_md}</div>
                                            )) : <p className="muted">Aún no hay respuestas.</p>}
                                        </div>
                                    </>
                                ) : (
                                    <p className="muted">Selecciona un hilo</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

