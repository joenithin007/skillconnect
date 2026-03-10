import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Students from './pages/Students';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import MyRequests from './pages/MyRequests';
import Achievements from './pages/Achievements';
import Messages from './pages/Messages';
import Friends from './pages/Friends';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#6c63ff',fontSize:'1.2rem'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin')  return <AdminDashboard />;
  if (user.role === 'staff')  return <FacultyDashboard />;
  return <StudentDashboard />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard"  element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
        <Route path="/projects"   element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
        <Route path="/students"   element={<PrivateRoute roles={['staff','admin']}><Students /></PrivateRoute>} />
        <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/requests"   element={<PrivateRoute><MyRequests /></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute roles={['student']}><Achievements /></PrivateRoute>} />
        <Route path="/messages"   element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/friends"    element={<PrivateRoute><Friends /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
