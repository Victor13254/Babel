import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { endpoints, type Block, type Exercise, type Attempt, type Progress } from '../api';
import { useApi } from '../hooks/useApi';

export default function Lesson() {
    const { lessonId } = useParams();
    const id = useMemo(() => Number(lessonId), [lessonId]);
    const { call } = useApi();

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [msg, setMsg] = useState('');
    const [submitted, setSubmitted] = useState<Record<number, any>>({}); // por ejercicio

    useEffect(() => {
        if (!id) return;
        Promise.all([
            call<Block[]>(endpoints.listBlocks(id)),
            call<Exercise[]>(endpoints.listExercises(id)),
        ])
            .then(([b, e]) => { setBlocks(b); setExercises(e); })
            .catch(e => setMsg(String(e.message || e)));
    }, [id]);

    const onSubmitAttempt = async (ex: Exercise) => {
        try {
            const payload = {
                exercise_id: ex.id,
                submitted: submitted[ex.id] || {},
                duration_ms: 0,
            };
            const a = await call<Attempt>(endpoints.submitAttempt(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setAttempts(prev => [a, ...prev]);
            // Opcional: XP + progreso (MVP)
            if (a.is_correct) {
                await call(endpoints.addXp(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'attempt', delta: 10 }) });
                await call<Progress>(endpoints.upsertProgress(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lesson_id: id, completed: true, best_score: a.score }) });
            }
            setMsg(a.is_correct ? '✅ Correcto' : `❌ Incorrecto (score ${a.score})`);
        } catch (e: any) { setMsg(e.message); }
    };

    return (
        <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Lección #{id}</h2>
            {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'crimson' }}>{msg}</p>}

            <section>
                <h3>Bloques</h3>
                {blocks.map(b => (
                    <div key={b.id} style={{ padding: 8, border: '1px solid #ddd', marginBottom: 8 }}>
                        <strong>{b.type.toUpperCase()}</strong>
                        {b.type === 'text' && <p>{b.text}</p>}
                        {b.type === 'audio' && <audio controls src={b.media?.url} />}
                        {b.type === 'video' && <video controls width={360} src={b.media?.url} />}
                    </div>
                ))}
            </section>

            <section>
                <h3>Ejercicios</h3>
                {exercises.map(ex => (
                    <div key={ex.id} style={{ padding: 8, border: '1px solid #bbb', marginBottom: 12 }}>
                        <div style={{ marginBottom: 6 }}><b>{ex.type.toUpperCase()}</b></div>
                        {ex.type === 'translate' && (
                            <>
                                <div style={{ opacity: 0.8 }}>Traduce: <i>{ex.prompt?.text}</i></div>
                                <input
                                    placeholder="Tu traducción"
                                    value={submitted[ex.id]?.text || ''}
                                    onChange={(e) => setSubmitted(prev => ({ ...prev, [ex.id]: { ...(prev[ex.id] || {}), text: e.target.value } }))}
                                />
                            </>
                        )}
                        {ex.type === 'vocab' && (
                            <>
                                <div>Selecciona la opción correcta</div>
                                <select
                                    value={submitted[ex.id]?.key || ''}
                                    onChange={(e) => setSubmitted(prev => ({ ...prev, [ex.id]: { ...(prev[ex.id] || {}), key: e.target.value } }))}
                                >
                                    <option value="">-- elige --</option>
                                    {(ex.prompt?.options || []).map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </>
                        )}
                        {ex.type === 'listening' && (
                            <>
                                <audio controls src={ex.prompt?.audio_url} />
                                <input
                                    placeholder="Transcripción"
                                    value={submitted[ex.id]?.transcript || ''}
                                    onChange={(e) => setSubmitted(prev => ({ ...prev, [ex.id]: { ...(prev[ex.id] || {}), transcript: e.target.value } }))}
                                />
                            </>
                        )}
                        <div style={{ marginTop: 8 }}>
                            <button onClick={() => onSubmitAttempt(ex)}>Enviar</button>
                        </div>
                    </div>
                ))}
            </section>

            <section>
                <h3>Intentos Recientes</h3>
                <ul>
                    {attempts.map(a => (
                        <li key={a.id}>Ej {a.exercise_id}: {a.is_correct ? '✅' : '❌'} (score {a.score}) {a.feedback ? `- ${a.feedback}` : ''}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
