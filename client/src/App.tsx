import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ページコンポーネント
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import FamilyMembers from './pages/FamilyMembers';

// コンテキスト
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 保護されたルートコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// 認証済みユーザー用のルートコンポーネント
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('AuthRoute: isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// メインAppコンポーネント
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  console.log('AppContent: isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/family-members" 
          element={
            <ProtectedRoute>
              <FamilyMembers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App; 