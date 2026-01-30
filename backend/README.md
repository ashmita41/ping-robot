# Ping Robot API

A FastAPI-based API cron system that schedules and executes HTTP requests at specified intervals.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python main.py
```

Or using uvicorn:

```bash
uvicorn main:app --reload
```

### 3. Access the API

- **API Base URL:** http://localhost:8000
- **Interactive Docs (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc

## Documentation

- **[START_AND_TEST.md](START_AND_TEST.md)** - Complete guide for starting and testing the server
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with curl examples
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development log and implementation details

## Quick Test

```bash
# Health check
curl http://localhost:8000/health

# Create a target
curl -X POST "http://localhost:8000/targets" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/get", "method": "GET"}'

# Create a schedule (replace TARGET_ID with actual ID)
curl -X POST "http://localhost:8000/schedules" \
  -H "Content-Type: application/json" \
  -d '{"target_id": "TARGET_ID", "interval_seconds": 10, "duration_seconds": 60}'
```

## Features

- ✅ Schedule HTTP requests at specified intervals
- ✅ Automatic execution with background scheduler
- ✅ Track execution history and metrics
- ✅ Pause/resume schedules
- ✅ File-based storage (easy to inspect)
- ✅ Thread-safe operations
- ✅ Comprehensive error handling
- ✅ Interactive API documentation

## Project Structure

```
backend/
├── main.py              # FastAPI app & routes
├── scheduler.py         # Background scheduling logic
├── models.py            # Pydantic models
├── storage.py           # File-based storage operations
├── executor.py          # HTTP request execution
├── data/                # JSON data files
│   ├── targets.json
│   ├── schedules.json
│   └── runs.json
├── requirements.txt     # Dependencies
├── README.md           # This file
├── START_AND_TEST.md   # Start and test guide
├── API_DOCUMENTATION.md # API reference
└── DEVELOPMENT.md      # Development log
```

## Tech Stack

- **FastAPI** - Web framework
- **httpx** - Async HTTP client
- **Pydantic** - Data validation
- **asyncio** - Background scheduling
- **filelock** - Thread-safe file operations

## License

This project is provided as-is for development and learning purposes.
