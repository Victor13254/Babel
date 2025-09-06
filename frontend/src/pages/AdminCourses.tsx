import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import {
    endpoints, adminEndpoints, mediaEndpoints,
    type Course, type Module, type Lesson, type Block,
    type NewCourse, type NewModule, type NewLesson, type NewBlock,
    type Media,
} from '../api';

export default function AdminCourses() {
    const { call } = useApi();

    // datos cargados
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [msg, setMsg] = useState('');

    // selección
    const [courseId, setCourseId] = useState<number | null>(null);
    const [moduleId, setModuleId] = useState<number | null>(null);
    const [lessonId, setLessonId] = useState<number | null>(null);

    // formularios
    const [cForm, setCForm] = useState<NewCourse>({ title: '', lang: '', level: '', is_published: true });
    const [mForm, setMForm] = useState<NewModule>({ course_id: 0, title: '', position: 1 });
    const [lForm, setLForm] = useState<NewLesson>({ module_id: 0, title: '', position: 1, summary: '' });
    const [bForm, setBForm] = useState<NewBlock>({ lesson_id: 0, type: 'text', position: 1, text: '' });

    // subida de media ad-hoc para bloque
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<Media | null>(null);

    // cargar catálogos base
    useEffect(() => {
        call<Course[]>(endpoints.listPublicCourses())
            .then(setCourses)
            .catch(e => setMsg(String(e.message || e)));
        call<Media[]>(mediaEndpoints.list())
            .then(setMediaList)
            .catch(() => {});
    }, []);

    const loadModules = async (cid: number) => {
        try {
            const data = await call<Module[]>(endpoints.listModules(cid));
            setModules(data);
        } catch (e: any) { setMsg(e.message); }
    };
    const loadLessons = async (mid: number) => {
        try {
            const data = await call<Lesson[]>(endpoints.listLessons(mid));
            setLessons(data);
        } catch (e: any) { setMsg(e.message); }
    };
    const loadBlocks = async (lid: number) => {
        try {
            const data = await call<Block[]>(endpoints.listBlocks(lid));
            setBlocks(data);
        } catch (e: any) { setMsg(e.message); }
    };

    // seleccionar
    const selectCourse = async (id: number) => {
        setCourseId(id);
        setModuleId(null);
        setLessonId(null);
        setLessons([]);
        setBlocks([]);
        setUploaded(null);
        await loadModules(id);
        setMForm({ course_id: id, title: '', position: (modules?.length || 0) + 1 });
    };
    const selectModule = async (id: number) => {
        setModuleId(id);
        setLessonId(null);
        setBlocks([]);
        setUploaded(null);
        await loadLessons(id);
        setLForm({ module_id: id, title: '', position: (lessons?.length || 0) + 1, summary: '' });
    };
    const selectLesson = async (id: number) => {
        setLessonId(id);
        await loadBlocks(id);
        setBForm({ lesson_id: id, type: 'text', position: (blocks?.length || 0) + 1, text: '' });
        setUploaded(null);
    };

    // crear
    const createCourse = async () => {
        try {
            setMsg('');
            if (!cForm.title.trim() || !cForm.lang.trim()) throw new Error('Título e idioma son obligatorios');
            const created = await call<Course>(adminEndpoints.createCourse(), {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cForm),
            });
            setCourses(prev => [created, ...prev]);
            setCForm({ title: '', lang: '', level: '', is_published: true });
            setMsg('✅ Curso creado');
        } catch (e: any) { setMsg(String(e.message || e)); }
    };

    const createModule = async () => {
        try {
            if (!courseId) throw new Error('Selecciona un curso');
            if (!mForm.title.trim()) throw new Error('Título de módulo requerido');
            const payload: NewModule = { ...mForm, course_id: courseId };
            const created = await call<Module>(adminEndpoints.createModule(), {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            setModules(prev => [...prev, created]);
            setMForm({ course_id: courseId, title: '', position: (modules?.length || 0) + 2 });
            setMsg('✅ Módulo creado');
        } catch (e: any) { setMsg(String(e.message || e)); }
    };

    const createLesson = async () => {
        try {
            if (!moduleId) throw new Error('Selecciona un módulo');
            if (!lForm.title.trim()) throw new Error('Título de lección requerido');
            const payload: NewLesson = { ...lForm, module_id: moduleId };
            const created = await call<Lesson>(adminEndpoints.createLesson(), {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            setLessons(prev => [...prev, created]);
            setLForm({ module_id: moduleId, title: '', position: (lessons?.length || 0) + 2, summary: '' });
            setMsg('✅ Lección creada');
        } catch (e: any) { setMsg(String(e.message || e)); }
    };

    const createBlock = async () => {
        try {
            if (!lessonId) throw new Error('Selecciona una lección');
            const payload: any = { lesson_id: lessonId, type: bForm.type, position: bForm.position || 1 };
            if (bForm.type === 'text') {
                const textVal = (bForm.text || '').trim();
                if (!textVal) throw new Error('El bloque de texto no puede estar vacío');
                payload.text = textVal;
            } else {
                const mediaId = (bForm as any).media_id || uploaded?.id;
                if (!mediaId) throw new Error('Sube o selecciona un media primero');
                payload.media_id = mediaId;
            }
            console.log('payload blocks:', payload);
            const created = await call<Block>(adminEndpoints.createBlock(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setBlocks(prev => [...prev, created]);
            // siguiente posición y reset de form
            setBForm({ lesson_id: lessonId, type: 'text', position: (blocks?.length || 0) + 2, text: '' });
            setUploaded(null);
            setMsg('✅ Bloque creado');
        } catch (e: any) { setMsg(String(e.message || e)); }
    };

    // subir archivo a /media/upload (usa useApi para adjuntar Authorization automáticamente)
    const onUploadFile = async (file?: File | null) => {
        if (!file) return;
        try {
            setUploading(true);
            const form = new FormData();
            form.append('file', file);
            const media = await call<Media>(mediaEndpoints.upload(), {
                method: 'POST',
                body: form, // NO pongas Content-Type; el navegador lo establece
            });
            setUploaded(media);
            // refrescar lista para que aparezca seleccionable también
            setMediaList(prev => [media, ...prev]);
            setMsg('✅ Media subido');
        } catch (e: any) {
            setMsg(String(e.message || e));
        } finally {
            setUploading(false);
        }
    };

    const selectedCourse = useMemo(() => courses.find(c => c.id === courseId) || null, [courses, courseId]);

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 1200, margin: '1.5rem auto' }}>
                <h2>Admin • Cursos</h2>
                {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'crimson' }}>{msg}</p>}

                {/* Crear curso */}
                <section style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <h3>Nuevo Curso</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
                        <input placeholder="Título" value={cForm.title} onChange={e=>setCForm({ ...cForm, title: e.target.value })} />
                        <input placeholder="Idioma (es,en,fr)" value={cForm.lang} onChange={e=>setCForm({ ...cForm, lang: e.target.value })} />
                        <input placeholder="Nivel (A1..C2)" value={cForm.level || ''} onChange={e=>setCForm({ ...cForm, level: e.target.value })} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="checkbox" checked={!!cForm.is_published} onChange={e=>setCForm({ ...cForm, is_published: e.target.checked })} />
                            Publicado
                        </label>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <button onClick={createCourse}>Crear curso</button>
                    </div>
                </section>

                {/* Grids */}
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                    {/* Cursos */}
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                        <h3>Cursos</h3>
                        <ul>
                            {courses.map(c => (
                                <li key={c.id}>
                                    <button onClick={() => selectCourse(c.id)}>
                                        {c.title} ({c.lang}) {c.is_published ? '🟢' : '⚪'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Módulos */}
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                        <h3>Módulos {selectedCourse ? `• ${selectedCourse.title}` : ''}</h3>
                        {courseId && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 6, marginBottom: 8 }}>
                                <input placeholder="Título módulo" value={mForm.title} onChange={e=>setMForm({ ...mForm, title: e.target.value })} />
                                <input placeholder="Posición" type="number" value={mForm.position || 1} onChange={e=>setMForm({ ...mForm, position: Number(e.target.value) })} />
                                <button onClick={createModule}>Crear</button>
                            </div>
                        )}
                        <ul>
                            {modules.map(m => (
                                <li key={m.id}>
                                    <button onClick={() => selectModule(m.id)}>{m.position}. {m.title}</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Lecciones */}
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                        <h3>Lecciones {moduleId ? `(módulo ${moduleId})` : ''}</h3>
                        {moduleId && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr 90px', gap: 6, marginBottom: 8 }}>
                                <input placeholder="Título lección" value={lForm.title} onChange={e=>setLForm({ ...lForm, title: e.target.value })} />
                                <input placeholder="Posición" type="number" value={lForm.position || 1} onChange={e=>setLForm({ ...lForm, position: Number(e.target.value) })} />
                                <input placeholder="Resumen" value={lForm.summary || ''} onChange={e=>setLForm({ ...lForm, summary: e.target.value })} />
                                <button onClick={createLesson}>Crear</button>
                            </div>
                        )}
                        <ul>
                            {lessons.map(l => (
                                <li key={l.id}>
                                    <button onClick={() => selectLesson(l.id)}>{l.position}. {l.title}</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Bloques */}
                    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
                        <h3>Bloques {lessonId ? `(lección ${lessonId})` : ''}</h3>

                        {lessonId && (
                            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
                                <div>
                                    <label>Tipo</label>{' '}
                                    <select
                                        value={bForm.type}
                                        onChange={e => {
                                            const t = e.target.value as NewBlock['type'];
                                            setBForm(prev => ({ lesson_id: lessonId, position: prev.position || 1, type: t, text: t === 'text' ? '' : undefined, media_id: undefined }));
                                            setUploaded(null);
                                        }}
                                    >
                                        <option value="text">text</option>
                                        <option value="image">image</option>
                                        <option value="audio">audio</option>
                                        <option value="video">video</option>
                                    </select>
                                </div>

                                {bForm.type === 'text' ? (
                                    <textarea
                                        placeholder="Contenido de texto…"
                                        rows={3}
                                        value={bForm.text || ''}
                                        onChange={e => setBForm(prev => ({ ...prev, text: e.target.value }))}
                                    />
                                ) : (
                                    <>
                                        <div>
                                            <label>Subir archivo ({bForm.type})</label>{' '}
                                            <input
                                                type="file"
                                                accept={bForm.type === 'image' ? 'image/*' : `${bForm.type}/*`}
                                                onChange={e => onUploadFile(e.target.files?.[0])}
                                                disabled={uploading}
                                            />
                                        </div>

                                        {uploaded?.url && (
                                            <div style={{ marginTop: 6 }}>
                                                {uploaded.kind === 'image' ? (
                                                    <img src={uploaded.url} alt="preview" style={{ width: 160, borderRadius: 6 }} />
                                                ) : uploaded.kind === 'audio' ? (
                                                    <audio controls src={uploaded.url} />
                                                ) : (
                                                    <video controls width={240} src={uploaded.url} />
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <label>o seleccionar existente</label>{' '}
                                            <select
                                                value={bForm.media_id || ''}
                                                onChange={e => setBForm(prev => ({ ...prev, media_id: Number(e.target.value) || undefined }))}
                                            >
                                                <option value="">-- seleccionar --</option>
                                                {mediaList
                                                    .filter(m => m.kind === bForm.type)
                                                    .map(m => <option key={m.id} value={m.id}>{m.id} • {m.url}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label>Posición</label>{' '}
                                    <input
                                        type="number"
                                        value={bForm.position || 1}
                                        onChange={e => setBForm(prev => ({ ...prev, position: Number(e.target.value) }))}
                                        min={1}
                                    />
                                </div>

                                <button onClick={createBlock} disabled={uploading}>
                                    {uploading ? 'Subiendo…' : 'Crear bloque'}
                                </button>
                            </div>
                        )}

                        {/* Lista de bloques */}
                        {lessonId && (
                            blocks.length ? (
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {blocks.map(b => (
                                        <div key={b.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                                #{b.position} • {b.type.toUpperCase()}
                                            </div>
                                            {b.type === 'text' && <p style={{ margin: 0 }}>{b.text}</p>}
                                            {b.type === 'image' && b.media?.url && <img src={b.media.url} alt="" style={{ maxWidth: 360, borderRadius: 6 }} />}
                                            {b.type === 'audio' && b.media?.url && <audio controls src={b.media.url} />}
                                            {b.type === 'video' && b.media?.url && <video controls width={360} src={b.media.url} />}
                                        </div>
                                    ))}
                                </div>
                            ) : <p>No hay bloques en esta lección.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
