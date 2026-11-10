import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DateFilterProvider } from './context/DateFilterContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveSensorsPage from './pages/LiveSensorsPage';
import AiPlannerPage from './pages/AiPlannerPage';
import ReportsPage from './pages/ReportsPage';
import AlertsThresholdsPage from './pages/AlertsThresholdsPage';
import DevicesPage from './pages/DevicesPage';

const queryClient = new QueryClient();

// Protected Route Wrapper with AppShell
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DateFilterProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/live"
              element={
                <ProtectedLayout>
                  <LiveSensorsPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/ai-planner"
              element={
                <ProtectedLayout>
                  <AiPlannerPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedLayout>
                  <ReportsPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedLayout>
                  <AlertsThresholdsPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/devices"
              element={
                <ProtectedLayout>
                  <DevicesPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/devices"
              element={
                <ProtectedLayout>
                  <DevicesPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/schedule"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/analytics/forecast"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </DateFilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
