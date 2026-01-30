# Frontend Project Structure

Complete documentation of the frontend project structure and architecture.

## Overview

This is a simple React frontend for the Ping Robot API. It uses minimal dependencies and localStorage for state management, making it easy to understand and maintain.

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Main app component with routes
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard page (Health + Create forms + Recent runs)
│   │   ├── Schedules.jsx       # Schedules page (List schedules + Pause)
│   │   └── Runs.jsx           # Runs page (Runs history + Metrics tabs)
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation bar component
│   │   ├── CreateTargetForm.jsx    # Form to create new targets
│   │   ├── CreateScheduleForm.jsx  # Form to create new schedules
│   │   ├── RunsList.jsx       # Component to display list of runs
│   │   ├── MetricsCard.jsx    # Component to display metrics
│   │   └── ScheduleCard.jsx   # Component to display schedule card
│   ├── services/
│   │   └── api.js             # Axios instance with base configuration
│   └── utils/
│       └── storage.js         # localStorage helper functions
├── public/
│   └── index.html            # HTML template
└── package.json              # Dependencies and scripts
```

## File Descriptions

### Core Files

#### `src/App.jsx`
- Main application component
- Sets up React Router
- Defines routes for all pages
- Includes Navbar component

**Routes:**
- `/` - Dashboard page
- `/schedules` - Schedules page
- `/runs` - Runs page

---

### Pages

#### `src/pages/Dashboard.jsx`
**Purpose:** Main dashboard showing overview and quick actions

**Components:**
- Health Badge - Shows API health status
- Create Target Form - Quick form to create new targets
- Create Schedule Form - Quick form to create new schedules
- Recent 5 Runs - Shows last 5 runs from all schedules

**Features:**
- Real-time health check
- Create targets and schedules without navigation
- View recent activity

---

#### `src/pages/Schedules.jsx`
**Purpose:** Manage all schedules

**Components:**
- List of all schedules (from localStorage)
- Each schedule shows:
  - Target URL
  - Interval
  - Duration
  - Status (active/paused)
  - Created time
  - End time
- Pause/Resume buttons for each schedule

**Features:**
- View all schedules
- Pause active schedules
- Visual status indicators

---

#### `src/pages/Runs.jsx`
**Purpose:** View run history and metrics

**Layout:**
- Tab 1: Run History
  - List of all runs with pagination
  - Filter by schedule ID
  - Shows attempts for each run
- Tab 2: Metrics
  - Aggregated statistics
  - Success rate
  - Average latency
  - Status code distribution
  - Error type distribution

**Features:**
- Pagination for run history
- Filter by schedule
- Comprehensive metrics view

---

### Components

#### `src/components/Navbar.jsx`
**Purpose:** Navigation bar for all pages

**Features:**
- Links to Dashboard, Schedules, Runs
- Active route highlighting
- Responsive design

---

#### `src/components/CreateTargetForm.jsx`
**Purpose:** Form component for creating targets

**Fields:**
- URL (required)
- Method (dropdown: GET, POST, PUT, PATCH, DELETE)
- Headers (key-value pairs)
- Body Template (for POST/PUT/PATCH)

**Features:**
- Form validation
- Submit to API
- Save to localStorage
- Success/error feedback

---

#### `src/components/CreateScheduleForm.jsx`
**Purpose:** Form component for creating schedules

**Fields:**
- Target ID (dropdown from localStorage targets)
- Interval Seconds (number input)
- Duration Seconds (number input)

**Features:**
- Dropdown populated from localStorage targets
- Form validation
- Submit to API
- Save to localStorage
- Success/error feedback

---

#### `src/components/RunsList.jsx`
**Purpose:** Display list of runs

**Features:**
- Pagination support
- Filter by schedule ID
- Expandable attempts view
- Status indicators
- Timestamp formatting

---

#### `src/components/MetricsCard.jsx`
**Purpose:** Display metrics in card format

**Metrics Displayed:**
- Total attempts
- Successful attempts
- Failed attempts
- Success rate percentage
- Average latency
- Status code distribution (chart/list)
- Error type distribution (chart/list)

**Features:**
- Visual metrics display
- Color-coded success/failure
- Chart visualization (optional)

---

#### `src/components/ScheduleCard.jsx`
**Purpose:** Display individual schedule card

**Information Displayed:**
- Target URL
- Interval (formatted: "Every 30 seconds")
- Duration (formatted: "For 1 hour")
- Status badge (active/paused)
- Created time
- End time
- Time remaining (if active)

**Features:**
- Pause button
- Status indicator
- Time formatting
- Visual design

---

### Services

#### `src/services/api.js`
**Purpose:** Axios instance with base configuration

**Configuration:**
- Base URL: `http://localhost:8000`
- Default headers: `Content-Type: application/json`
- Error handling
- Request/response interceptors (optional)

