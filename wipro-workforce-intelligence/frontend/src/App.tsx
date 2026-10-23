import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { WorkforceAnalytics } from './pages/WorkforceAnalytics';
import { BottleneckDetection } from './pages/BottleneckDetection';
import { AIRecommendations } from './pages/AIRecommendations';
import { WorkloadOptimizer } from './pages/WorkloadOptimizer';
import { ProductivityForecasting } from './pages/ProductivityForecasting';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { DatasetManagement } from './pages/DatasetManagement';
import { ReportsExport } from './pages/ReportsExport';
import { SystemSettings } from './pages/SystemSettings';
import { workforceApi } from './services/api';
import { AnalyticsDashboardResponse } from './types';

export const AppContent: React.FC = () => {
  const location = useLocation();

  // Global filters
  const [selectedWeek, setSelectedWeek] = useState<string>('2026-W39');
  const [availableWeeks, setAvailableWeeks] = useState<string[]>(['2026-W39', '2026-W38', '2026-W37']);
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  // Shared dashboard state
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load filters
  const loadFilters = async () => {
    try {
      const filters = await workforceApi.getFilters();
      if (filters.weeks && filters.weeks.length > 0) {
        setAvailableWeeks(filters.weeks);
        setSelectedWeek((prev) => (filters.weeks.includes(prev) ? prev : filters.weeks[filters.weeks.length - 1]));
      }
      if (filters.departments && filters.departments.length > 0) {
        setAvailableDepts(filters.departments);
      }
    } catch (e) {
      console.error('Failed to load filters:', e);
    }
  };

  const loadDashboard = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await workforceApi.getDashboardSummary(
        selectedWeek,
        selectedDept !== 'All Departments' ? selectedDept : undefined
      );
      setDashboardData(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to connect to workforce API');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [selectedWeek, selectedDept]);

  // Page title mapping
  const pageMeta: Record<string, { title: string; subtitle: string }> = {
    '/': {
      title: 'Executive Workforce Dashboard',
      subtitle: 'Real-time velocity, capacity saturation, and operational risks'
    },
    '/analytics': {
      title: 'Workforce Productivity Analytics',
      subtitle: 'Granular personnel benchmarks, task completion, and quality metrics'
    },
    '/bottlenecks': {
      title: 'Operational Bottleneck Detection',
      subtitle: 'Root-cause diagnosis of overload, delays, and capacity drag'
    },
    '/recommendations': {
      title: 'AI Recommendations & Interventions',
      subtitle: 'Actionable intervention lifecycle linking diagnostics to impact'
    },
    '/optimizer': {
      title: 'Google OR-Tools Workload Optimizer',
      subtitle: 'Constrained task redistribution resolving capacity strain'
    },
    '/forecasting': {
      title: 'Productivity Forecasting & SHAP Attribution',
      subtitle: 'Chronologically evaluated Random Forest projections'
    },
    '/anomalies': {
      title: 'Workforce Anomaly Detection',
      subtitle: 'Isolation Forest detection of behavioral and workload outliers'
    },
    '/datasets': {
      title: 'Dataset Ingestion & Management',
      subtitle: 'CSV upload schema validation and synthetic generation'
    },
    '/reports': {
      title: 'Reports & Intelligence Exports',
      subtitle: 'Executive PDF dossiers, raw CSV datasets, and printable briefs'
    },
    '/settings': {
      title: 'System Settings & Scoring Weights',
      subtitle: 'Configurable weighted productivity formulas and privacy thresholds'
    }
  };

  const currentMeta = pageMeta[location.pathname] || pageMeta['/'];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          selectedWeek={selectedWeek}
          availableWeeks={availableWeeks}
          onWeekChange={setSelectedWeek}
          selectedDept={selectedDept}
          availableDepts={availableDepts}
          onDeptChange={setSelectedDept}
          alertLevel={dashboardData?.kpis?.operational_alert_level || 'Normal'}
          onRefresh={loadDashboard}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <ExecutiveDashboard
                  data={dashboardData}
                  loading={loading}
                  error={error}
                  onRefresh={loadDashboard}
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <WorkforceAnalytics
                  selectedWeek={selectedWeek}
                  selectedDept={selectedDept}
                />
              }
            />
            <Route
              path="/bottlenecks"
              element={
                <BottleneckDetection
                  selectedWeek={selectedWeek}
                  selectedDept={selectedDept}
                />
              }
            />
            <Route path="/recommendations" element={<AIRecommendations />} />
            <Route
              path="/optimizer"
              element={
                <WorkloadOptimizer
                  selectedDept={selectedDept}
                  availableDepts={availableDepts}
                />
              }
            />
            <Route
              path="/forecasting"
              element={<ProductivityForecasting selectedDept={selectedDept} />}
            />
            <Route
              path="/anomalies"
              element={
                <AnomalyDetection
                  selectedWeek={selectedWeek}
                  selectedDept={selectedDept}
                />
              }
            />
            <Route
              path="/datasets"
              element={
                <DatasetManagement
                  onDatasetReload={() => {
                    loadFilters();
                    loadDashboard();
                  }}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <ReportsExport
                  selectedWeek={selectedWeek}
                  selectedDept={selectedDept}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SystemSettings
                  onSettingsSaved={() => {
                    loadDashboard();
                  }}
                />
              }
            />
            <Route
              path="*"
              element={
                <ExecutiveDashboard
                  data={dashboardData}
                  loading={loading}
                  error={error}
                  onRefresh={loadDashboard}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
