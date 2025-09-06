import { Routes, Route, Navigate } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardUser from './pages/DashboardUser';
import DashboardAdmin from './pages/DashboardAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import Courses from './pages/Courses';
import Lesson from './pages/Lesson';
import ProfilePage from './pages/Profile';
import CommunityPage from './pages/Community';
import Navbar from './components/Navbar';
import AdminCourses from "./pages/AdminCourses.tsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Autenticado (cualquier rol) */}
            <Route
                path="/courses"
                element={<ProtectedRoute role="user"><Navbar /><Courses /></ProtectedRoute>}
            />
            <Route
                path="/admin/courses"
                element={<ProtectedRoute role="admin"><Navbar /><AdminCourses /></ProtectedRoute>}
            />
            <Route
                path="/lesson/:lessonId"
                element={<ProtectedRoute role="user"><Navbar /><Lesson /></ProtectedRoute>}
            />
            <Route
                path="/profile"
                element={<ProtectedRoute role="user"><Navbar /><ProfilePage /></ProtectedRoute>}
            />
            <Route
                path="/community"
                element={<ProtectedRoute role="user"><Navbar /><CommunityPage /></ProtectedRoute>}
            />

            {/* Dashboards */}
            <Route
                path="/dashboard/user"
                element={<ProtectedRoute role="user"><Navbar /><DashboardUser /></ProtectedRoute>}
            />
            <Route
                path="/dashboard/admin"
                element={<ProtectedRoute role="admin"><Navbar /><DashboardAdmin /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
