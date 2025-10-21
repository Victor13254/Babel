import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth';
import { useApi } from '../hooks/useApi';
import {
    endpoints,
    type Progress, type Streak, type Attempt, type Course
} from '../api';
import '../css/dashboardUser.css';

type Summary = {
    lessonsCompleted: number;
    bestScore: number;
    lastActivityAt?: string | null;
    totalLessonsTracked: number;
    completionRate: number; // 0..1
};

export default function DashboardUser() {
    const { me } = useAuth();
    const { call } = useApi();

    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [progress, setProgress] = useState<Progress[]>([]);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true); setMsg('');
            try {
                const [pg, sk, at, crs] = await Promise.all([
                    call<Progress[]>(endpoints.myProgress()).catch(() => []),
                    call<Streak>(endpoints.streakMe()).catch(() => null),
                    call<Attempt[]>(endpoints.myAttempts()).catch(() => []),
                    call<Course[]>(endpoints.listPublicCourses()).catch(() => []),
                ]);
                if (!alive) return;
                setProgress(pg || []);
                setStreak(sk);
                setAttempts(at || []);
                setCourses(crs || []);
            } catch (e: any) {
                setMsg(String(e.message || e));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    const summary: Summary = useMemo(() => {
        if (!progress?.length) {
            // sin progreso aún
            const last = attempts?.[0]?.submitted ? String(attempts[0].submitted) : null;
            return { lessonsCompleted: 0, bestScore: 0, lastActivityAt: last, totalLessonsTracked: 0, completionRate: 0 };
        }
        const lessonsCompleted = progress.filter(p => p.completed).length;
        const bestScore = Math.max(0, ...progress.map(p => p.best_score || 0));
        const lastActivityAt = progress
            .map(p => p.last_attempt_at)
            .filter(Boolean)
            .sort()
            .at(-1) || null;
        const totalLessonsTracked = progress.length;
        const completionRate = totalLessonsTracked ? lessonsCompleted / totalLessonsTracked : 0;
        return { lessonsCompleted, bestScore, lastActivityAt, totalLessonsTracked, completionRate };
    }, [progress, attempts]);

    // Actividad reciente: ordenar por intento más nuevo (si el backend no lo hace)
    const recentActivity = useMemo(() => {
        const byTime = [...(attempts || [])].sort((a, b) => {
            const ta = new Date(a.submitted ?? 0).getTime();
            const tb = new Date(b.submitted ?? 0).getTime();
            return tb - ta;
        }).slice(0, 8);
        return byTime;
    }, [attempts]);

    // Recomendaciones simples: cursos publicados ordenados por id (placeholder)
    const recommended = useMemo(() => {
        return (courses || []).filter(c => c.is_published).slice(0, 4);
    }, [courses]);

    return (
        <div className="userdash-bg">
            <div className="userdash-wrap">
                <h2 className="page-title">Tu progreso</h2>
                <p className="text-muted">Hola <b>{me?.email}</b>. Aquí tienes un resumen de tu actividad y recomendaciones.</p>
                {msg && <p className="hint error">{msg}</p>}

                {/* ===== KPIs ===== */}
                <section className="grid-kpis">
                    <div className="kpi-card">
                        <div className="kpi-inner">
                            <div className="kpi-title">Lecciones completadas</div>
                            <div className="kpi-value">
                                {loading ? <span className="kpi-skeleton" /> : summary.lessonsCompleted}
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-inner">
                            <div className="kpi-title">Mejor puntaje</div>
                            <div className="kpi-value">
                                {loading ? <span className="kpi-skeleton" /> : summary.bestScore}
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-inner">
                            <div className="kpi-title">Racha actual</div>
                            <div className="kpi-value">
                                {loading ? <span className="kpi-skeleton" /> : (streak?.current_days ?? 0)}d
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-inner">
                            <div className="kpi-title">Racha histórica</div>
                            <div className="kpi-value">
                                {loading ? <span className="kpi-skeleton" /> : (streak?.longest_days ?? 0)}d
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-inner">
                            <div className="kpi-title">Lecciones totales</div>
                            <div className="kpi-value">
                                {loading ? <span className="kpi-skeleton" /> : summary.totalLessonsTracked}
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-inner">
                            <div className="kpi-title">Completado</div>
                            <div className="kpi-value">
                                {loading ? <span className="kpi-skeleton" /> : `${Math.round(summary.completionRate * 100)}%`}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Barra de progreso global ===== */}
                <section className="e-card">
                    <div className="e-inner">
                        <div className="progress-row">
                            <div className="bar-labels">
                                <div className="bar-title">Progreso global</div>
                                <div className="bar-meta">
                                    {summary.lessonsCompleted} / {Math.max(summary.totalLessonsTracked, summary.lessonsCompleted || 1)} lecciones
                                </div>
                            </div>
                            <div className="bar-track">
                                <div
                                    className="bar-fill"
                                    style={{ width: `${Math.min(100, Math.round(summary.completionRate * 100))}%` }}
                                />
                            </div>
                        </div>

                        <div className="streak-note">
                            🔥 Racha: <b>{streak?.current_days ?? 0} días</b> (mejor: {streak?.longest_days ?? 0}).
                            {summary.lastActivityAt && (
                                <> Última actividad: <span className="muted">{new Date(summary.lastActivityAt).toLocaleString()}</span></>
                            )}
                        </div>
                    </div>
                </section>

                {/* ===== Actividad reciente ===== */}
                <section className="e-card">
                    <div className="e-inner">
                        <div className="section-header">
                            <h3>Actividad reciente</h3>
                            <span className="muted">{recentActivity.length} últimos envíos</span>
                        </div>

                        {loading ? (
                            <div className="skeleton-list">
                                <div className="skl-row" /><div className="skl-row" /><div className="skl-row" />
                            </div>
                        ) : recentActivity.length ? (
                            <div className="table-wrap">
                                <table className="electric-table">
                                    <thead>
                                    <tr>
                                        <th>Cuestionario</th>
                                        <th>Resultado</th>
                                        <th>Tiempo</th>
                                        <th>Fecha</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentActivity.map(a => (
                                        <tr key={a.id}>
                                            <td className="td-title">#{a.exercise_id}</td>
                                            <td>{a.score}{typeof a.is_correct === 'boolean' ? (a.is_correct ? ' ✅' : ' ❌') : ''}</td>
                                            <td className="muted">{a.duration_ms} ms</td>
                                            <td className="muted">{a.submitted ? new Date(a.submitted).toLocaleString() : '—'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="muted">Sin actividad aún. ¡Empieza tu primera lección!</p>
                        )}
                    </div>
                </section>

                {/* ===== Recomendados ===== */}
                <section className="e-card">
                    <div className="e-inner">
                        <div className="section-header">
                            <h3>Recomendados para ti</h3>
                            <span className="muted">{recommended.length} cursos</span>
                        </div>

                        {recommended.length ? (
                            <div className="grid-reco">
                                {recommended.map(c => (
                                    <a key={c.id} className="reco-card" href={`/courses?focus=${c.id}`} title={c.title}>
                                        <div className="reco-title">{c.title}</div>
                                        <div className="reco-meta">
                                            <span>{c.lang.toUpperCase()}</span>
                                            {c.level && <span> • {c.level}</span>}
                                            {c.is_published ? <span className="pill-ok">Publicado</span> : <span className="pill-mute">Borrador</span>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="muted">Aún no hay recomendaciones.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
