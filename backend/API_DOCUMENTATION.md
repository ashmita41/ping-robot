# Ping Robot API Documentation

Complete API reference with curl examples for all endpoints.

**Base URL:** `http://localhost:8000`

**Note:** FastAPI automatically provides interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Table of Contents

1. [Root & Health Endpoints](#root--health-endpoints)
2. [Target Management](#target-management)
3. [Schedule Management](#schedule-management)
4. [Run History](#run-history)
5. [Metrics](#metrics)

---

## Root & Health Endpoints

### GET `/` - Root Endpoint

Get basic API information.

**Description:** Returns API name, status, and version.

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "name": "Ping Robot API",
  "status": "running",
  "version": "1.0.0"
}
```

---

### GET `/health` - Health Check

Check API health status.

**Description:** Returns health status for monitoring and load balancers.

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/health" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": "healthy",
  "service": "ping-robot-api"
}
```

---

## Target Management

### POST `/targets` - Create Target

Create a new HTTP target configuration.

**Description:** Creates a target that defines an HTTP endpoint to ping. The target includes URL, HTTP method, optional headers, and optional request body template.

**Request Body:**
```json
{
  "url": "https://example.com/api/health",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token123",
    "Content-Type": "application/json"
  },
  "body_template": null
}
```

**Fields:**
- `url` (required, string): Target URL to ping
- `method` (optional, string): HTTP method (default: "GET")
- `headers` (optional, object): HTTP headers as key-value pairs
- `body_template` (optional, string): Request body template for POST/PUT/PATCH requests

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/targets" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/get",
    "method": "GET",
    "headers": {
      "User-Agent": "PingRobot/1.0"
    }
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://httpbin.org/get",
  "method": "GET",
  "headers": {
    "User-Agent": "PingRobot/1.0"
  },
  "body_template": null
}
```

**Example with POST request:**
```bash
curl -X POST "http://localhost:8000/targets" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/post",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body_template": "{\"message\": \"ping\"}"
  }'
```

---

## Schedule Management

### POST `/schedules` - Create Schedule

Create a new schedule for executing a target at intervals.

**Description:** Creates a schedule that will execute a target at specified intervals for a given duration. The schedule automatically calculates the end time based on creation time and duration.

**Request Body:**
```json
{
  "target_id": "550e8400-e29b-41d4-a716-446655440000",
  "interval_seconds": 30,
  "duration_seconds": 3600
}
```

**Fields:**
- `target_id` (required, string): ID of the target to execute
- `interval_seconds` (required, integer): Time between executions in seconds
- `duration_seconds` (required, integer): Total duration the schedule should run in seconds

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/schedules" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": "550e8400-e29b-41d4-a716-446655440000",
    "interval_seconds": 30,
    "duration_seconds": 3600
  }'
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "target_id": "550e8400-e29b-41d4-a716-446655440000",
  "interval_seconds": 30,
  "duration_seconds": 3600,
  "status": "active",
  "created_at": "2024-01-15T10:30:00.123456",
  "ends_at": "2024-01-15T11:30:00.123456"
}
```

**Example: Schedule to ping every 10 seconds for 5 minutes:**
```bash
curl -X POST "http://localhost:8000/schedules" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": "550e8400-e29b-41d4-a716-446655440000",
    "interval_seconds": 10,
    "duration_seconds": 300
  }'
```

---

### POST `/schedules/{schedule_id}/pause` - Pause Schedule

Pause an active schedule.

**Description:** Temporarily stops a schedule from executing. The schedule can be resumed by updating its status back to "active" (future feature) or by creating a new schedule.

**Path Parameters:**
- `schedule_id` (required, string): ID of the schedule to pause

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/schedules/660e8400-e29b-41d4-a716-446655440001/pause" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "target_id": "550e8400-e29b-41d4-a716-446655440000",
  "interval_seconds": 30,
  "duration_seconds": 3600,
  "status": "paused",
  "created_at": "2024-01-15T10:30:00.123456",
  "ends_at": "2024-01-15T11:30:00.123456"
}
```

**Error Response (404):**
```json
{
  "detail": "Schedule with id 'invalid-id' not found"
}
```

---

## Run History

### GET `/runs` - Get Run History

Get execution history with optional filtering and pagination.

**Description:** Retrieves run history for all schedules or filtered by a specific schedule. Supports pagination with limit and offset.

**Query Parameters:**
- `schedule_id` (optional, string): Filter runs by schedule ID
- `limit` (optional, integer): Limit number of results
- `offset` (optional, integer): Offset for pagination (default: 0)

**cURL Examples:**

**Get all runs:**
```bash
curl -X GET "http://localhost:8000/runs" \
  -H "Content-Type: application/json"
```

**Filter by schedule ID:**
```bash
curl -X GET "http://localhost:8000/runs?schedule_id=660e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json"
```

**Get first 10 runs:**
```bash
curl -X GET "http://localhost:8000/runs?limit=10" \
  -H "Content-Type: application/json"
```

**Get runs with pagination (skip first 20, get next 10):**
```bash
curl -X GET "http://localhost:8000/runs?offset=20&limit=10" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "total": 2,
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
          "timestamp": "2024-01-15T10:30:30.123456",
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

## Metrics

### GET `/metrics` - Get Aggregated Metrics

Get aggregated statistics from run history.

**Description:** Provides comprehensive metrics including success rates, latency, status code distribution, and error type distribution. Can be filtered by schedule ID.

**Query Parameters:**
- `schedule_id` (optional, string): Filter metrics by schedule ID

**cURL Examples:**

**Get metrics for all schedules:**
```bash
curl -X GET "http://localhost:8000/metrics" \
  -H "Content-Type: application/json"
```

**Get metrics for a specific schedule:**
```bash
curl -X GET "http://localhost:8000/metrics?schedule_id=660e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "total_attempts": 120,
  "successful_attempts": 115,
  "failed_attempts": 5,
  "success_rate": 95.83,
  "average_latency_ms": 142.35,
  "status_code_distribution": {
    "200": 110,
    "201": 5,
    "404": 2,
    "500": 3
  },
  "error_type_distribution": {
    "timeout": 2,
    "connection": 2,
    "5xx": 1
  }
}
```

**Response Fields:**
- `total_attempts` (integer): Total number of HTTP request attempts
- `successful_attempts` (integer): Number of successful requests (status code 2xx/3xx, no error)
- `failed_attempts` (integer): Number of failed requests
- `success_rate` (float): Success rate as percentage
- `average_latency_ms` (float): Average request latency in milliseconds
- `status_code_distribution` (object): Count of each HTTP status code
- `error_type_distribution` (object): Count of each error type (timeout, DNS, connection, 4xx, 5xx)

---

## Error Responses

All endpoints may return the following error responses:

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "url"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Complete Workflow Example

Here's a complete workflow example:

### 1. Create a Target
```bash
TARGET_RESPONSE=$(curl -X POST "http://localhost:8000/targets" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://httpbin.org/get",
    "method": "GET"
  }')

TARGET_ID=$(echo $TARGET_RESPONSE | jq -r '.id')
echo "Created target: $TARGET_ID"
```

### 2. Create a Schedule
```bash
SCHEDULE_RESPONSE=$(curl -X POST "http://localhost:8000/schedules" \
  -H "Content-Type: application/json" \
  -d "{
    \"target_id\": \"$TARGET_ID\",
    \"interval_seconds\": 10,
    \"duration_seconds\": 60
  }")

SCHEDULE_ID=$(echo $SCHEDULE_RESPONSE | jq -r '.id')
echo "Created schedule: $SCHEDULE_ID"
```

### 3. Wait for executions (scheduler runs automatically)

### 4. Check Run History
```bash
curl -X GET "http://localhost:8000/runs?schedule_id=$SCHEDULE_ID" \
  -H "Content-Type: application/json"
```

### 5. Get Metrics
```bash
curl -X GET "http://localhost:8000/metrics?schedule_id=$SCHEDULE_ID" \
  -H "Content-Type: application/json"
```

### 6. Pause Schedule
```bash
curl -X POST "http://localhost:8000/schedules/$SCHEDULE_ID/pause" \
  -H "Content-Type: application/json"
```

---

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI:** Visit `http://localhost:8000/docs` for an interactive API explorer
- **ReDoc:** Visit `http://localhost:8000/redoc` for alternative documentation format
- **OpenAPI JSON:** Visit `http://localhost:8000/openapi.json` for the OpenAPI specification

These interactive docs allow you to:
- View all endpoints
- See request/response schemas
- Test endpoints directly from the browser
- Download the OpenAPI specification

---

## Notes

- All timestamps are in ISO 8601 format
- Schedule IDs and Target IDs are UUIDs (v4)
- The scheduler runs automatically in the background once the server starts
- Schedules automatically pause when they reach their `ends_at` time
- All file operations are thread-safe using file locking
- Data is persisted in JSON files in the `data/` directory
