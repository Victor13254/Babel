import { useEffect, useMemo, useState } from 'react';
import { endpoints, type Course, type Module, type Lesson, type Block } from '../api';
import { useApi } from '../hooks/useApi';
import '../css/courses.css';

export default function Courses() {
    const { call } = useApi();

    // data
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);

    // selection
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

    // ui
    const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // load courses
    useEffect(() => {
        setLoading(true);
        call<Course[]>(endpoints.listPublicCourses())
            .then(setCourses)
            .catch(e => setMsg(String(e.message || e)))
            .finally(() => setLoading(false));
    }, []);

    // handlers
    const onSelectCourse = async (id: number) => {
        try {
            setSelectedCourse(id);
            setSelectedModule(null);
            setSelectedLesson(null);
            setLessons([]);
            setBlocks([]);
            setLoading(true);
            const data = await call<Module[]>(endpoints.listModules(id));
            setModules(data);
            setActiveStep(2);
        } catch (e: any) {
            setMsg(e.message);
        } finally { setLoading(false); }
    };

    const onSelectModule = async (id: number) => {
        try {
            setSelectedModule(id);
            setSelectedLesson(null);
            setBlocks([]);
            setLoading(true);
            const data = await call<Lesson[]>(endpoints.listLessons(id));
            setLessons(data);
            setActiveStep(3);
        } catch (e: any) {
            setMsg(e.message);
        } finally { setLoading(false); }
    };

    const onSelectLesson = async (id: number) => {
        try {
            setSelectedLesson(id);
            setLoading(true);
            const data = await call<Block[]>(endpoints.listBlocks(id));
            setBlocks(data);
            setActiveStep(4);
        } catch (e: any) {
            setMsg(e.message);
        } finally { setLoading(false); }
    };

    // volver a pasos anteriores (expande la tarjeta clickeada y oculta posteriores)
    const goStep = (step: 1 | 2 | 3 | 4) => {
        // limpiar selecciones “hacia adelante”
        if (step <= 1) {
            setSelectedCourse(null);
            setModules([]); setLessons([]); setBlocks([]);
            setSelectedModule(null); setSelectedLesson(null);
        } else if (step === 2) {
            setSelectedModule(null); setSelectedLesson(null);
            setLessons([]); setBlocks([]);
        } else if (step === 3) {
            setSelectedLesson(null);
            setBlocks([]);
        }
        setActiveStep(step);
    };

    const courseName = useMemo(() => courses.find(c => c.id === selectedCourse)?.title || '', [courses, selectedCourse]);
    const moduleName = useMemo(() => modules.find(m => m.id === selectedModule)?.title || '', [modules, selectedModule]);
    const lessonName = useMemo(() => lessons.find(l => l.id === selectedLesson)?.title || '', [lessons, selectedLesson]);

    return (
        <div className="cstack-bg">
            <div className="cstack-wrap">
                <h2 className="page-title">Explora cursos</h2>
                {msg && <p className="hint error">{msg}</p>}

                {/* ====== STEP 1: Courses ====== */}
                <section
                    className={[
                        'step-card',
                        activeStep > 1 ? 'is-minimized' : 'is-expanded'
                    ].join(' ')}
                >
                    <header className="step-header" onClick={() => goStep(1)}>
                        <div className="step-title">
                            <span className="step-badge">1</span> Cursos disponibles
                        </div>
                        {selectedCourse && <div className="step-selected muted">{courseName}</div>}
                    </header>

                    <div className="step-body">
                        {loading && !courses.length ? (
                            <div className="skeleton-list"><div className="skl-row" /><div className="skl-row" /><div className="skl-row" /></div>
                        ) : courses.length ? (
                            <ul className="list">
                                {courses.map(c => (
                                    <li key={c.id}>
                                        <button
                                            className={`list-item ${selectedCourse === c.id ? 'active' : ''}`}
                                            onClick={() => onSelectCourse(c.id)}
                                        >
                                            <div className="li-title">{c.title}</div>
                                            <div className="li-meta muted">
                                                {c.lang.toUpperCase()} {c.level ? `• ${c.level}` : ''} {c.is_published ? '• Publicado' : '• Borrador'}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="muted">Sin cursos por ahora.</p>
                        )}
                    </div>
                </section>

                {/* ====== STEP 2: Modules ====== */}
                <section
                    className={[
                        'step-card',
                        activeStep < 2 ? 'is-hidden' : activeStep > 2 ? 'is-minimized' : 'is-expanded'
                    ].join(' ')}
                >
                    <header className="step-header" onClick={() => goStep(2)}>
                        <div className="step-title">
                            <span className="step-badge">2</span> Módulos {selectedCourse ? <span className="muted">• {courseName}</span> : null}
                        </div>
                        {selectedModule && <div className="step-selected muted">{moduleName}</div>}
                    </header>

                    <div className="step-body">
                        {selectedCourse ? (
                            modules.length ? (
                                <ul className="list">
                                    {modules.map(m => (
                                        <li key={m.id}>
                                            <button
                                                className={`list-item ${selectedModule === m.id ? 'active' : ''}`}
                                                onClick={() => onSelectModule(m.id)}
                                            >
                                                <div className="li-title">{m.position}. {m.title}</div>
                                                <div className="li-meta muted">ID {m.id}</div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="muted">Este curso todavía no tiene módulos.</p>
                            )
                        ) : (
                            <p className="muted">Selecciona un curso primero.</p>
                        )}
                    </div>
                </section>

                {/* ====== STEP 3: Lessons ====== */}
                <section
                    className={[
                        'step-card',
                        activeStep < 3 ? 'is-hidden' : activeStep > 3 ? 'is-minimized' : 'is-expanded'
                    ].join(' ')}
                >
                    <header className="step-header" onClick={() => goStep(3)}>
                        <div className="step-title">
                            <span className="step-badge">3</span> Lecciones {selectedModule ? <span className="muted">• {moduleName}</span> : null}
                        </div>
                        {selectedLesson && <div className="step-selected muted">{lessonName}</div>}
                    </header>

                    <div className="step-body">
                        {selectedModule ? (
                            lessons.length ? (
                                <ul className="list">
                                    {lessons.map(l => (
                                        <li key={l.id}>
                                            <button
                                                className={`list-item ${selectedLesson === l.id ? 'active' : ''}`}
                                                onClick={() => onSelectLesson(l.id)}
                                            >
                                                <div className="li-title">{l.position}. {l.title}</div>
                                                {l.summary && <div className="li-meta muted">{l.summary}</div>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="muted">Este módulo aún no tiene lecciones.</p>
                            )
                        ) : (
                            <p className="muted">Selecciona un módulo primero.</p>
                        )}
                    </div>
                </section>

                {/* ====== STEP 4: Blocks ====== */}
                <section
                    className={[
                        'step-card',
                        activeStep < 4 ? 'is-hidden' : 'is-expanded'
                    ].join(' ')}
                >
                    <header className="step-header" onClick={() => goStep(4)}>
                        <div className="step-title">
                            <span className="step-badge">4</span> Contenido de la lección {selectedLesson ? <span className="muted">• {lessonName}</span> : null}
                        </div>
                    </header>

                    <div className="step-body">
                        {selectedLesson ? (
                            blocks.length ? (
                                <div className="blocks">
                                    {blocks.map(b => (
                                        <div key={b.id} className="block">
                                            <div className="block-head">
                                                <span className="b-chip">#{b.position}</span>
                                                <span className="b-type">{b.type.toUpperCase()}</span>
                                            </div>
                                            <div className="block-body">
                                                {b.type === 'text' && <p>{b.text}</p>}
                                                {b.type === 'image' && b.media?.url && <img src={b.media.url} alt="" />}
                                                {b.type === 'audio' && b.media?.url && <audio controls src={b.media.url} />}
                                                {b.type === 'video' && b.media?.url && <video controls width={360} src={b.media.url} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="muted">No hay bloques en esta lección.</p>
                            )
                        ) : (
                            <p className="muted">Selecciona una lección para ver sus bloques.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
