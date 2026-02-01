"""
FastAPI application for Ping Robot - API Cron System

This module sets up the FastAPI application with:
- Lifespan management for background scheduler
- Health check endpoint
- API routes for managing targets, schedules, and runs
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional, List

# Import scheduler function (will be implemented in scheduler.py)
from scheduler import run_scheduler

# Import models and storage functions
from models import Target, Schedule, Run, TargetCreate, ScheduleCreate, ScheduleStatus
import storage


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application lifecycle.
    
    This handles:
    - Starting the background scheduler task on application startup
    - Gracefully canceling the scheduler task on application shutdown
    
    Why: FastAPI's lifespan events ensure the scheduler runs for the entire
    application lifetime and is properly cleaned up when the server stops.
    """
    # Start scheduler on startup
    # Create a background task that runs the scheduler loop
    scheduler_task = asyncio.create_task(run_scheduler())
    
    # Yield control back to FastAPI - app is now running
    yield
    
    # Cleanup on shutdown
    # Cancel the scheduler task gracefully
    scheduler_task.cancel()
    try:
        # Wait for the task to finish cancellation
        await scheduler_task
    except asyncio.CancelledError:
        # Expected exception when task is cancelled - this is normal
        pass


# Initialize FastAPI app with metadata and lifespan
# The lifespan parameter ensures the scheduler starts on startup and stops on shutdown
app = FastAPI(
    title="Ping Robot API",
    description="API Cron System for scheduling and executing HTTP requests",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow frontend requests
# Why: Frontend runs on different port (typically 3000) and needs CORS headers
# Production: Allow Netlify frontend URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],   # Allow all headers
)


@app.get("/")
async def root():
    """
    Root endpoint - provides basic API information.
    
    Returns: JSON response with API name and status
    """
    return JSONResponse(
        content={
            "name": "Ping Robot API",
            "status": "running",
            "version": "1.0.0"
        }
    )


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns: JSON response indicating the API is healthy
    Why: Standard endpoint for health checks, useful for deployment monitoring
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "ping-robot-api"
        }
    )


@app.post("/targets", response_model=Target)
async def create_target(target_data: TargetCreate):
    """
    Create a new target (HTTP request configuration).
    
    Args:
        target_data: Target creation data (url, method, headers, body_template)
        
    Returns:
        Created target with generated ID
        
    Why: Allows users to define HTTP endpoints they want to ping/schedule
    """
    # Generate unique ID for the target
    target_id = str(uuid.uuid4())
    
    # Create target object
    target = Target(
        id=target_id,
        url=target_data.url,
        method=target_data.method,
        headers=target_data.headers,
        body_template=target_data.body_template
    )
    
    # Load existing targets
    targets = storage.load_targets()
    
    # Convert target to dict and add to list
    target_dict = target.model_dump()
    targets.append(target_dict)
    
    # Save targets back to file
    storage.save_targets(targets)
    
    return target


@app.post("/schedules", response_model=Schedule)
async def create_schedule(schedule_data: ScheduleCreate):
    """
    Create a new schedule for executing a target at intervals.
    
    Args:
        schedule_data: Schedule creation data (target_id, interval_seconds, duration_seconds)
        
    Returns:
        Created schedule with generated ID and calculated end time
        
    Why: Allows users to schedule HTTP requests at specified intervals for a duration
    """
    # Verify target exists
    targets = storage.load_targets()
    target_exists = any(t.get("id") == schedule_data.target_id for t in targets)
    
    if not target_exists:
        raise HTTPException(
            status_code=404,
            detail=f"Target with id '{schedule_data.target_id}' not found"
        )
    
    # Generate unique ID for the schedule
    schedule_id = str(uuid.uuid4())
    
    # Calculate timestamps
    created_at = datetime.now()
    ends_at = created_at + timedelta(seconds=schedule_data.duration_seconds)
    
    # Create schedule object
    schedule = Schedule(
        id=schedule_id,
        target_id=schedule_data.target_id,
        interval_seconds=schedule_data.interval_seconds,
        duration_seconds=schedule_data.duration_seconds,
        status=ScheduleStatus.ACTIVE,
        created_at=created_at,
        ends_at=ends_at
    )
    
    # Load existing schedules
    schedules = storage.load_schedules()
    
    # Convert schedule to dict and add to list
    schedule_dict = schedule.model_dump()
    schedules.append(schedule_dict)
    
    # Save schedules back to file
    storage.save_schedules(schedules)
    
    return schedule


