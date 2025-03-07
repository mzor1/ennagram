import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import DealerDashboard from './pages/dealer/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import EnneagramTest from './pages/student/EnneagramTest';
import TestResults from './pages/student/TestResults';
import ManageDealers from './pages/admin/ManageDealers';
import ManageStudents from './pages/dealer/ManageStudents';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dealers" element={
                <ProtectedRoute requiredRole="admin">
                  <ManageDealers />
                </ProtectedRoute>
              } />
              
              {/* Dealer routes */}
              <Route path="/dealer" element={
                <ProtectedRoute requiredRole="dealer">
                  <DealerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dealer/students" element={
                <ProtectedRoute requiredRole="dealer">
                  <ManageStudents />
                </ProtectedRoute>
              } />
              
              {/* Student routes */}
              <Route path="/student" element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/test" element={
                <ProtectedRoute requiredRole="student">
                  <EnneagramTest />
                </ProtectedRoute>
              } />
              <Route path="/results" element={
                <ProtectedRoute requiredRole="student">
                  <TestResults />
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;