# Ping Robot Frontend

React frontend for the Ping Robot API.

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Routes
│   ├── pages/
│   │   ├── Dashboard.jsx       # Health + Create forms + Recent runs
│   │   ├── Schedules.jsx       # List schedules + Pause
│   │   └── Runs.jsx           # Runs history + Metrics tabs
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CreateTargetForm.jsx
│   │   ├── CreateScheduleForm.jsx
│   │   ├── RunsList.jsx
│   │   ├── MetricsCard.jsx
│   │   └── ScheduleCard.jsx
│   ├── services/
│   │   └── api.js             # Axios instance
│   └── utils/
│       └── storage.js         # localStorage helpers
├── public/
│   └── index.html
└── package.json
```

## Pages

### Dashboard (/)
- Health Badge
- Create Target Form
- Create Schedule Form
- Recent 5 Runs

### Schedules (/schedules)
- Active Schedules (from localStorage)
- Pause buttons

### Runs (/runs)
- Tab: Run History (with pagination)
- Tab: Metrics (with charts)

## Features

- ✅ Only 3 pages - Dashboard, Schedules, Runs
- ✅ Uses ALL current backend APIs - No modifications needed
- ✅ localStorage for tracking - Stores created targets/schedules
- ✅ No complex state management - Just React useState
- ✅ Minimal dependencies - React Router + Axios
- ✅ Works immediately - No backend changes required

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

## Build

```bash
npm run build
```