@app.post("/schedules/{schedule_id}/pause")
async def pause_schedule(schedule_id: str):
    """
    Pause an active schedule.
    
    Args:
        schedule_id: ID of the schedule to pause
        
    Returns:
        Updated schedule with status set to "paused"
        
    Why: Allows users to temporarily stop a schedule without deleting it
    """
    # Load existing schedules
    schedules = storage.load_schedules()
    
    # Find the schedule
    schedule_index = None
    for i, s in enumerate(schedules):
        if s.get("id") == schedule_id:
            schedule_index = i
            break
    
    if schedule_index is None:
        raise HTTPException(
            status_code=404,
            detail=f"Schedule with id '{schedule_id}' not found"
        )
    
    # Update schedule status to paused
    schedules[schedule_index]["status"] = ScheduleStatus.PAUSED
    
    # Save schedules back to file
    storage.save_schedules(schedules)
    
    # Return updated schedule
    return schedules[schedule_index]


@app.get("/runs")
async def get_runs(
    schedule_id: Optional[str] = Query(None, description="Filter by schedule ID"),
    limit: Optional[int] = Query(None, description="Limit number of results"),
    offset: Optional[int] = Query(0, description="Offset for pagination")
):
    """
    Get run history with optional filtering.
    
    Args:
        schedule_id: Optional filter by schedule ID
        limit: Optional limit on number of results
        offset: Optional offset for pagination
        
    Returns:
        List of runs, optionally filtered by schedule_id
        
    Why: Allows users to view execution history and track request attempts
    """
    # Load all runs
    runs = storage.load_runs()
    
    # Filter by schedule_id if provided
    if schedule_id:
        runs = [r for r in runs if r.get("schedule_id") == schedule_id]
    
    # Apply pagination
    if offset:
        runs = runs[offset:]
    if limit:
        runs = runs[:limit]
    
    return {
        "total": len(runs),
        "runs": runs
    }


@app.get("/metrics")
async def get_metrics(
    schedule_id: Optional[str] = Query(None, description="Filter by schedule ID")
):
    """
    Get aggregated metrics from run history.
    
    Args:
        schedule_id: Optional filter by schedule ID
        
    Returns:
        Aggregated statistics including:
        - Total attempts
        - Success/failure counts
        - Average latency
        - Status code distribution
        - Error type distribution
        
    Why: Provides insights into request performance and success rates
    """
    # Load all runs
    runs = storage.load_runs()
    
    # Filter by schedule_id if provided
    if schedule_id:
        runs = [r for r in runs if r.get("schedule_id") == schedule_id]
    
    # Aggregate metrics
    total_attempts = 0
    successful_attempts = 0
    failed_attempts = 0
    total_latency = 0.0
    status_codes = {}
    error_types = {}
    
    # Process all attempts from all runs
    for run in runs:
        attempts = run.get("attempts", [])
        total_attempts += len(attempts)
        
        for attempt in attempts:
            # Check if successful (has status_code and no error)
            if attempt.get("status_code") and not attempt.get("error_type"):
                successful_attempts += 1
            else:
                failed_attempts += 1
            
            # Aggregate latency
            latency = attempt.get("latency_ms", 0)
            if latency:
                total_latency += latency
            
            # Count status codes
            status_code = attempt.get("status_code")
            if status_code:
                status_codes[status_code] = status_codes.get(status_code, 0) + 1
            
            # Count error types
            error_type = attempt.get("error_type")
            if error_type:
                error_types[error_type] = error_types.get(error_type, 0) + 1
    
    # Calculate average latency
    avg_latency = total_latency / total_attempts if total_attempts > 0 else 0.0
    
    return {
        "total_attempts": total_attempts,
        "successful_attempts": successful_attempts,
        "failed_attempts": failed_attempts,
        "success_rate": (successful_attempts / total_attempts * 100) if total_attempts > 0 else 0.0,
        "average_latency_ms": round(avg_latency, 2),
        "status_code_distribution": status_codes,
        "error_type_distribution": error_types
    }


# Main entry point for running the application
if __name__ == "__main__":
    """
    Run the FastAPI application using uvicorn.
    
    Configuration:
    - host: 0.0.0.0 (listen on all interfaces)
    - port: 8000 (default FastAPI port)
    - reload: True (auto-reload on code changes for development)
    
    Why: Allows running the app directly with 'python main.py'
    """
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
