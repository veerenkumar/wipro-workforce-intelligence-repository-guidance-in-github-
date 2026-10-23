# Wipro Workforce Productivity & Workload Intelligence Agent
## Architectural Specification & Intelligence Framework

### 1. System Overview
The **Wipro Workforce Productivity & Workload Intelligence Agent** is an enterprise AI decision-support platform designed to monitor workforce velocity, quantify capacity saturation, proactively detect operational bottlenecks, forecast future productivity via supervised machine learning with SHAP explainability, and mathematically optimize task redistributions using Google OR-Tools.

```
+-------------------------------------------------------------------------+
|                  React 18 + Vite + TypeScript SPA                       |
|  - Executive Dashboard           - AI Recommendations Lifecycle         |
|  - Workforce Analytics Table     - Workload Optimizer (OR-Tools)        |
|  - Operational Bottlenecks       - Productivity Forecast (SHAP / RF)    |
|  - Anomaly Outliers (IsoForest)  - Dataset Ingestion & Reports Export   |
+------------------------------------+------------------------------------+
                                     |  REST APIs (Axios / JSON / PDF)
                                     v
+------------------------------------+------------------------------------+
|                      FastAPI Modular Backend Layer                      |
|  - CORS & Pydantic Validation    - Chronological Train/Test Engine     |
|  - Weighted Scoring Engine       - TreeExplainer SHAP Feature Importances|
|  - Constraint Solver (OR-Tools)  - Isolation Forest Outlier Analysis   |
|  - SQLite + SQLAlchemy Model     - ReportLab Executive PDF Generator   |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------+------------------------------------+
|               Wipro Synthetic Enterprise Store (SQLite)                |
|  - Cloud Infrastructure          - Cybersecurity & Risk Services       |
|  - Enterprise Applications & SAP - BFSI Digital Banking & Payments     |
|  - Data Analytics & AI           - Healthcare & Life Sciences Digital  |
+-------------------------------------------------------------------------+
```

### 2. Algorithmic Models & Mathematical Formulations

#### 2.1 Configurable Weighted Productivity Scoring
The composite productivity score $P \in [0, 100]$ combines four weighted performance vectors:
$$P = \frac{w_{\text{comp}} \cdot S_{\text{comp}} + w_{\text{qual}} \cdot S_{\text{qual}} + w_{\text{csat}} \cdot S_{\text{csat}} + w_{\text{adh}} \cdot S_{\text{adh}}}{w_{\text{comp}} + w_{\text{qual}} + w_{\text{csat}} + w_{\text{adh}}}$$
Where:
- $S_{\text{comp}} = \min(100, \frac{\text{Completed Tasks}}{\max(1, \text{Assigned Tasks})} \times 100)$
- $S_{\text{qual}} = \max(0, (1 - \text{Quality Rework Rate}) \times 100)$
- $S_{\text{csat}} = \frac{\text{CSAT}}{5.0} \times 100$
- $S_{\text{adh}} = \max(20, 100 - |\text{Workload Ratio} - 1.0| \times 40)$

#### 2.2 Google OR-Tools Workload Allocation Optimizer
Modeled as an Integer Linear Programming (MILP) problem solved via Google OR-Tools:
- **Decision Variables**: $x_{ij} \in \{0, 1\}$ denoting whether task $i$ is assigned to engineer $j$.
- **Skill Constraint**: $x_{ij} = 0 \quad \forall j \notin \text{EligibleEngineers}(i)$.
- **Single Assignment**: $\sum_j x_{ij} \le 1 \quad \forall i$.
- **Capacity Constraint**: $\text{LoggedHours}_j + \sum_i \text{Hours}_i \cdot x_{ij} \le \text{Capacity}_j \cdot \theta_{\max} + \delta$.
- **Objective Function**: Maximize task priority throughput while penalizing assignments to already saturated resources:
  $$\max \sum_{i, j} (\text{Priority}_i \cdot 10 - \text{Penalty}_j) \cdot x_{ij}$$

#### 2.3 Chronological Random Forest Forecasting & SHAP Attribution
- **Feature Matrix**: Experience years, weekly capacity, logged hours, completed/assigned/backlog tasks, rework rate, CSAT, overtime hours, absenteeism.
- **Chronological Split**: Out-of-time evaluation trained strictly on earlier weeks $[W_{28}, W_{37}]$ and evaluated against future holdout weeks $[W_{38}, W_{39}]$. Zero future data leakage.
- **Evaluation**: Honest MAE, RMSE, and $R^2$ benchmarked against rolling mean historical baselines.
- **SHAP (SHapley Additive exPlanations)**: TreeExplainer decomposes individual feature attributions $\phi_k$ to prove which variables drive velocity deviations.

#### 2.4 Isolation Forest Anomaly Detection
Detects multidimensional deviations across overtime spikes, abnormal backlog inflation, and acute burnout correlations using recursive partition depth anomalies normalized onto a $[0, 100]\%$ severity scale.
