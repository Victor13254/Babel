import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import "../css/dashboardAdmin.css";

type Summary = {
    students: number;
    teachers: number;
    courses: number;//
    active_today: number;
    lessons_completed: number;
    attempts_today: number;
};

type CourseStat = {
    course_id: number;
    title: string;
    lang: string;
    level?: string | null;
    enrolled: number;
    active_today: number;
    completion_rate: number; // 0..1
};

type ApiState<T> = {
    data?: T;
    loading: boolean;
    error?: string;
};

export default function DashboardAdmin() {
    const { me } = useAuth();

    const [summary, setSummary] = useState<ApiState<Summary>>({
        loading: true,
    });
    const [courses, setCourses] = useState<ApiState<CourseStat[]>>({
        loading: true,
    });

    // Configura aquí tu base de API si te ayuda
    const API = (import.meta as any).env?.VITE_API_BASE?.replace(/\/$/, "") || "";

    // Mock fallback (por si todavía no tienes endpoints)
    const mockSummary: Summary = {
        students: 1240,
        teachers: 12,
        courses: 18,
        active_today: 214,
        lessons_completed: 356,
        attempts_today: 502,
    };
    const mockCourses: CourseStat[] = [
        { course_id: 1, title: "Inglés A1", lang: "en", level: "A1", enrolled: 420, active_today: 66, completion_rate: 0.42 },
        { course_id: 2, title: "Francés A2", lang: "fr", level: "A2", enrolled: 220, active_today: 31, completion_rate: 0.35 },
        { course_id: 3, title: "Alemán B1", lang: "de", level: "B1", enrolled: 160, active_today: 25, completion_rate: 0.27 },
        { course_id: 4, title: "Italiano A1", lang: "it", level: "A1", enrolled: 120, active_today: 18, completion_rate: 0.31 },
        { course_id: 5, title: "Portugués B2", lang: "pt", level: "B2", enrolled: 95,  active_today: 12, completion_rate: 0.52 },
    ];

    useEffect(() => {
        let abort = new AbortController();

        async function fetchSummary() {
            try {
                setSummary((s) => ({ ...s, loading: true, error: undefined }));
                const res = await fetch(`${API}/api/admin/metrics/summary`, { signal: abort.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as Summary;
                setSummary({ data, loading: false });
            } catch (e: any) {
                // fallback a mock si no existe el endpoint aún
                setSummary({ data: mockSummary, loading: false, error: e?.message || "Error cargando resumen" });
            }
        }

        async function fetchCourses() {
            try {
                setCourses((s) => ({ ...s, loading: true, error: undefined }));
                const res = await fetch(`${API}/api/admin/metrics/courses`, { signal: abort.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as CourseStat[];
                setCourses({ data, loading: false });
            } catch (e: any) {
                setCourses({ data: mockCourses, loading: false, error: e?.message || "Error cargando cursos" });
            }
        }

        fetchSummary();
        fetchCourses();

        // Auto-refresh cada 60s
        const id = setInterval(() => {
            fetchSummary();
            fetchCourses();
        }, 60000);

        return () => {
            abort.abort();
            clearInterval(id);
        };
    }, [API]);

    const maxEnrolled = useMemo(() => {
        const arr = courses.data ?? [];
        return Math.max(1, ...arr.map((c) => c.enrolled));
    }, [courses.data]);

    return (
        <div className="hero-bg admin-bg">
            <main className="admin-container">
                <header className="admin-header">
                    <h1 className="hero-title">Panel Admin</h1>
                    <p className="hero-subtitle">
                        Hola <span> {me?.email ?? "admin"} </span> — visión general del aprendizaje
                    </p>
                </header>

                {/* KPIs */}
                <section className="grid-kpis">
                    <KpiCard title="Estudiantes" value={summary.data?.students} loading={summary.loading} />
                    <KpiCard title="Profesores" value={summary.data?.teachers} loading={summary.loading} />
                    <KpiCard title="Cursos" value={summary.data?.courses} loading={summary.loading} />
                    <KpiCard title="Activos hoy" value={summary.data?.active_today} loading={summary.loading} />
                    <KpiCard title="Lecciones completadas" value={summary.data?.lessons_completed} loading={summary.loading} />
                    <KpiCard title="Intentos hoy" value={summary.data?.attempts_today} loading={summary.loading} />
                </section>

                {/* Cursos: gráfica y tabla */}
                <section className="glow-card courses-card">
                    <div className="glow-border" aria-hidden="true" />
                    <div className="glow-sheen" aria-hidden="true" />

                    <div className="courses-header">
                        <h2>Actividad por curso</h2>
                        {courses.error && <span className="hint error">Mostrando datos de ejemplo</span>}
                    </div>

                    <div className="courses-body">
                        {/* Mini chart (CSS bars) */}
                        <div className="bars">
                            {(courses.data ?? []).map((c) => {
                                const pct = Math.round((c.enrolled / maxEnrolled) * 100);
                                return (
                                    <div key={c.course_id} className="bar-row">
                                        <div className="bar-info">
                                            <span className="bar-title">{c.title}</span>
                                            <span className="bar-meta">{c.lang.toUpperCase()} · {c.level ?? "-"}</span>
                                        </div>
                                        <div className="bar-track" aria-label={`Inscritos: ${c.enrolled}`}>
                                            <div className="bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="bar-nums">
                                            <span className="enrolled">{c.enrolled} insc.</span>
                                            <span className="active">{c.active_today} activos</span>
                                            <span className="rate">{Math.round(c.completion_rate * 100)}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!courses.data || courses.data.length === 0) && (
                                <p className="muted">No hay cursos aún.</p>
                            )}
                        </div>

                        {/* Tabla compacta */}
                        <div className="table-wrap">
                            <table className="electric-table">
                                <thead>
                                <tr>
                                    <th>Curso</th>
                                    <th>Idioma</th>
                                    <th>Nivel</th>
                                    <th>Inscritos</th>
                                    <th>Activos hoy</th>
                                    <th>Completado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(courses.data ?? []).map((c) => (
                                    <tr key={c.course_id}>
                                        <td className="td-title">{c.title}</td>
                                        <td>{c.lang.toUpperCase()}</td>
                                        <td>{c.level ?? "-"}</td>
                                        <td>{c.enrolled}</td>
                                        <td>{c.active_today}</td>
                                        <td>{Math.round(c.completion_rate * 100)}%</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function KpiCard({ title, value, loading }: { title: string; value?: number; loading: boolean }) {
    return (
        <section className="glow-card kpi-card" role="status" aria-live="polite">
            <div className="glow-border" aria-hidden="true" />
            <div className="glow-sheen" aria-hidden="true" />
            <div className="kpi-inner">
                <span className="kpi-title">{title}</span>
                {loading ? <span className="kpi-skeleton" /> : <span className="kpi-value">{value ?? "—"}</span>}
            </div>
        </section>
    );
}
