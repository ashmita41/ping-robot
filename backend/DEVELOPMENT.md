# Ping Robot - Development Log

## Project Overview
A FastAPI-based API cron system that schedules and executes HTTP requests at specified intervals. Uses file-based JSON storage for simplicity and easy inspection.

## Tech Stack
- **FastAPI**: Web framework for API endpoints
- **httpx**: Async HTTP client for making scheduled requests
- **Pydantic**: Data validation and models
- **asyncio**: Background scheduling and concurrency
- **filelock**: Thread-safe file writing operations
- **json**: Standard library for file-based storage

## Project Structure
```
api-cron/
├── main.py              # FastAPI app & routes
├── scheduler.py         # Background scheduling logic
├── models.py            # Pydantic models
├── storage.py           # File-based storage operations
├── executor.py          # HTTP request execution
├── data/
│   ├── targets.json     # Store targets
│   ├── schedules.json   # Store schedules
│   └── runs.json        # Store run history
├── requirements.txt     # Python dependencies
├── API_DOCUMENTATION.md # Complete API reference with curl examples
└── DEVELOPMENT.md      # This file - development log
```

## Core Components

### 1. Storage Layer (storage.py)
- Simple JSON file read/write operations
- Thread-safe file locking when writing
- Functions: `load_data()`, `save_data()`, `append_run()`

### 2. Models (models.py)
- **Target**: id, url, method, headers, body_template
- **Schedule**: id, target_id, interval_seconds, duration_seconds, status (active/paused), created_at, ends_at
- **Run**: id, schedule_id, started_at, status, attempts[]
- **Attempt**: timestamp, status_code, latency_ms, response_size, error_type

### 3. Executor (executor.py)
- Use httpx for async HTTP requests
- Timeout handling (5-10 seconds default)
- Error classification (timeout, DNS, connection, 4xx, 5xx)
- Capture metrics: status code, latency, response size

### 4. Scheduler (scheduler.py)
- Background task using asyncio
- Load all active schedules on startup
- For each schedule, check if it's time to run
- Create Run record, execute request, save attempt
- Handle window-based schedules (auto-pause after duration)

## Development Progress

### Phase 1: Setup
- [x] Project structure created
- [x] Requirements.txt with dependencies
- [x] Development README (this file)

### Phase 2: Core Components
- [x] Models (models.py)
- [x] Storage layer (storage.py)
- [x] Executor (executor.py)
- [x] Scheduler (scheduler.py)

### Phase 3: API Layer
- [x] FastAPI app setup (main.py)
- [x] Target management endpoints
- [x] Schedule management endpoints
- [x] Run history endpoints

### Phase 4: Integration & Testing
- [x] Background scheduler integration
- [ ] End-to-end testing
- [ ] Error handling validation

---

## Implementation Steps

### Step 0: Project Structure ✅
**Completed:** Created complete project structure with all folders and files

**What was done:**
- Created all Python module files (main.py, scheduler.py, models.py, storage.py, executor.py)
- Created `data/` directory for JSON storage files
- Created empty JSON files (targets.json, schedules.json, runs.json) initialized as empty arrays
- Created requirements.txt file for dependencies
- All files are empty placeholders ready for implementation

**Files Created:**
- `main.py` - Empty placeholder
- `scheduler.py` - Empty placeholder
- `models.py` - Empty placeholder
- `storage.py` - Empty placeholder
- `executor.py` - Empty placeholder
- `requirements.txt` - Empty placeholder
- `data/targets.json` - Empty array `[]`
- `data/schedules.json` - Empty array `[]`
- `data/runs.json` - Empty array `[]`

**Next Steps:**
- Implement FastAPI app setup in main.py
- Add dependencies to requirements.txt

### Step 1: FastAPI App Setup ✅
**Completed:** Set up the main FastAPI application with proper lifecycle management

