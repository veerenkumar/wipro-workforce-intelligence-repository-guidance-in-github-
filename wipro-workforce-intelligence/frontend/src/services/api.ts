import axios from 'axios';
import {
  AnalyticsDashboardResponse,
  BottleneckSummaryResponse,
  RecommendationResponse,
  OptimizationResponse,
  ForecastingResponse,
  AnomalyResponse,
  SystemSettingsSchema,
  DatasetStatus,
  EmployeeDetail
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workforceApi = {
  // Dashboard
  getDashboardSummary: async (weekId?: string, department?: string): Promise<AnalyticsDashboardResponse> => {
    const params = new URLSearchParams();
    if (weekId) params.append('week_id', weekId);
    if (department && department !== 'All Departments') params.append('department', department);
    const res = await api.get<AnalyticsDashboardResponse>(`/dashboard/summary?${params.toString()}`);
    return res.data;
  },

  // Analytics
  getEmployees: async (params?: {
    department?: string;
    role?: string;
    week_id?: string;
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<EmployeeDetail[]> => {
    const p = new URLSearchParams();
    if (params?.department && params.department !== 'All Departments') p.append('department', params.department);
    if (params?.role && params.role !== 'All Roles') p.append('role', params.role);
    if (params?.week_id) p.append('week_id', params.week_id);
    if (params?.status && params.status !== 'All Statuses') p.append('status', params.status);
    if (params?.search) p.append('search', params.search);
    if (params?.limit) p.append('limit', params.limit.toString());
    const res = await api.get<EmployeeDetail[]>(`/analytics/employees?${p.toString()}`);
    return res.data;
  },

  getFilters: async (): Promise<{ departments: string[]; roles: string[]; weeks: string[]; statuses: string[] }> => {
    const res = await api.get('/analytics/filters');
    return res.data;
  },

  // Bottlenecks
  getBottlenecks: async (weekId?: string, department?: string): Promise<BottleneckSummaryResponse> => {
    const params = new URLSearchParams();
    if (weekId) params.append('week_id', weekId);
    if (department && department !== 'All Departments') params.append('department', department);
    const res = await api.get<BottleneckSummaryResponse>(`/bottlenecks?${params.toString()}`);
    return res.data;
  },

  // Recommendations
  getRecommendations: async (status?: string, priority?: string, category?: string): Promise<RecommendationResponse[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (priority && priority !== 'ALL') params.append('priority', priority);
    if (category && category !== 'ALL') params.append('category', category);
    const res = await api.get<RecommendationResponse[]>(`/recommendations?${params.toString()}`);
    return res.data;
  },

  updateRecommendation: async (recId: string, status?: string, notes?: string): Promise<RecommendationResponse> => {
    const res = await api.patch<RecommendationResponse>(`/recommendations/${recId}`, { status, notes });
    return res.data;
  },

  createRecommendation: async (data: any): Promise<RecommendationResponse> => {
    const res = await api.post<RecommendationResponse>('/recommendations', data);
    return res.data;
  },

  // Workload Optimizer
  runOptimizer: async (payload: {
    department?: string;
    max_workload_threshold?: number;
    balance_weights?: number;
  }): Promise<OptimizationResponse> => {
    const res = await api.post<OptimizationResponse>('/optimizer/run', payload);
    return res.data;
  },

  // Forecasting
  getForecasting: async (department?: string): Promise<ForecastingResponse> => {
    const params = new URLSearchParams();
    if (department && department !== 'All Departments') params.append('department', department);
    const res = await api.get<ForecastingResponse>(`/forecasting?${params.toString()}`);
    return res.data;
  },

  // Anomalies
  getAnomalies: async (weekId?: string, department?: string): Promise<AnomalyResponse> => {
    const params = new URLSearchParams();
    if (weekId) params.append('week_id', weekId);
    if (department && department !== 'All Departments') params.append('department', department);
    const res = await api.get<AnomalyResponse>(`/anomalies?${params.toString()}`);
    return res.data;
  },

  // Datasets
  getDatasetStatus: async (): Promise<DatasetStatus> => {
    const res = await api.get<DatasetStatus>('/datasets/status');
    return res.data;
  },

  previewDataset: async (limit: number = 15): Promise<any[]> => {
    const res = await api.get<any[]>(`/datasets/preview?limit=${limit}`);
    return res.data;
  },

  generateSynthetic: async (numEmployees: number = 60, seed: number = 42): Promise<any> => {
    const res = await api.post(`/datasets/generate-synthetic?num_employees=${numEmployees}&seed=${seed}`);
    return res.data;
  },

  uploadCSV: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Reports
  downloadPDFUrl: (weekId?: string) => {
    return `/api/v1/reports/pdf${weekId ? `?week_id=${weekId}` : ''}`;
  },

  downloadCSVUrl: () => {
    return '/api/v1/reports/csv';
  },

  getSummaryJson: async (weekId?: string): Promise<any> => {
    const res = await api.get(`/reports/summary-json${weekId ? `?week_id=${weekId}` : ''}`);
    return res.data;
  },

  // Settings
  getSettings: async (): Promise<SystemSettingsSchema> => {
    const res = await api.get<SystemSettingsSchema>('/settings');
    return res.data;
  },

  updateSettings: async (settings: SystemSettingsSchema): Promise<SystemSettingsSchema> => {
    const res = await api.put<SystemSettingsSchema>('/settings', settings);
    return res.data;
  },

  resetSettings: async (): Promise<SystemSettingsSchema> => {
    const res = await api.post<SystemSettingsSchema>('/settings/reset');
    return res.data;
  },
};
