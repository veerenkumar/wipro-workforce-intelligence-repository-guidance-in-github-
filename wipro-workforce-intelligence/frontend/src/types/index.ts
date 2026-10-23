export interface KPISummary {
  avg_productivity_score: number;
  avg_workload_ratio: number;
  total_active_workforce: number;
  total_logged_hours: number;
  total_capacity_hours: number;
  total_overtime_hours: number;
  avg_absenteeism_days: number;
  task_completion_rate: number;
  avg_quality_score: number;
  avg_client_csat: number;
  overloaded_count: number;
  underutilized_count: number;
  optimal_count: number;
  burnout_risk_count: number;
  operational_alert_level: 'Normal' | 'Moderate' | 'Elevated' | 'Critical';
}

export interface TrendPoint {
  week_id: string;
  productivity: number;
  workload_ratio: number;
  overtime_hours: number;
  task_completion_rate: number;
  rework_rate: number;
  csat: number;
}

export interface DepartmentMetric {
  department: string;
  employee_count: number;
  avg_productivity: number;
  avg_workload_ratio: number;
  total_overtime: number;
  avg_csat: number;
  rework_rate: number;
  status: string;
}

export interface RoleDistribution {
  role: string;
  count: number;
  avg_productivity: number;
  avg_workload_ratio: number;
}

export interface EmployeeDetail {
  id?: number;
  employee_id: string;
  name: string;
  role: string;
  department: string;
  experience_years: number;
  weekly_capacity_hours: number;
  logged_hours: number;
  completed_tasks: number;
  assigned_tasks: number;
  backlog_tasks: number;
  quality_rework_rate: number;
  client_csat: number;
  overtime_hours: number;
  absenteeism_days: number;
  skills: string;
  week_id: string;
  productivity_score: number;
  workload_ratio: number;
  status_category: 'Balanced' | 'Overloaded' | 'Underutilized' | 'Burnout Risk' | string;
}

export interface AnalyticsDashboardResponse {
  kpis: KPISummary;
  weekly_trends: TrendPoint[];
  department_metrics: DepartmentMetric[];
  role_distribution: RoleDistribution[];
  workload_distribution: Record<string, number>;
  top_performers: EmployeeDetail[];
  at_risk_employees: EmployeeDetail[];
}

export interface BottleneckItem {
  id: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  department: string;
  affected_count: number;
  affected_entities: string[];
  description: string;
  root_cause: string;
  impact_metrics: string;
  estimated_weekly_loss_hours: number;
  recommended_action: string;
}

export interface BottleneckSummaryResponse {
  total_bottlenecks: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  estimated_total_loss_hours: number;
  bottlenecks: BottleneckItem[];
}

export interface RecommendationResponse {
  id: number;
  rec_id: string;
  title: string;
  category: string;
  target_type: string;
  target_name: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  description: string;
  evidence: string;
  projected_impact: string;
  effort_estimate: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  task_id: string;
  task_title: string;
  assigned_employee_id: string;
  assigned_employee_name: string;
  required_skill: string;
  allocated_hours: number;
  priority: number;
  match_status: string;
}

export interface EngineerWorkloadShift {
  employee_id: string;
  name: string;
  initial_hours: number;
  initial_workload_ratio: number;
  added_hours: number;
  optimized_hours: number;
  optimized_workload_ratio: number;
  status_before: string;
  status_after: string;
}

export interface OptimizationResponse {
  status: string;
  solver_message: string;
  total_tasks_assigned: number;
  unassigned_tasks_count: number;
  avg_workload_ratio_before: number;
  avg_workload_ratio_after: number;
  workload_variance_reduction_percent: number;
  assignments: TaskAssignment[];
  workload_shifts: EngineerWorkloadShift[];
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2_score: number;
  baseline_mae: number;
  relative_improvement_pct: number;
  split_strategy: string;
  train_samples_count: number;
  test_samples_count: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  shap_value: number;
  description: string;
}

export interface ForecastPoint {
  period: string;
  historical_actual?: number;
  predicted_productivity: number;
  predicted_lower_bound: number;
  predicted_upper_bound: number;
  confidence_level: number;
}

export interface DepartmentForecast {
  department: string;
  current_productivity: number;
  forecasted_next_month: number;
  expected_change_pct: number;
  projected_risk_level: 'High' | 'Moderate' | 'Low';
}

export interface ForecastingResponse {
  status: string;
  algorithm: string;
  evaluation: ModelMetrics;
  feature_importances: FeatureImportance[];
  timeline_forecasts: ForecastPoint[];
  department_forecasts: DepartmentForecast[];
  shap_summary_insights: string[];
}

export interface AnomalyRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  role: string;
  week_id: string;
  anomaly_score: number;
  anomaly_type: string;
  detected_features: string[];
  explanation: string;
  suggested_investigation: string;
}

export interface AnomalyResponse {
  total_anomalies: number;
  contamination_rate: number;
  high_severity_count: number;
  anomalies_by_department: Record<string, number>;
  anomalies: AnomalyRecord[];
}

export interface SystemSettingsSchema {
  weight_task_completion: number;
  weight_quality: number;
  weight_csat: number;
  weight_adherence: number;
  threshold_underutilized: number;
  threshold_optimal_max: number;
  threshold_overload_warning: number;
  threshold_critical_burnout: number;
  anonymize_employee_data: boolean;
  mask_salary_or_sensitive: boolean;
  auto_trigger_optimizer: boolean;
  anomaly_sensitivity: number;
}

export interface DatasetStatus {
  is_loaded: boolean;
  total_records: number;
  unique_employees: number;
  weeks: string[];
  departments: string[];
}