**What was done:**
- Created `main.py` with FastAPI app initialization
- Implemented `lifespan` context manager using `@asynccontextmanager`
- Set up background scheduler task that starts on app startup and stops on shutdown
- Added root endpoint (`/`) for API information
- Added health check endpoint (`/health`) for monitoring
- Created placeholder `scheduler.py` with `run_scheduler()` function
- Added comprehensive comments explaining what and why for each component

**Key Design Decisions:**
- Used FastAPI's lifespan parameter (recommended approach for async startup/shutdown)
- Scheduler runs as a background asyncio task to avoid blocking the API
- Graceful cancellation handling with try/except for CancelledError
- Placeholder scheduler prevents import errors while we build other components
- Added health check endpoint for monitoring and deployment purposes

**Files Modified:**
- `main.py` - FastAPI application with lifespan management, root and health endpoints
- `scheduler.py` - Placeholder scheduler with `run_scheduler()` function

**Code Structure:**
- Lifespan context manager handles scheduler lifecycle
- Background task created with `asyncio.create_task()`
- Proper cleanup on shutdown with task cancellation
- App can be run directly with `python main.py` or via uvicorn

**Next Steps:**
- Create requirements.txt with all dependencies (FastAPI, uvicorn, httpx, pydantic, filelock)
- Implement models.py with Pydantic models
- Implement storage.py for file-based JSON operations

### Step 2: Create API Endpoints ✅
**Completed:** Implemented all API endpoints for target, schedule, and run management

**What was done:**
- Created Pydantic models in `models.py` (Target, Schedule, Run, Attempt, and request models)
- Implemented storage layer in `storage.py` with thread-safe file operations using filelock
- Added POST `/targets` endpoint - Creates new target with auto-generated ID
- Added POST `/schedules` endpoint - Creates schedule with calculated end time
- Added POST `/schedules/{id}/pause` endpoint - Pauses an active schedule
- Added GET `/runs` endpoint - Retrieves run history with filtering and pagination
- Added GET `/metrics` endpoint - Aggregates statistics from run history

**Key Design Decisions:**
- Used UUID for generating unique IDs (ensures no collisions)
- Thread-safe file operations using filelock library (prevents data corruption)
- Atomic file writes using temporary files then rename (ensures data integrity)
- Pydantic models for data validation and serialization
- Query parameters for filtering and pagination in GET endpoints
- Calculated `ends_at` timestamp automatically when creating schedules
- Comprehensive error handling with HTTPException for not found cases

**Files Created/Modified:**
- `models.py` - Complete Pydantic models for all data structures
- `storage.py` - Thread-safe file operations with locking
- `main.py` - Added all 5 API endpoints

**API Endpoints Implemented:**
1. `POST /targets` - Create a new HTTP target configuration
2. `POST /schedules` - Create a new schedule with interval and duration
3. `POST /schedules/{id}/pause` - Pause an active schedule
4. `GET /runs` - Get run history (supports schedule_id filter, limit, offset)
5. `GET /metrics` - Get aggregated metrics (supports schedule_id filter)

**Storage Functions:**
- `load_targets()`, `save_targets()` - Target CRUD operations
- `load_schedules()`, `save_schedules()` - Schedule CRUD operations
- `load_runs()`, `save_runs()`, `append_run()` - Run operations

**Next Steps:**
- Implement executor.py for HTTP request execution
- Complete scheduler.py to actually execute scheduled requests
- Create requirements.txt with all dependencies

### Step 3: Build the Scheduler Loop ✅
**Completed:** Implemented the complete scheduler loop with schedule execution logic

**What was done:**
- Implemented `run_scheduler()` main loop that runs continuously
- Created `load_active_schedules()` to filter active, non-expired schedules
- Created `should_run_now()` to check if enough time has passed since last execution
- Created `execute_schedule()` to handle full execution flow (create run, execute request, save attempt)
- Added auto-pause functionality for expired schedules
- Created placeholder `executor.py` with `execute_request()` function
- Added error handling in scheduler loop to prevent crashes

