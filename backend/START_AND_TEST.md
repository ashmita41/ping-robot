# How to Start the Server and Test

Complete guide for starting the Ping Robot API server and testing all endpoints.

---

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

---

## Step 1: Install Dependencies

Navigate to the `backend` directory and install all required packages:

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- FastAPI
- uvicorn (ASGI server)
- httpx (HTTP client)
- pydantic (Data validation)
- filelock (Thread-safe file operations)

---

## Step 2: Start the Server

### Option A: Using Python directly

```bash
cd backend
python main.py
```

### Option B: Using uvicorn directly

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Flags:**
- `--host 0.0.0.0` - Listen on all network interfaces
- `--port 8000` - Use port 8000 (default)
- `--reload` - Auto-reload on code changes (development mode)

### Option C: Using uvicorn with custom settings

```bash
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

The server is now running! The scheduler will automatically start in the background.

---

## Step 3: Verify Server is Running

### Check Root Endpoint

```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "name": "Ping Robot API",
  "status": "running",
  "version": "1.0.0"
}
```

### Check Health Endpoint

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "ping-robot-api"
}
```

### Open Interactive API Docs

Open your browser and visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly!

---

## Step 4: Test Complete Workflow

### Test 1: Create a Target

```bash
curl -X POST "http://localhost:8000/targets" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/get",
    "method": "GET"
  }'
```

**Save the target ID from the response:**
```bash
# On Linux/Mac, save the ID:
TARGET_ID=$(curl -s -X POST "http://localhost:8000/targets" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/get",
    "method": "GET"
  }' | jq -r '.id')

echo "Target ID: $TARGET_ID"
```

**On Windows PowerShell:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8000/targets" -Method POST -ContentType "application/json" -Body '{"url": "https://httpbin.org/get", "method": "GET"}'
$TARGET_ID = $response.id
Write-Host "Target ID: $TARGET_ID"
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://httpbin.org/get",
  "method": "GET",
  "headers": null,
  "body_template": null
}
```

---

### Test 2: Create a Schedule

```bash
curl -X POST "http://localhost:8000/schedules" \
  -H "Content-Type: application/json" \
  -d "{
    \"target_id\": \"$TARGET_ID\",
    \"interval_seconds\": 10,
    \"duration_seconds\": 60
  }"
```

**On Windows PowerShell (replace $TARGET_ID with actual ID):**
```powershell
$scheduleBody = @{
    target_id = $TARGET_ID
    interval_seconds = 10
    duration_seconds = 60
} | ConvertTo-Json

$schedule = Invoke-RestMethod -Uri "http://localhost:8000/schedules" -Method POST -ContentType "application/json" -Body $scheduleBody
$SCHEDULE_ID = $schedule.id
Write-Host "Schedule ID: $SCHEDULE_ID"
```

**Expected Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "target_id": "550e8400-e29b-41d4-a716-446655440000",
  "interval_seconds": 10,
  "duration_seconds": 60,
  "status": "active",
  "created_at": "2024-01-15T10:30:00.123456",
  "ends_at": "2024-01-15T10:31:00.123456"
}
```

**What happens:** The scheduler will automatically start executing this schedule every 10 seconds for 60 seconds (6 executions total).

---

### Test 3: Wait and Check Run History

Wait about 15-20 seconds for a few executions, then check the run history:

```bash
curl "http://localhost:8000/runs"
```

**Or filter by schedule ID:**
```bash
curl "http://localhost:8000/runs?schedule_id=$SCHEDULE_ID"
```

**Expected Response:**
```json
{
  "total": 1,
  "runs": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "schedule_id": "660e8400-e29b-41d4-a716-446655440001",
      "started_at": "2024-01-15T10:30:00.123456",
      "status": "running",
      "attempts": [
        {
          "timestamp": "2024-01-15T10:30:00.123456",
          "status_code": 200,
          "latency_ms": 125.45,
          "response_size": 1024,
          "error_type": null
        },
        {
          "timestamp": "2024-01-15T10:30:10.123456",
          "status_code": 200,
          "latency_ms": 98.32,
          "response_size": 1024,
          "error_type": null
        }
      ]
    }
  ]
}
```

---

### Test 4: Check Metrics

```bash
curl "http://localhost:8000/metrics"
```

**Or filter by schedule ID:**
```bash
curl "http://localhost:8000/metrics?schedule_id=$SCHEDULE_ID"
```

**Expected Response:**
```json
{
  "total_attempts": 6,
  "successful_attempts": 6,
  "failed_attempts": 0,
  "success_rate": 100.0,
  "average_latency_ms": 112.5,
  "status_code_distribution": {
    "200": 6
  },
  "error_type_distribution": {}
}
```

---

### Test 5: Pause a Schedule

```bash
curl -X POST "http://localhost:8000/schedules/$SCHEDULE_ID/pause"
```

