# Wipro Workforce Productivity & Workload Intelligence Agent

An enterprise AI application designed for workforce capacity planning, predictive productivity forecasting, operational bottleneck diagnosis, and automated workload allocation optimization.

> **Disclaimer**: This application operates exclusively with synthetic workforce datasets generated for operational simulation and algorithmic demonstration. It does not represent or reference actual internal employee records of Wipro Limited.

---

## Key Features

1. **Executive Dashboard** — Real-time productivity KPIs, workload-to-capacity ratios, overtime volume, absenteeism trends, task completion rate, and operational alert level badges (`Normal`, `Moderate`, `Elevated`, `Critical`).
2. **Workforce Analytics** — Interactive Recharts visualizations of role-level velocity and headcount distribution, filterable by practice, role, sprint week, and status, with search, multi-field sorting, pagination, and engineer profile inspector.
3. **Bottleneck Detection** — Explainable detection of capacity overload, sprint backlog accumulation, single-point-of-failure skill deficits, code defect loops, and burnout attrition risks with quantifiable weekly capacity loss hours and root-cause analysis.
4. **AI Recommendations** — Evidence-based interventions linking detected bottlenecks to actionable resolutions with a complete lifecycle management workflow (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`) and custom proposal creation.
5. **Workload Optimizer (Google OR-Tools)** — Constrained mathematical programming (MILP) allocating pending sprint tasks based on engineer skillset matches, capacity ceilings, priority weights, and workload variance minimization with before-and-after visual comparisons.
6. **Productivity Forecasting & SHAP Attribution** — Scikit-learn Random Forest regression model trained on strict chronological sprint splits with honest evaluation metrics (MAE, RMSE, $R^2$, rolling mean baseline comparison), forward multi-sprint timeline forecasts with 90% confidence bands, and SHAP TreeExplainer feature attributions.
7. **Anomaly Detection (Isolation Forest)** — Unsupervised multi-variable behavioral anomaly detection isolating unusual overtime-quality decouplings, phantom backlog spikes, and acute burnout signals with normalized severity meters (0–100%) and Z-score signals.
8. **Dataset Management** — SQLite database status inspector, drag-and-drop CSV uploader with schema validation, configurable multi-sprint synthetic dataset generator (custom headcount and random seed), and database records preview.
9. **Reports & Exports** — Audit-ready executive PDF dossier generation via ReportLab, complete workforce CSV dataset export, structured JSON summaries, and printable in-browser management assessment briefs.
10. **System Settings** — Configurable weighted productivity scoring sliders (Task Completion, Quality, CSAT, Schedule Adherence with live sum validation), workload classification thresholds, privacy anonymization controls, and anomaly sensitivity tuning with instant database recalculation.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Router, Axios, Lucide React, Vitest, React Testing Library.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, pandas, NumPy, scikit-learn, SHAP, Google OR-Tools, SQLAlchemy, SQLite, ReportLab, pytest, httpx.

---

## Monorepo Directory Structure

```
wipro-workforce-intelligence/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/       # REST API endpoint routers
│   │   │   └── router.py        # Consolidated API router
│   │   ├── core/                # Database engine & settings configuration
│   │   ├── models/              # SQLAlchemy data models
│   │   ├── schemas/             # Pydantic schemas and validation
│   │   ├── services/            # Algorithms, ML forecasting, OR-Tools, SHAP
│   │   └── main.py              # FastAPI app entrypoint
│   ├── tests/                   # Pytest test suite (11 test suites)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Sidebar, Navbar, KPICard, StatusBadge
│   │   ├── pages/               # 10 core feature pages
│   │   ├── services/            # Typed Axios API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── test/                # Vitest & React Testing Library tests
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── data/
│   └── synthetic/               # Generated Wipro-inspired synthetic datasets
├── docs/
│   ├── architecture.md          # Architectural and mathematical formulations
│   └── api_specification.md    # REST API endpoints reference
├── scripts/
│   ├── start_backend.sh         # macOS backend launcher
│   ├── start_frontend.sh        # macOS frontend launcher
│   └── run_tests.sh             # End-to-end test runner
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Installation & Running Instructions (macOS)

### Terminal 1: Start the FastAPI Backend

```bash
cd /Users/veerenkumarkonchada/.gemini/antigravity-ide/scratch/wipro-workforce-intelligence

# Install Python requirements if needed
python3 -m pip install -r backend/requirements.txt

# Launch FastAPI on http://127.0.0.1:8000
./scripts/start_backend.sh
```

- Interactive OpenAPI Swagger documentation: `http://127.0.0.1:8000/docs`

### Terminal 2: Start the React Frontend

```bash
cd /Users/veerenkumarkonchada/.gemini/antigravity-ide/scratch/wipro-workforce-intelligence/frontend

# Ensure Node v20 is used
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"

# Install frontend dependencies if needed
npm install

# Launch Vite dev server on http://localhost:5173
npm run dev
```

- Web Application UI: `http://localhost:5173`

---

## Running the Automated Test Suites

Execute all backend and frontend tests with a single command:

```bash
cd /Users/veerenkumarkonchada/.gemini/antigravity-ide/scratch/wipro-workforce-intelligence
./scripts/run_tests.sh
```

Or run them individually:

**Backend (pytest)**:
```bash
python3 -m pytest backend/tests/test_api.py -v
```

**Frontend (Vitest & React Testing Library)**:
```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd frontend && npm run test
```

---

## Verification & Workflow Coverage

The platform provides an end-to-end integrated workflow:
1. **Dataset Ingestion**: Synthetic dataset auto-seeded or custom CSV uploaded and validated.
2. **Analysis & Metrics**: Derived productivity scores, workload-to-capacity ratios, and sprint completion calculated.
3. **Bottleneck Diagnosis**: Operational overload, backlog congestion, and skill deficits flagged.
4. **AI Recommendations**: Actionable proposals with `Approve`, `Reject`, and `Complete` lifecycle transitions.
5. **Workload Optimization**: Google OR-Tools redistribution executed with skill and capacity constraints.
6. **Productivity Forecasting**: Random Forest trained on chronological splits with SHAP attributions.
7. **Anomaly Detection**: Isolation Forest outlier detection identifying behavioral deviations.
8. **Executive Reports**: Formatted ReportLab PDF exported alongside raw CSVs and printable briefs.