**Key Design Decisions:**
- Scheduler checks every 1 second for responsiveness while preventing CPU spinning
- Each schedule execution runs as a separate asyncio task (allows concurrent execution)
- Auto-pauses schedules that have passed their `ends_at` timestamp
- Tracks last execution time by finding most recent attempt in run history
- Creates new run if none exists or all previous runs are completed
- Handles datetime parsing from both string (JSON) and datetime objects

**Scheduler Flow:**
1. Load active schedules (filters paused and expired)
2. For each schedule, check if `interval_seconds` has passed since last execution
3. If yes, create background task to execute the schedule
4. Sleep 1 second and repeat

**Execution Flow (execute_schedule):**
1. Load target configuration
2. Find or create a "running" run for this schedule
3. Execute HTTP request via executor
4. Save attempt to run
5. Update run in storage

**Files Created/Modified:**
- `scheduler.py` - Complete scheduler implementation with all helper functions
- `executor.py` - Placeholder executor (will be fully implemented in next step)

**Helper Functions:**
- `load_active_schedules()` - Filters active, non-expired schedules, auto-pauses expired ones
- `should_run_now(schedule)` - Checks interval timing based on last execution
- `execute_schedule(schedule)` - Full execution flow with run management

**Next Steps:**
- Implement executor.py with httpx for actual HTTP request execution
- Add timeout handling and error classification
- Create requirements.txt with all dependencies

### Step 4: Execute Requests ✅
**Completed:** Implemented complete HTTP request execution with httpx, error handling, and metrics

**What was done:**
- Implemented `execute_request()` with httpx for async HTTP requests
- Added timeout handling (default 10 seconds, configurable)
- Implemented comprehensive error classification:
  - `timeout` - Request timed out
  - `DNS` - DNS resolution failure
  - `connection` - Connection errors (unreachable, refused, etc.)
  - `4xx` - Client errors (400-499)
  - `5xx` - Server errors (500-599)
  - `unknown` - Other unexpected errors
- Added metrics capture:
  - Status code (if request succeeded)
  - Latency in milliseconds (measured from start to finish)
  - Response size in bytes
  - Error type (if request failed)
- Added `classify_error()` helper function for error classification

**Key Design Decisions:**
- Default timeout of 10 seconds (configurable per request)
- Uses httpx AsyncClient with context manager for proper connection cleanup
- Measures latency from request start to completion (including errors)
- Captures response size from response content
- Classifies HTTP status codes 4xx and 5xx as errors
- Handles all httpx exception types (TimeoutException, ConnectError, NetworkError)
- DNS errors are detected by checking error message content
- Timestamp recorded at start of request for accurate timing

**Error Handling:**
- `httpx.TimeoutException` → "timeout"
- `httpx.ConnectError` → "connection"
- `httpx.NetworkError` → "DNS" or "connection" (based on error message)
- HTTP 4xx status codes → "4xx"
- HTTP 5xx status codes → "5xx"
- Other exceptions → "unknown" with error message

**Request Execution Flow:**
1. Record start time for latency calculation
2. Extract target configuration (url, method, headers, body)
3. Create httpx AsyncClient with timeout
4. Execute request with appropriate method and content
5. Calculate latency and capture response metrics
6. Classify errors based on status code or exception
7. Return attempt dictionary with all metrics

**Files Modified:**
- `executor.py` - Complete implementation with httpx, error handling, and metrics

**Integration:**
- Works seamlessly with scheduler's `execute_schedule()` function
- Returns attempt dictionary that matches Attempt model structure
- All metrics are captured and stored in run history

**Files Created:**
- `requirements.txt` - All dependencies listed (FastAPI, uvicorn, httpx, pydantic, filelock)

**Next Steps:**
- Test end-to-end flow
- Add any additional error handling if needed
- Consider adding logging for better debugging

### API Documentation ✅
**Completed:** Created comprehensive API documentation with curl examples

**What was done:**
- Created `API_DOCUMENTATION.md` with complete API reference
- Documented all 7 endpoints with curl examples
- Included request/response examples for each endpoint
- Added complete workflow example
- Documented error responses
- Noted interactive API docs (Swagger/ReDoc) available at `/docs` and `/redoc`

