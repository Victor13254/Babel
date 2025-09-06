import { useEffect, useState } from 'react';
import { endpoints, type Thread, type Post } from '../api';
import { useApi } from '../hooks/useApi';

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
        <div style={{ maxWidth: 960, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Comunidad</h2>
            {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input placeholder="Nuevo hilo" value={newThread} onChange={e=>setNewThread(e.target.value)} />
                        <button onClick={createThread}>Crear</button>
                    </div>
                    <ul>
                        {threads.map(t => (
                            <li key={t.id}>
                                <button onClick={() => openThread(t)}>{t.pinned ? '📌 ' : ''}{t.title}</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    {selected ? (
                        <>
                            <h3>{selected.title}</h3>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input placeholder="Nuevo comentario" value={newPost} onChange={e=>setNewPost(e.target.value)} />
                                <button onClick={createPost}>Publicar</button>
                            </div>
                            <ul>
                                {posts.map(p => (<li key={p.id}>{p.body_md}</li>))}
                            </ul>
                        </>
                    ) : <p>Selecciona un hilo</p>}
                </div>
            </div>
        </div>
    );
}
