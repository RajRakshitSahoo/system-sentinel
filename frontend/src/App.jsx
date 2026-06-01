import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SystemOverview from './pages/SystemOverview';
import ProcessManager from './pages/ProcessManager';
import NetworkMonitor from './pages/NetworkMonitor';
import StorageAnalyzer from './pages/StorageAnalyzer';
import BatteryMonitor from './pages/BatteryMonitor';
import HardwareMonitor from './pages/HardwareMonitor';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import EventTimeline from './pages/EventTimeline';
import Productivity from './pages/Productivity';
import Security from './pages/Security';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center">
        <div className="font-display text-2xl mb-4" style={{ color: 'var(--color-primary)' }}>SYSTEM SENTINEL</div>
        <div className="flex gap-1 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="scan-line" />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '14px',
                },
                duration: 4000,
              }}
            />
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="system" element={<SystemOverview />} />
                <Route path="processes" element={<ProcessManager />} />
                <Route path="network" element={<NetworkMonitor />} />
                <Route path="storage" element={<StorageAnalyzer />} />
                <Route path="battery" element={<BatteryMonitor />} />
                <Route path="hardware" element={<HardwareMonitor />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="events" element={<EventTimeline />} />
                <Route path="productivity" element={<Productivity />} />
                <Route path="security" element={<Security />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
