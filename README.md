# Live Project Intelligence Dashboard

A real-time control center for engineering teams that continuously monitors project health, complexity, risks, and agent activity.

## Features

- **Project Health Score** — Overall health (0-100) with trend analysis
- **Code Complexity Analysis** — Cyclomatic complexity, hotspots, file metrics
- **Risky Systems Detection** — Identifies unstable APIs and error-prone modules
- **Developer Bottlenecks** — Bus factor analysis from git history
- **Agent Activity Monitor** — Real-time agent performance tracking
- **Live Activity Feed** — WebSocket-powered event stream

## Quick Start

### 1. Install Dependencies

```bash
cd "Live project intelligence dashboard"
npm install
```

### 2. Start the Backend

```bash
npm run dev:server
```

Server runs on `http://localhost:3456`

### 3. Start the Frontend (new terminal)

```bash
npm run dev:ui
```

Dashboard opens on `http://localhost:3457`

### 4. Or Run Both Together

```bash
npm run dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD (React + Vite)                  │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐  │
│  │ Health  │ │ Complexity│ │  Risks  │ │  Live Activity  │  │
│  │  Score  │ │  Metrics  │ │  APIs   │ │     Feed        │  │
│  └─────────┘ └──────────┘ └─────────┘ └─────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket / REST
┌────────────────────────▼────────────────────────────────────┐
│              INTELLIGENCE ENGINE (Node.js + Express)         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ File Scanner│  │ Git Analyzer│  │   API Log Scanner   │  │
│  │  (fast-glob)│  │ (simple-git)│  │  (parse NDJSON)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Complexity  │  │   Risk      │  │   Health Scorer     │  │
│  │  Analyzer   │  │  Calculator │  │  (aggregates all)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/snapshot` | GET | Full project snapshot |
| `/api/complexity` | GET | Complexity metrics |
| `/api/risks` | GET | Risky modules list |
| `/api/bottlenecks` | GET | Developer bottlenecks |
| `/api/agents` | GET | Agent activity |
| `/api/events` | GET | Recent events |
| `/api/refresh` | POST | Trigger manual refresh |
| `/ws` | WS | WebSocket for live updates |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_ROOT` | `/home/paperclip/paperclip` | Path to project to analyze |
| `PORT` | `3456` | Server port |
| `VITE_API_URL` | `http://localhost:3456` | API URL for UI |
| `VITE_WS_URL` | `ws://localhost:3456/ws` | WebSocket URL for UI |

## Project Structure

```
Live project intelligence dashboard/
├── server/
│   └── src/
│       ├── index.ts              # Entry point
│       ├── types.ts              # Shared types
│       ├── api/
│       │   └── server.ts         # Express + WebSocket server
│       └── intelligence/
│           ├── Engine.ts         # Main orchestrator
│           ├── FileScanner.ts    # File analysis
│           ├── GitAnalyzer.ts    # Git history
│           ├── RiskAnalyzer.ts   # Risk scoring
│           ├── HealthAnalyzer.ts # Health scoring
│           └── AgentMonitor.ts   # Agent tracking
├── ui/
│   ├── index.html
│   └── src/
│       ├── main.tsx              # React entry
│       ├── App.tsx               # Main layout
│       ├── context/
│       │   └── DashboardContext.tsx
│       ├── hooks/
│       │   └── useDashboard.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── HealthScoreCard.tsx
│       │   ├── ComplexityPanel.tsx
│       │   ├── RiskPanel.tsx
│       │   ├── BottleneckPanel.tsx
│       │   ├── AgentActivityPanel.tsx
│       │   └── ActivityFeed.tsx
│       └── styles/
│           ├── global.css
│           └── dashboard.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How It Works

1. **File Scanner** walks the project, counts LOC, calculates cyclomatic complexity
2. **Git Analyzer** parses commit history to find top contributors (bottlenecks)
3. **Risk Analyzer** scans API routes for error-prone patterns (missing auth, many async ops without catch, etc.)
4. **Agent Monitor** reads Paperclip run logs to track agent performance
5. **Health Analyzer** combines all metrics into a 0-100 health score
6. **Dashboard** displays everything in real-time via WebSocket

## Customization

To monitor a different project, set the `PROJECT_ROOT` environment variable:

```bash
PROJECT_ROOT=/path/to/your/project npm run dev:server
```

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (`ws`), fast-glob, simple-git
- **Frontend**: React, Vite, Recharts
- **Styling**: Custom CSS (dark theme)
