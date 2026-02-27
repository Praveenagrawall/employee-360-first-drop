import { Routes, Route } from 'react-router-dom';
import { PageLayout } from './components/layout';
import { ProtectedRoute } from './components/common';

// ─── Pages ─────────────────────────────────────────────────────────────
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import OrgChartPage from './pages/OrgChartPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PerformanceOverviewPage from './pages/PerformanceOverviewPage';
import FeedbackPage from './pages/FeedbackPage';
import AllocationRequestsPage from './pages/AllocationRequestsPage';
import NotFoundPage from './pages/NotFoundPage';
import OwnProfilePage from './pages/OwnProfilePage';

export default function App() {
  return (
    <Routes>
      {/* ── Public-ish routes (all authenticated users) ───────────── */}
      <Route path="/" element={<PageLayout><DashboardPage /></PageLayout>} />
      <Route path="/dashboard" element={<PageLayout><DashboardPage /></PageLayout>} />
      <Route path="/employees" element={<PageLayout><EmployeesPage /></PageLayout>} />
      <Route path="/employees/:id" element={<PageLayout><EmployeeProfilePage /></PageLayout>} />
      <Route path="/projects" element={<PageLayout><ProjectsPage /></PageLayout>} />
      <Route path="/projects/:id" element={<PageLayout><ProjectDetailPage /></PageLayout>} />

      {/* Own profile — shortcut route */}
      <Route path="/profile" element={<PageLayout><OwnProfilePage /></PageLayout>} />

      {/* ── Manager+ routes (level ≥ 4) ──────────────────────────── */}
      <Route path="/performance" element={
        <PageLayout>
          <ProtectedRoute minLevel={4}>
            <PerformanceOverviewPage />
          </ProtectedRoute>
        </PageLayout>
      } />
      <Route path="/feedback" element={
        <PageLayout>
          <ProtectedRoute minLevel={4}>
            <FeedbackPage />
          </ProtectedRoute>
        </PageLayout>
      } />
      <Route path="/allocation-requests" element={
        <PageLayout>
          <ProtectedRoute minLevel={4}>
            <AllocationRequestsPage />
          </ProtectedRoute>
        </PageLayout>
      } />

      {/* ── Leadership routes (level ≥ 6 / permission) ───────────── */}
      <Route path="/analytics" element={
        <PageLayout>
          <ProtectedRoute permission="VIEW_ORG_ANALYTICS">
            <AnalyticsPage />
          </ProtectedRoute>
        </PageLayout>
      } />
      <Route path="/org-chart" element={
        <PageLayout>
          <ProtectedRoute minLevel={6}>
            <OrgChartPage />
          </ProtectedRoute>
        </PageLayout>
      } />

      {/* ── 404 ─────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
