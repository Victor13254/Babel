import { useEffect, useState } from 'react';
import { endpoints, type Course, type Module, type Lesson, type Block } from '../api';
import { useApi } from '../hooks/useApi';

export default function Courses() {
    const { call } = useApi();
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);

    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

    const [msg, setMsg] = useState('');

    useEffect(() => {
        call<Course[]>(endpoints.listPublicCourses())
            .then(setCourses)
            .catch(e => setMsg(String(e.message || e)));
    }, []);

    const onSelectCourse = async (id: number) => {
        setSelectedCourse(id);
        setSelectedModule(null);
        setSelectedLesson(null);
        setLessons([]);
        setBlocks([]);
        try {
            const data = await call<Module[]>(endpoints.listModules(id));
            setModules(data);
        } catch (e: any) { setMsg(e.message); }
    };

    const onSelectModule = async (id: number) => {
        setSelectedModule(id);
        setSelectedLesson(null);
        setBlocks([]);
        try {
            const data = await call<Lesson[]>(endpoints.listLessons(id));
            setLessons(data);
        } catch (e: any) { setMsg(e.message); }
    };

    const onSelectLesson = async (id: number) => {
        setSelectedLesson(id);
        try {
            const data = await call<Block[]>(endpoints.listBlocks(id));
            setBlocks(data);
        } catch (e: any) { setMsg(e.message); }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Cursos</h2>
            {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: 16 }}>
                {/* Cursos */}
                <div>
                    <h3>Listado</h3>
                    <ul>
                        {courses.map(c => (
                            <li key={c.id}>
                                <button onClick={() => onSelectCourse(c.id)}>
                                    {c.title} ({c.lang}) {c.is_published ? '🟢' : '⚪'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Módulos */}
                <div>
                    <h3>Módulos {selectedCourse ? `(curso ${selectedCourse})` : ''}</h3>
                    <ul>
                        {modules.map(m => (
                            <li key={m.id}>
                                <button onClick={() => onSelectModule(m.id)}>
                                    {m.position}. {m.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Lecciones */}
                <div>
                    <h3>Lecciones {selectedModule ? `(módulo ${selectedModule})` : ''}</h3>
                    <ul>
                        {lessons.map(l => (
                            <li key={l.id}>
                                <button onClick={() => onSelectLesson(l.id)}>
                                    {l.position}. {l.title}
                                </button>
                                {l.summary ? <div style={{ opacity: 0.7 }}>{l.summary}</div> : null}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bloques de la lección seleccionada */}
                <div>
                    <h3>Bloques {selectedLesson ? `(lección ${selectedLesson})` : ''}</h3>
                    {selectedLesson ? (
                        blocks.length ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                {blocks.map(b => (
                                    <div key={b.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 8 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                            #{b.position} • {b.type.toUpperCase()}
                                        </div>

                                        {b.type === 'text' && <p>{b.text}</p>}
                                        {b.type === 'image' && b.media?.url && <img src={b.media.url} style={{ maxWidth: 360, borderRadius: 6 }} />}
                                        {b.type === 'audio' && b.media?.url && <audio controls src={b.media.url} />}
                                        {b.type === 'video' && b.media?.url && <video controls width={360} src={b.media.url} />}

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No hay bloques en esta lección.</p>
                        )
                    ) : (
                        <p>Selecciona una lección para ver sus bloques.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
