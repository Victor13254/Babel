export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
export const Api = `${API_BASE}/api`;

export type TokenResponse = { access_token: string; token_type: 'bearer' };
export type MeResponse = { id: number; email: string; is_active: boolean; role: 'admin' | 'user' };

export async function loginApi(email: string, password: string) {
    const form = new URLSearchParams();
    form.append('username', email.trim());
    form.append('password', password);
    const res = await fetch(`${Api}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    const data = (await res.json()) as TokenResponse;
    if (!data.access_token) throw new Error('Respuesta sin token');
    return data.access_token;
}

// api.ts
export type RegisterFullPayload = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    username: string;
    age: number;
    country: string;
    native_lang: string;
    target_lang: string;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    daily_goal_min: number;
    accept_terms?: boolean; // opcional; si tu backend no lo usa, lo ignora
};

export async function registerApi(payload: RegisterFullPayload) {
    const res = await fetch(`${Api}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (res.status === 409) throw new Error("El email ya está registrado");
    if (res.status === 422) throw new Error("Datos inválidos");
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return (await res.json()) as { id: number; email: string };
}


export async function meApi(token: string) {
    const res = await fetch(`${Api}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Token inválido/expirado');
    return (await res.json()) as MeResponse;
}

/** ---------- Types para cursos/contenido/práctica ---------- */
export type Course = { id: number; title: string; lang: string; level?: string | null; is_published: boolean };
export type Module = { id: number; course_id: number; title: string; position: number };
export type Lesson = { id: number; module_id: number; title: string; position: number; summary?: string | null };
export type Block = { id: number; lesson_id: number; type: 'image'| 'text' | 'audio' | 'video'; position: number; text?:string; media_id?: number;media?: Media;};
export type Exercise = {
    id: number;
    lesson_id: number;
    type: 'translate' | 'vocab' | 'listening';
    prompt: any;
    answer: any;
    config?: any;
};
export type Attempt = {
    id: number;
    exercise_id: number;
    user_id: number;
    is_correct: boolean;
    score: number;
    feedback?: string | null;
    duration_ms: number;
    submitted: any;
};

/** ---------- Types para progreso/gamificación ---------- */
export type Progress = {
    user_id: number;
    lesson_id: number;
    completed: boolean;
    best_score: number;
    last_attempt_at?: string | null;
};
export type Streak = { user_id: number; current_days: number; longest_days: number; last_day?: string | null };

/** ---------- Types comunidad/perfiles ---------- */
export type Thread = { id: number; title: string; course_id?: number | null; lesson_id?: number | null; author_id: number; pinned: boolean };
export type Post = { id: number; thread_id: number; author_id: number; body_md: string; parent_post_id?: number | null };
export type Profile = {
    user_id: number; display_name?: string | null; native_lang?: string | null; target_lang?: string | null;
    target_level?: string | null; avatar_url?: string | null; preferences?: any;
};
// --- ya tienes Api y types arriba ---

export type NewCourse = { title: string; lang: string; level?: string | null; is_published?: boolean };
export type NewModule = { course_id: number; title: string; position?: number };
export type NewLesson = { module_id: number; title: string; position?: number; summary?: string | null };
export type NewBlock = {
    lesson_id: number;
    type: 'image' | 'text' | 'audio' | 'video';
    position?: number;
    text?: string;
    media_id?: number;
};

export type Media = {
    id: number;
    url: string;
    kind: 'image' | 'audio' | 'video';
    meta?: any;
};

export type NewMedia = {
    kind: 'image' | 'audio' | 'video';
    url: string;
    meta?: any;
};

export async function uploadMediaApi(file: File): Promise<Media> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(mediaEndpoints.upload(), {
        method: 'POST',
        body: form,
    });
    if (!res.ok) throw new Error(`Error ${res.status} al subir media`);
    return (await res.json()) as Media;
}

export const adminEndpoints = {
    // courses
    createCourse: () => `${Api}/courses/`,
    updateCourse: (id: number) => `${Api}/courses/${id}`,
    deleteCourse: (id: number) => `${Api}/courses/${id}`,

    // modules
    createModule: () => `${Api}/courses/modules`,
    updateModule: (id: number) => `${Api}/courses/modules/${id}`,
    deleteModule: (id: number) => `${Api}/courses/modules/${id}`,

    // lessons
    createLesson: () => `${Api}/courses/lessons`,
    updateLesson: (id: number) => `${Api}/courses/lessons/${id}`,
    deleteLesson: (id: number) => `${Api}/courses/lessons/${id}`,

    // blocks
    createBlock: () => `${Api}/courses/blocks`,
    updateBlock: (id: number) => `${Api}/courses/blocks/${id}`,
    deleteBlock: (id: number) => `${Api}/courses/blocks/${id}`,
};
export const mediaEndpoints = {
    list: () => `${Api}/media/`,
    upload: () => `${Api}/media/upload`, // 👈 nuevo endpoint para subir archivos
};
/** ---------- Helpers (Authed) se consumen con useApi ---------- */
// api.ts
export const endpoints = {
    // courses
    listPublicCourses: () => `${Api}/courses/`,             // 👈 barra final
    listModules: (courseId: number) => `${Api}/courses/${courseId}/modules/`,
    listLessons: (moduleId: number) => `${Api}/courses/modules/${moduleId}/lessons/`,
    listBlocks: (lessonId: number) => `${Api}/courses/lessons/${lessonId}/blocks/`,
    // exercises
    listExercises: (lessonId: number) => `${Api}/exercises/lesson/${lessonId}`, // este ya es “/lesson/:id” fijo
    submitAttempt: () => `${Api}/exercises/attempts`,
    myAttempts: (exerciseId?: number) => `${Api}/exercises/attempts/me${exerciseId ? `?exercise_id=${exerciseId}` : ''}`,
    // progress
    myProgress: () => `${Api}/progress/me`,
    upsertProgress: () => `${Api}/progress/upsert`,
    addXp: () => `${Api}/progress/xp`,
    streakMe: () => `${Api}/progress/streak/me`,
    // community
    listThreads: (courseId?: number, lessonId?: number) => {
        const qs = new URLSearchParams();
        if (courseId) qs.set('course_id', String(courseId));
        if (lessonId) qs.set('lesson_id', String(lessonId));
        const q = qs.toString();
        return `${Api}/community/threads${q ? `?${q}` : ''}/`; // 👈 barra final después del query
    },
    createThread: () => `${Api}/community/threads`,
    listPosts: (threadId: number) => `${Api}/community/threads/${threadId}/posts`,
    createPost: () => `${Api}/community/posts`,
    // profiles
    getMyProfile: () => `${Api}/profiles/me`,
    updateMyProfile: () => `${Api}/profiles/me`,
    // media
    listMedia: () => `${Api}/media`,
};