**Endpoints Documented:**
1. `GET /` - Root endpoint
2. `GET /health` - Health check
3. `POST /targets` - Create target
4. `POST /schedules` - Create schedule
5. `POST /schedules/{id}/pause` - Pause schedule
6. `GET /runs` - Get run history (with filtering and pagination)
7. `GET /metrics` - Get aggregated metrics

**Files Created:**
- `API_DOCUMENTATION.md` - Complete API reference with curl examples

**Additional Resources:**
- FastAPI automatically provides Swagger UI at `/docs`
- ReDoc available at `/redoc`
- OpenAPI JSON specification at `/openapi.json`

### Simple Start Algorithm Implementation ✅
**Completed:** Verified and documented the Simple Start Algorithm implementation

**Algorithm Steps:**
1. ✅ **Initialize data/ folder with empty JSON files**
   - `data/targets.json` - Empty array `[]`
   - `data/schedules.json` - Empty array `[]`
   - `data/runs.json` - Empty array `[]`
   - All files initialized at project creation

2. ✅ **Start FastAPI server**
   - Implemented in `main.py` with uvicorn
   - Server starts on application startup
   - Can be run with `python main.py` or `uvicorn main:app`

3. ✅ **Start background scheduler task**
   - Implemented in `main.py` lifespan context manager
   - Scheduler task created with `asyncio.create_task(run_scheduler())`
   - Starts automatically when FastAPI app starts
   - Gracefully cancels on shutdown

4. ✅ **Scheduler reads schedules.json every second**
   - Implemented in `run_scheduler()` loop
   - Calls `load_active_schedules()` which reads from `schedules.json`
   - Sleeps for 1 second between checks: `await asyncio.sleep(1)`

5. ✅ **For each active schedule:**
   - **Check: current_time >= last_run_at + interval_seconds**
     - Implemented in `should_run_now(schedule)`
     - Tracks `last_run_at` via most recent attempt timestamp in runs.json
     - Compares: `time_since_last >= interval_seconds`
   - **Check: current_time < created_at + duration_seconds (if window set)**
     - Implemented in `load_active_schedules()`
     - Checks: `now < ends_at` (where `ends_at = created_at + duration_seconds`)
     - Auto-pauses schedules that have expired
   - **If both true: execute request, save run**
     - Implemented in `execute_schedule(schedule)`
     - Creates/updates run record
     - Executes HTTP request via `execute_request()`
     - Saves attempt to run
     - Updates run in storage

6. ✅ **Handle pause/resume by updating status field**
   - Pause: `POST /schedules/{id}/pause` endpoint updates status to "paused"
   - Resume: Can be implemented by updating status back to "active"
   - Auto-pause: Scheduler automatically pauses expired schedules
   - Status field checked in `load_active_schedules()` to filter paused schedules

**Implementation Details:**
- All algorithm steps are implemented and verified
- Scheduler loop runs continuously in background
- Thread-safe file operations ensure data integrity
- Concurrent execution via asyncio tasks
- Error handling prevents scheduler crashes

**Files Verified:**
- `main.py` - Steps 2 & 3 (FastAPI server and scheduler startup)
- `scheduler.py` - Steps 4, 5, & 6 (scheduler loop and execution logic)
- `storage.py` - File operations for reading/writing JSON files
- `data/*.json` - Step 1 (initialized empty JSON files)

---

## CORS Configuration

**Added:** CORS middleware to allow frontend requests

**Configuration:**
- Allows requests from `http://localhost:3000` and `http://127.0.0.1:3000` (React dev server)
- Allows all HTTP methods
- Allows all headers
- Allows credentials

**Why:** Frontend runs on different port (3000) than backend (8000), requiring CORS headers for cross-origin requests.

**Implementation:**
- Added `CORSMiddleware` from `fastapi.middleware.cors`
- Configured in `main.py` after app initialization

## Notes
- Keeping everything simple while meeting all requirements
- File-based storage makes it easy to inspect data
- Async approach handles concurrency well
- CORS enabled for frontend integration