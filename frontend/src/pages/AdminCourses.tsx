import { useEffect, useMemo, useRef, useState } from 'react';
import { useApi } from '../hooks/useApi';
import {
    endpoints, adminEndpoints, mediaEndpoints,
    type Course, type Module, type Lesson, type Block,
    type NewCourse, type NewModule, type NewLesson, type NewBlock,
    type Media,
} from '../api';

import '../css/adminCourses.css';

export default function AdminCourses() {
    const { call } = useApi();

    // datos cargados
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [mediaList, setMediaList] = useState<Media[]>([]);
    const [msg, setMsg] = useState('');

    // selección (controla etapas)
    const [courseId, setCourseId] = useState<number | null>(null);
    const [moduleId, setModuleId] = useState<number | null>(null);
    const [lessonId, setLessonId] = useState<number | null>(null);

    // formularios
    const [cForm, setCForm] = useState<NewCourse>({ title: '', lang: '', level: '', is_published: true });
    const [mForm, setMForm] = useState<NewModule>({ course_id: 0, title: '', position: 1 });
    const [lForm, setLForm] = useState<NewLesson>({ module_id: 0, title: '', position: 1, summary: '' });
    const [bForm, setBForm] = useState<NewBlock>({ lesson_id: 0, type: 'text', position: 1, text: '' });

    // media
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState<Media | null>(null);

    // refs para scroll a la activa
    const card1Ref = useRef<HTMLElement | null>(null);
    const card2Ref = useRef<HTMLElement | null>(null);
    const card3Ref = useRef<HTMLElement | null>(null);
    const card4Ref = useRef<HTMLElement | null>(null);

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
    // justo debajo de los useState y antes de los selects/creates
    const goToStep = (step: 1 | 2 | 3) => {
        if (step === 1) {
            // volver al inicio: ocultar 2,3,4
            setCourseId(null);
            setModuleId(null);
            setLessonId(null);
            setLessons([]);
            setBlocks([]);
            setUploaded(null);
        } else if (step === 2) {
            // mostrar tarjeta 2: mantener curso, limpiar 3 y 4
            setModuleId(null);
            setLessonId(null);
            setLessons([]);
            setBlocks([]);
            setUploaded(null);
        } else if (step === 3) {
            // mostrar tarjeta 3: mantener curso y módulo, limpiar 4
            setLessonId(null);
            setBlocks([]);
            setUploaded(null);
        }
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
            const created = await call<Block>(adminEndpoints.createBlock(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setBlocks(prev => [...prev, created]);
            setBForm({ lesson_id: lessonId, type: 'text', position: (blocks?.length || 0) + 2, text: '' });
            setUploaded(null);
            setMsg('✅ Bloque creado');
        } catch (e: any) { setMsg(String(e.message || e)); }
    };

    // subir media
    const onUploadFile = async (file?: File | null) => {
        if (!file) return;
        try {
            setUploading(true);
            const form = new FormData();
            form.append('file', file);
            const media = await call<Media>(mediaEndpoints.upload(), {
                method: 'POST',
                body: form,
            });
            setUploaded(media);
            setMediaList(prev => [media, ...prev]);
            setMsg('✅ Media subido');
        } catch (e: any) {
            setMsg(String(e.message || e));
        } finally {
            setUploading(false);
        }
    };

    const selectedCourse = useMemo(
        () => courses.find(c => c.id === courseId) || null,
        [courses, courseId]
    );

    // ===== Etapa activa (1..4)
    const activeStep =
        lessonId ? 4 :
            moduleId ? 3 :
                courseId ? 2 : 1;

    // Scroll a la tarjeta activa cuando cambia
    useEffect(() => {
        const el =
            activeStep === 1 ? card1Ref.current :
                activeStep === 2 ? card2Ref.current :
                    activeStep === 3 ? card3Ref.current :
                        card4Ref.current;

        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [activeStep]);

    return (
        <div className="admin-courses-bg">
            <div className="admin-courses-wrap">
                <h2 className="page-title">Admin • Cursos</h2>
                {msg && <p className={msg.startsWith('✅') ? 'hint-ok' : 'hint-bad'}>{msg}</p>}

                {/* === Tarjeta 1: Cursos === */}
                <section
                    ref={card1Ref}
                    className={`ecard ${activeStep === 1 ? 'ecard--active' : 'ecard--collapsed'}`}
                    key="card-courses"
                >
                    <div className="ecard-inner">
                        <div
                            className="ecard-header"
                            role={activeStep !== 1 ? 'button' : undefined}
                            tabIndex={activeStep !== 1 ? 0 : -1}
                            title={activeStep !== 1 ? 'Ir a Cursos' : undefined}
                            onClick={() => activeStep !== 1 && goToStep(1)}
                            onKeyDown={(e) => activeStep !== 1 && (e.key === 'Enter' || e.key === ' ') && goToStep(1)}
                        >
                            <h3 className="ecard-title">Cursos</h3>
                            <span className="caret" />
                        </div>


                        <div className="ecard-body">
                            <div className="form-grid-course">
                                <input className="input" placeholder="Título"
                                       value={cForm.title} onChange={e => setCForm({ ...cForm, title: e.target.value })}/>
                                <input className="input" placeholder="Idioma (es,en,fr)"
                                       value={cForm.lang} onChange={e => setCForm({ ...cForm, lang: e.target.value })}/>
                                <input className="input" placeholder="Nivel (A1..C2)"
                                       value={cForm.level || ''} onChange={e => setCForm({ ...cForm, level: e.target.value })}/>
                                <label className="inline-checkbox">
                                    <input type="checkbox" checked={!!cForm.is_published}
                                           onChange={e => setCForm({ ...cForm, is_published: e.target.checked })}/>
                                    Publicado
                                </label>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <button className="btn glow" onClick={createCourse}>Crear curso</button>
                            </div>

                            <ul className="panel-list" style={{ marginTop: 12 }}>
                                {courses.map(c => (
                                    <li key={c.id}>
                                        <button className="item-btn" onClick={() => selectCourse(c.id)}>
                                            {c.title} ({c.lang}) {c.is_published ? '🟢' : '⚪'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* === Tarjeta 2: Módulos === */}
                {courseId && (
                    <section
                        ref={card2Ref}
                        className={`ecard appear ${activeStep === 2 ? 'ecard--active' : 'ecard--collapsed'}`}
                        key={`card-modules-${courseId}`}
                        style={{ ['--delay' as any]: '0.05s' }}
                    >
                        <div className="ecard-inner">
                            <div
                                className="ecard-header"
                                role={activeStep > 2 ? 'button' : undefined}
                                tabIndex={activeStep > 2 ? 0 : -1}
                                title={activeStep > 2 ? 'Ir a Módulos' : undefined}
                                onClick={() => activeStep > 2 && goToStep(2)}
                                onKeyDown={(e) => activeStep > 2 && (e.key === 'Enter' || e.key === ' ') && goToStep(2)}
                            >
                                <h3 className="ecard-title">Módulos {selectedCourse ? `• ${selectedCourse.title}` : ''}</h3>
                                <span className="caret" />
                            </div>


                            <div className="ecard-body">
                                <div className="grid-module-form">
                                    <input className="input" placeholder="Título módulo"
                                           value={mForm.title} onChange={e => setMForm({ ...mForm, title: e.target.value })}/>
                                    <input className="input" placeholder="Posición" type="number"
                                           value={mForm.position || 1}
                                           onChange={e => setMForm({ ...mForm, position: Number(e.target.value) })}/>
                                    <button className="btn glow" onClick={createModule}>Crear</button>
                                </div>

                                <ul className="panel-list" style={{ marginTop: 12 }}>
                                    {modules.map(m => (
                                        <li key={m.id}>
                                            <button className="item-btn" onClick={() => selectModule(m.id)}>
                                                {m.position}. {m.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* === Tarjeta 3: Lecciones === */}
                {moduleId && (
                    <section
                        ref={card3Ref}
                        className={`ecard appear ${activeStep === 3 ? 'ecard--active' : 'ecard--collapsed'}`}
                        key={`card-lessons-${moduleId}`}
                        style={{ ['--delay' as any]: '0.07s' }}
                    >
                        <div className="ecard-inner">
                            <div
                                className="ecard-header"
                                role={activeStep > 3 ? 'button' : undefined}
                                tabIndex={activeStep > 3 ? 0 : -1}
                                title={activeStep > 3 ? 'Ir a Lecciones' : undefined}
                                onClick={() => activeStep > 3 && goToStep(3)}
                                onKeyDown={(e) => activeStep > 3 && (e.key === 'Enter' || e.key === ' ') && goToStep(3)}
                            >
                                <h3 className="ecard-title">Lecciones (módulo {moduleId})</h3>
                                <span className="caret" />
                            </div>


                            <div className="ecard-body">
                                <div className="grid-lesson-form">
                                    <input className="input" placeholder="Título lección"
                                           value={lForm.title} onChange={e => setLForm({ ...lForm, title: e.target.value })}/>
                                    <input className="input" placeholder="Posición" type="number"
                                           value={lForm.position || 1}
                                           onChange={e => setLForm({ ...lForm, position: Number(e.target.value) })}/>
                                    <input className="input" placeholder="Resumen"
                                           value={lForm.summary || ''} onChange={e => setLForm({ ...lForm, summary: e.target.value })}/>
                                    <button className="btn glow" onClick={createLesson}>Crear</button>
                                </div>

                                <ul className="panel-list" style={{ marginTop: 12 }}>
                                    {lessons.map(l => (
                                        <li key={l.id}>
                                            <button className="item-btn" onClick={() => selectLesson(l.id)}>
                                                {l.position}. {l.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* === Tarjeta 4: Bloques === */}
                {lessonId && (
                    <section
                        ref={card4Ref}
                        className={`ecard appear ${activeStep === 4 ? 'ecard--active' : 'ecard--collapsed'}`}
                        key={`card-blocks-${lessonId}`}
                        style={{ ['--delay' as any]: '0.09s' }}
                    >
                        <div className="ecard-inner">
                            <div className="ecard-header">
                                <h3 className="ecard-title">Bloques (lección {lessonId})</h3>
                                <span className="caret" />
                            </div>

                            <div className="ecard-body">
                                <div className="block-form">
                                    <div className="row">
                                        <label>Tipo</label>
                                        <select
                                            className="select"
                                            value={bForm.type}
                                            onChange={e => {
                                                const t = e.target.value as NewBlock['type'];
                                                setBForm(prev => ({
                                                    lesson_id: lessonId,
                                                    position: prev.position || 1,
                                                    type: t,
                                                    text: t === 'text' ? '' : undefined,
                                                    media_id: undefined
                                                }));
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
                                            className="textarea"
                                            placeholder="Contenido de texto…"
                                            rows={4}
                                            value={bForm.text || ''}
                                            onChange={e => setBForm(prev => ({ ...prev, text: e.target.value }))}
                                        />
                                    ) : (
                                        <>
                                            <div className="row">
                                                <label>Subir archivo ({bForm.type})</label>
                                                <input
                                                    className="input"
                                                    type="file"
                                                    accept={bForm.type === 'image' ? 'image/*' : `${bForm.type}/*`}
                                                    onChange={e => onUploadFile(e.target.files?.[0])}
                                                    disabled={uploading}
                                                />
                                            </div>

                                            {uploaded?.url && (
                                                <div className="block-preview">
                                                    {uploaded.kind === 'image' ? (
                                                        <img className="media-thumb" src={uploaded.url} alt="preview" />
                                                    ) : uploaded.kind === 'audio' ? (
                                                        <audio controls src={uploaded.url} />
                                                    ) : (
                                                        <video controls width={320} src={uploaded.url} />
                                                    )}
                                                </div>
                                            )}

                                            <div className="row">
                                                <label>o seleccionar existente</label>
                                                <select
                                                    className="select"
                                                    value={(bForm as any).media_id || ''}
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

                                    <div className="row">
                                        <label>Posición</label>
                                        <input
                                            className="input"
                                            type="number"
                                            value={bForm.position || 1}
                                            onChange={e => setBForm(prev => ({ ...prev, position: Number(e.target.value) }))}
                                            min={1}
                                        />
                                    </div>

                                    <button className="btn glow" onClick={createBlock} disabled={uploading}>
                                        {uploading ? 'Subiendo…' : 'Crear bloque'}
                                    </button>
                                </div>

                                {lessonId && (
                                    blocks.length ? (
                                        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                                            {blocks.map(b => (
                                                <div key={b.id} className="block-card">
                                                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                                        #{b.position} • {b.type.toUpperCase()}
                                                    </div>
                                                    {b.type === 'text' && <p style={{ margin: 0 }}>{b.text}</p>}
                                                    {b.type === 'image' && b.media?.url && <img className="media-thumb" src={b.media.url} alt="" />}
                                                    {b.type === 'audio' && b.media?.url && <audio controls src={b.media.url} />}
                                                    {b.type === 'video' && b.media?.url && <video controls width={360} src={b.media.url} />}
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="muted">No hay bloques en esta lección.</p>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
