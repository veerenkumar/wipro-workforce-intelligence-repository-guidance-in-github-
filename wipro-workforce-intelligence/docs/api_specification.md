# REST API Specification
## Base URL: `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Aggregated executive KPIs, weekly velocity trends, department metrics |
| `GET` | `/analytics/employees` | Searchable and filterable employee records list with pagination |
| `GET` | `/analytics/filters` | Distinct filter options (practices, roles, sprint weeks, statuses) |
| `GET` | `/bottlenecks` | Operational bottleneck detection, root causes, and weekly loss hours |
| `GET` | `/recommendations` | AI recommendations filtered by status, priority, or category |
| `POST` | `/recommendations` | Propose custom operational intervention |
| `PATCH` | `/recommendations/{rec_id}` | Update recommendation status (PENDING, APPROVED, REJECTED, COMPLETED) |
| `POST` | `/optimizer/run` | Execute Google OR-Tools workload redistribution with skill/capacity bounds |
| `GET` | `/forecasting` | Scikit-learn Random Forest forecasting metrics, timeline bands, and SHAP importances |
| `GET` | `/anomalies` | Isolation Forest unsupervised workforce behavioral outlier detection |
| `GET` | `/datasets/status` | SQLite database store status and row counts |
| `GET` | `/datasets/preview` | Live sample preview of database records |
| `POST` | `/datasets/generate-synthetic` | Generate and ingest multi-sprint synthetic Wipro-inspired dataset |
| `POST` | `/datasets/upload` | Upload custom CSV file with schema validation |
| `GET` | `/reports/pdf` | Export styled executive PDF dossier (ReportLab) |
| `GET` | `/reports/csv` | Export complete workforce records as CSV |
| `GET` | `/reports/summary-json` | JSON structured summary of KPIs and bottlenecks |
| `GET` | `/settings` | Retrieve active scoring weights and threshold configurations |
| `PUT` | `/settings` | Update settings and trigger immediate recalculation of all scores |
| `POST` | `/settings/reset` | Restore settings to enterprise factory defaults |
