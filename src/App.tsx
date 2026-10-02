import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';

import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LevelPage } from './pages/LevelPage';
import { CategoryPage } from './pages/CategoryPage';
import { GlobalProgressPage } from './pages/GlobalProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-japan-indigo-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-japanese font-semibold text-japan-charcoal-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Main Authenticated Platform Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Dynamic JLPT Level Routes (N5 - N1) */}
        <Route path="level/:levelId" element={<LevelPage />} />

        {/* Dynamic Category Routes (Kanji, Vocabulary, Grammar, Other) with sub-tabs */}
        <Route path="level/:levelId/:categoryId" element={<CategoryPage />} />
        <Route path="level/:levelId/:categoryId/:tab" element={<CategoryPage />} />

        {/* Global Progress & Diagnostics */}
        <Route path="progress" element={<GlobalProgressPage />} />

        {/* User Settings & Data Management */}
        <Route path="settings" element={<SettingsPage />} />

        {/* User Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