**Expected Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "target_id": "550e8400-e29b-41d4-a716-446655440000",
  "interval_seconds": 10,
  "duration_seconds": 60,
  "status": "paused",
  "created_at": "2024-01-15T10:30:00.123456",
  "ends_at": "2024-01-15T10:31:00.123456"
}
```

**What happens:** The schedule stops executing immediately.

---

## Quick Test Script

Here's a complete test script you can run:

### Linux/Mac (bash)

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "=== Testing Ping Robot API ==="

# 1. Health check
echo -e "\n1. Health Check:"
curl -s "$BASE_URL/health" | jq

# 2. Create target
echo -e "\n2. Creating target:"
TARGET_RESPONSE=$(curl -s -X POST "$BASE_URL/targets" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/get", "method": "GET"}')
echo "$TARGET_RESPONSE" | jq
TARGET_ID=$(echo "$TARGET_RESPONSE" | jq -r '.id')

# 3. Create schedule
echo -e "\n3. Creating schedule:"
SCHEDULE_RESPONSE=$(curl -s -X POST "$BASE_URL/schedules" \
  -H "Content-Type: application/json" \
  -d "{\"target_id\": \"$TARGET_ID\", \"interval_seconds\": 5, \"duration_seconds\": 30}")
echo "$SCHEDULE_RESPONSE" | jq
SCHEDULE_ID=$(echo "$SCHEDULE_RESPONSE" | jq -r '.id')

# 4. Wait for executions
echo -e "\n4. Waiting 20 seconds for executions..."
sleep 20

# 5. Check runs
echo -e "\n5. Checking run history:"
curl -s "$BASE_URL/runs?schedule_id=$SCHEDULE_ID" | jq

# 6. Check metrics
echo -e "\n6. Checking metrics:"
curl -s "$BASE_URL/metrics?schedule_id=$SCHEDULE_ID" | jq

# 7. Pause schedule
echo -e "\n7. Pausing schedule:"
curl -s -X POST "$BASE_URL/schedules/$SCHEDULE_ID/pause" | jq

echo -e "\n=== Test Complete ==="
```

Save as `test.sh`, make executable, and run:
```bash
chmod +x test.sh
./test.sh
```

### Windows PowerShell

```powershell
$BASE_URL = "http://localhost:8000"

Write-Host "=== Testing Ping Robot API ===" -ForegroundColor Green

# 1. Health check
Write-Host "`n1. Health Check:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/health" | ConvertTo-Json

# 2. Create target
Write-Host "`n2. Creating target:" -ForegroundColor Yellow
$targetBody = @{
    url = "https://httpbin.org/get"
    method = "GET"
} | ConvertTo-Json
$target = Invoke-RestMethod -Uri "$BASE_URL/targets" -Method POST -ContentType "application/json" -Body $targetBody
$target | ConvertTo-Json
$TARGET_ID = $target.id

# 3. Create schedule
Write-Host "`n3. Creating schedule:" -ForegroundColor Yellow
$scheduleBody = @{
    target_id = $TARGET_ID
    interval_seconds = 5
    duration_seconds = 30
} | ConvertTo-Json
$schedule = Invoke-RestMethod -Uri "$BASE_URL/schedules" -Method POST -ContentType "application/json" -Body $scheduleBody
$schedule | ConvertTo-Json
$SCHEDULE_ID = $schedule.id

# 4. Wait for executions
Write-Host "`n4. Waiting 20 seconds for executions..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 5. Check runs
Write-Host "`n5. Checking run history:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/runs?schedule_id=$SCHEDULE_ID" | ConvertTo-Json

# 6. Check metrics
Write-Host "`n6. Checking metrics:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/metrics?schedule_id=$SCHEDULE_ID" | ConvertTo-Json

# 7. Pause schedule
Write-Host "`n7. Pausing schedule:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/schedules/$SCHEDULE_ID/pause" -Method POST | ConvertTo-Json

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
```

Save as `test.ps1` and run:
```powershell
.\test.ps1
```

---

## Testing with Postman

1. Import the OpenAPI specification:
   - Visit: http://localhost:8000/openapi.json
   - Copy the JSON
   - Import into Postman

2. Or manually create requests:
   - Base URL: `http://localhost:8000`
   - Use the endpoints from `API_DOCUMENTATION.md`

---

## Testing with Python requests

```python
import requests
import time

BASE_URL = "http://localhost:8000"

# 1. Health check
response = requests.get(f"{BASE_URL}/health")
print("Health:", response.json())

# 2. Create target
target = requests.post(
    f"{BASE_URL}/targets",
    json={
        "url": "https://httpbin.org/get",
        "method": "GET"
    }
).json()
print("Target created:", target)
target_id = target["id"]

# 3. Create schedule
schedule = requests.post(
    f"{BASE_URL}/schedules",
    json={
        "target_id": target_id,
        "interval_seconds": 5,
        "duration_seconds": 30
    }
).json()
print("Schedule created:", schedule)
schedule_id = schedule["id"]

# 4. Wait for executions
print("Waiting 20 seconds...")
time.sleep(20)

# 5. Check runs
runs = requests.get(
    f"{BASE_URL}/runs",
    params={"schedule_id": schedule_id}
).json()
print("Runs:", runs)

# 6. Check metrics
metrics = requests.get(
    f"{BASE_URL}/metrics",
    params={"schedule_id": schedule_id}
).json()
print("Metrics:", metrics)

# 7. Pause schedule
paused = requests.post(f"{BASE_URL}/schedules/{schedule_id}/pause").json()
print("Schedule paused:", paused)
```

Save as `test.py` and run:
```bash
python test.py
```

---

## Troubleshooting

### Port Already in Use

If port 8000 is already in use:

```bash
# Find process using port 8000
# On Linux/Mac:
lsof -i :8000

# On Windows:
netstat -ano | findstr :8000

# Kill the process or use a different port:
uvicorn main:app --port 8001
```

### Module Not Found Errors

Make sure you're in the `backend` directory and dependencies are installed:

```bash
cd backend
pip install -r requirements.txt
```

### Scheduler Not Running

The scheduler starts automatically when the server starts. Check the server logs for any errors. The scheduler runs in the background and doesn't block the API.

### Data Files Not Created

The `data/` directory and JSON files are created automatically. If they don't exist, the storage module will create them on first use.

---

## Stopping the Server

Press `CTRL+C` in the terminal where the server is running. The scheduler will be gracefully stopped.

---

## Next Steps

- Read `API_DOCUMENTATION.md` for complete API reference
- Check `DEVELOPMENT.md` for implementation details
- Use Swagger UI at http://localhost:8000/docs for interactive testing