**Exported Functions:**
- `getHealth()` - GET /health
- `createTarget(data)` - POST /targets
- `createSchedule(data)` - POST /schedules
- `pauseSchedule(id)` - POST /schedules/{id}/pause
- `getRuns(params)` - GET /runs
- `getMetrics(params)` - GET /metrics

---

### Utils

#### `src/utils/storage.js`
**Purpose:** localStorage helper functions

**Functions:**
- `saveTarget(target)` - Save target to localStorage
- `getTargets()` - Get all targets from localStorage
- `saveSchedule(schedule)` - Save schedule to localStorage
- `getSchedules()` - Get all schedules from localStorage
- `updateSchedule(id, updates)` - Update schedule in localStorage
- `clearStorage()` - Clear all localStorage (optional)

**Storage Keys:**
- `ping-robot-targets` - Array of targets
- `ping-robot-schedules` - Array of schedules

---

## Page Layout

```
┌─────────────────────────────────────┐
│  Navigation: Dashboard | Schedules | Runs  │
└─────────────────────────────────────┘

PAGE 1: Dashboard (/)
├── Health Badge
│   └── Status: Healthy/Unhealthy
├── Create Target Form
│   ├── URL input
│   ├── Method dropdown
│   ├── Headers (key-value)
│   └── Body template
├── Create Schedule Form
│   ├── Target dropdown
│   ├── Interval input
│   └── Duration input
└── Recent 5 Runs
    └── List of last 5 runs

PAGE 2: Schedules (/schedules)
├── Active Schedules (from localStorage)
│   ├── Schedule Card 1
│   │   ├── Target info
│   │   ├── Interval/Duration
│   │   ├── Status
│   │   └── Pause button
│   └── Schedule Card 2
│       └── ...
└── Empty state (if no schedules)

PAGE 3: Runs (/runs)
├── Tab: Run History
│   ├── Filter by schedule (dropdown)
│   ├── Pagination controls
│   └── Runs list
│       └── Each run shows attempts
└── Tab: Metrics
    ├── Summary cards
    ├── Status code distribution
    └── Error type distribution
```

## Data Flow

### Creating a Target
1. User fills form in `CreateTargetForm`
2. Form submits to API via `api.createTarget()`
3. On success:
   - Save to localStorage via `storage.saveTarget()`
   - Update local state
   - Show success message
4. On error:
   - Show error message

### Creating a Schedule
1. User fills form in `CreateScheduleForm`
2. Form loads targets from localStorage
3. Form submits to API via `api.createSchedule()`
4. On success:
   - Save to localStorage via `storage.saveSchedule()`
   - Update local state
   - Show success message
5. On error:
   - Show error message

### Viewing Runs
1. Page loads, calls `api.getRuns()`
2. Displays runs in `RunsList` component
3. User can filter by schedule ID
4. User can paginate through results

### Viewing Metrics
1. Page loads, calls `api.getMetrics()`
2. Displays metrics in `MetricsCard` component
3. User can filter by schedule ID

## State Management

**Approach:** Simple React useState, no Redux or Context API

**Local State:**
- Each component manages its own state
- Forms use useState for form fields
- Lists use useState for data arrays

**Persistent State:**
- localStorage for targets and schedules
- API calls for runs and metrics (always fresh)

## Dependencies

**Minimal Dependencies:**
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `axios` - HTTP client

**Optional (for better UX):**
- `react-icons` - Icons (optional)
- CSS framework (optional, can use plain CSS)

## API Integration

All API calls go through `src/services/api.js`:

**Endpoints Used:**
- `GET /health` - Health check
- `POST /targets` - Create target
- `POST /schedules` - Create schedule
- `POST /schedules/{id}/pause` - Pause schedule
- `GET /runs` - Get runs (with query params)
- `GET /metrics` - Get metrics (with query params)

**No Backend Changes Required:**
- All endpoints already exist
- Frontend uses existing API structure
- No modifications needed to backend

## localStorage Structure

```javascript
// Targets
localStorage.setItem('ping-robot-targets', JSON.stringify([
  {
    id: "uuid",
    url: "https://example.com",
    method: "GET",
    headers: {},
    body_template: null
  }
]))

// Schedules
localStorage.setItem('ping-robot-schedules', JSON.stringify([
  {
    id: "uuid",
    target_id: "uuid",
    interval_seconds: 30,
    duration_seconds: 3600,
    status: "active",
    created_at: "2024-01-15T10:30:00",
    ends_at: "2024-01-15T11:30:00"
  }
]))
```

## Next Steps

1. Install dependencies: `npm install react react-dom react-router-dom axios`
2. Set up build tool (Vite or Create React App)
3. Implement components one by one
4. Test with running backend
5. Add styling (CSS or framework)

## Notes

- Simple and straightforward architecture
- No complex state management needed
- localStorage provides persistence
- All API calls are straightforward
- Easy to understand and maintain
