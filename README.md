# Campus Sustainability Tracker v2

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An enterprise-grade campus sustainability monitoring and optimization platform. Campus Sustainability Tracker v2 aggregates real-time IoT sensor telemetry (electricity, water, CO₂) alongside manual waste metrics across campus buildings, performs statistical anomaly detection and forecasting, generates carbon emission audits, and leverages Google Gemini AI to construct tailored sustainability action plans.

---

## 🏛️ Architecture Overview

The system is constructed with a decoupled MERN architecture backed by MongoDB Time-Series collections and IoT hardware ingestion:

```
                  ┌───────────────────────────────────────────────┐
                  │          ESP32 IoT Sensor Nodes               │
                  │   (CO₂ / SCT-013 Power / YF-S201 Flow)        │
                  └───────────────────────┬───────────────────────┘
                                          │ HTTP POST (API Key Auth)
                                          ▼
┌─────────────────────────┐       ┌───────────────────────────────┐       ┌─────────────────────────┐
│     React 18 + Vite     │       │       Express API Server      │       │      MongoDB 7.0        │
│   (TypeScript, Tailwind │ ────> │  - JWT Auth (RBAC)            │ ────> │  - Time-series readings │
│    TanStack, Recharts)  │ <──── │  - Ingest & Rollup Engine     │ <──── │  - Collections: Users,  │
└─────────────────────────┘       │  - Z-score Anomaly Detection  │       │    Buildings, Devices,  │
                                  │  - 24h Statistical Forecast   │       │    Alerts, Plans, etc.  │
                                  │  - Gemini AI Strategic Planner│       └─────────────────────────┘
                                  │  - PDF Report Generator       │
                                  └───────────────────────────────┘
```

- **Frontend (`web/`)**: React 18 SPA built with Vite, TypeScript, Tailwind CSS, TanStack Query, and Recharts. Includes role-based dashboards (`admin`, `facility_manager`, `student`), live sensor streaming views, and an interactive Gemini AI planner.
- **Backend API (`server/`)**: Node.js & Express RESTful API with Zod validation, JWT authentication, role authorization middleware, cron-driven metric rollups, automated anomaly detection, and PDF report generation via PDFKit.
- **Database (`mongo`)**: MongoDB 7 utilizing optimized time-series collections with hourly and daily aggregation pipelines.
- **AI Engine**: Google Gemini API integration for on-demand structured implementation recommendations based on real campus consumption patterns.

---

## ⚙️ Prerequisites

Ensure the following tools are installed on your host machine:

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **MongoDB**: `v7.0` (or running via Docker)
- **Docker & Docker Compose** (optional, for containerized execution)

---

## 🚀 Quick Start

### Option A: Local Development

1. **Clone & Configure Environment**:
   ```bash
   git clone <repository-url>
   cd campus-sustainability-v2
   cp .env.example .env
   ```
   *Edit `.env` to verify your `JWT_SECRET` (auto-generated 64-character hex string) and MongoDB connection string.*

2. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install web frontend dependencies
   cd ../web
   npm install
   cd ..
   ```

3. **Start MongoDB**:
   Ensure MongoDB 7 is running locally on port `27017`:
   ```bash
   # Linux/macOS system service or local mongod
   mongod --dbpath ./data/db
   ```

4. **Seed Sample Data (Optional)**:
   ```bash
   node scripts/generateSampleData.js
   ```

5. **Start Development Servers**:
   ```bash
   # In terminal 1: Start Express backend
   cd server
   npm run dev

   # In terminal 2: Start Vite frontend
   cd web
   npm run dev
   ```
   - API Server: [http://localhost:5000](http://localhost:5000)
   - Web Application: [http://localhost:5173](http://localhost:5173)

---

### Option B: Docker Compose

Spin up the entire stack (MongoDB, API server, and Nginx SPA) with one command:

```bash
docker compose up --build
```

- **Web Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **MongoDB**: `localhost:27017`

To shut down containers and persist data volumes:
```bash
docker compose down
```

---

## 📡 API Endpoints Overview

All API endpoints are versioned under `/api/v1`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT | Public |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated profile | Any authenticated |
| `GET` | `/api/v1/buildings` | List all monitored buildings | Any authenticated |
| `POST` | `/api/v1/buildings` | Register new building entity | Admin |
| `GET` | `/api/v1/devices` | List registered IoT sensor nodes | Manager / Admin |
| `POST` | `/api/v1/devices` | Register a new device & generate API key | Admin |
| `POST` | `/api/v1/ingest` | Ingest raw telemetry batch | Device API Key |
| `GET` | `/api/v1/readings` | Query time-series telemetry data | Any authenticated |
| `GET` | `/api/v1/analytics/summary` | Real-time aggregate KPIs (Energy, Water, CO₂, Waste) | Any authenticated |
| `GET` | `/api/v1/analytics/trends` | Historical trend lines with bounds & baseline | Any authenticated |
| `GET` | `/api/v1/analytics/by-building`| Building-wise resource breakdown | Any authenticated |
| `GET` | `/api/v1/analytics/waste-breakdown` | Category distribution of solid waste | Any authenticated |
| `GET` | `/api/v1/alerts` | List active threshold & anomaly alerts | Manager / Admin |
| `PATCH`| `/api/v1/alerts/:id/ack` | Acknowledge active alert | Manager / Admin |
| `GET` | `/api/v1/forecast/:buildingId`| 24h statistical consumption forecast | Any authenticated |
| `GET` | `/api/v1/reports` | List generated PDF audit reports | Admin |
| `POST` | `/api/v1/reports` | Compile and trigger PDF report generation | Admin |
| `GET` | `/api/v1/reports/:id/download` | Download compiled PDF audit document | Admin |
| `GET` | `/api/v1/settings` | Fetch system thresholds & emission factors | Any authenticated |
| `PUT` | `/api/v1/settings` | Update thresholds or emission factor | Admin |
| `POST` | `/api/v1/ai/generate-plan` | Generate AI implementation roadmap via Gemini | Manager / Admin |
| `GET` | `/api/v1/ai/plans` | Retrieve saved sustainability action plans | Any authenticated |

---

## 📁 Project Structure

```
campus-sustainability-v2/
├── .env                         # Local runtime environment variables
├── .env.example                 # Environment configuration template
├── .gitignore                   # Version control ignore definitions
├── docker-compose.yml           # Multi-container orchestration (Mongo, API, Web)
├── README.md                    # Project documentation
├── data/                        # Static datasets & CSV telemetry subsets
│   ├── sustainability_readings_subset.csv
│   └── waste_breakdown_subset.csv
├── scripts/                     # Operational utility scripts
│   └── generateSampleData.js
├── firmware/                    # Hardware IoT Sensor firmware
│   └── esp32_sensor_node/
│       └── esp32_sensor_node.ino
├── server/                      # Express.js REST API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/              # Database connection & env validation
│       ├── jobs/                # Cron schedulers (rollups, alerts sweep)
│       ├── middleware/          # JWT auth, RBAC, device authentication, error handling
│       ├── models/              # Mongoose schemas (User, Building, Device, Reading, etc.)
│       ├── routes/              # Express API routers
│       ├── services/            # Ingestion, analytics, Gemini AI, PDF generation
│       └── utils/               # Unit conversion, calculations, time helpers
└── web/                         # React 18 + Vite SPA Frontend
    ├── Dockerfile
    ├── nginx.conf               # Production Nginx reverse proxy configuration
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/                 # Axios HTTP client & API wrappers
        ├── components/          # Reusable UI widgets, charts, live telemetry panels
        ├── context/             # Authentication & active theme providers
        ├── hooks/               # Custom React hooks & TanStack query bindings
        ├── pages/               # Role-based dashboard views & AI planner page
        └── types/               # TypeScript domain interfaces
```

---

## 🛠️ Build Phases Overview

1. **Phase 1: Infrastructure & Data Setup**: Docker Compose setup, environment templates, gitignore, and representative synthetic telemetry datasets.
2. **Phase 2: Core Server & Security**: Express server bootstrap, Mongoose models, JWT authentication, and role-based access control.
3. **Phase 3: IoT Telemetry & Analytics Engine**: Hardware ingestion pipeline, unit normalization, background time-series rollups, and anomaly detection.
4. **Phase 4: Advanced Services**: Statistical multi-step forecasting engine, PDF report compiler, and threshold alerting sweeps.
5. **Phase 5: Gemini AI Sustainability Planner**: LLM prompt engineering, dynamic context injection, and structured recommendation roadmap generation.
6. **Phase 6: Web Dashboard & Visualizations**: High-performance responsive React SPA featuring interactive charts, sensor telemetry monitor, and role-adaptive layouts.
7. **Phase 7: End-to-End Testing & Verification**: Integration test suites, container orchestration verification, and production readiness checks.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
