"""
Background scheduler for Ping Robot

This module handles the background scheduling logic that:
- Loads active schedules from storage
- Checks if it's time to execute scheduled requests
- Triggers HTTP request execution
- Manages schedule lifecycle (active/paused, duration windows)
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Import storage functions
import storage

# Import models for type hints
from models import Schedule, ScheduleStatus, Run, Attempt

# Import executor
from executor import execute_request


def load_active_schedules() -> List[Dict[str, Any]]:
    """
    Load all active schedules that are within their execution window.
    
    Algorithm check: current_time < created_at + duration_seconds (if window set)
    
    Returns:
        List of active schedule dictionaries that haven't expired
        
    Why: Filters schedules to only those that should be considered for execution.
    Automatically pauses schedules that have passed their end time.
    
    This implements step 5 of the Simple Start Algorithm:
    - Filters out paused schedules (status = "paused")
    - Checks duration window: current_time < created_at + duration_seconds
    - Auto-pauses schedules that have expired
    """
    # Load all schedules from schedules.json (step 4 of algorithm)
    all_schedules = storage.load_schedules()
    active_schedules = []
    now = datetime.now()
    
    # Track if we need to update schedules (for auto-pausing expired ones)
    schedules_updated = False
    
    for schedule in all_schedules:
        status = schedule.get("status", "active")
        ends_at_str = schedule.get("ends_at")
        
        # Skip paused schedules (pause/resume handled via status field - step 6)
        if status == ScheduleStatus.PAUSED:
            continue
        
        # Algorithm check: current_time < created_at + duration_seconds
        # We use ends_at which is calculated as created_at + duration_seconds
        if ends_at_str:
            # Parse ends_at if it's a string
            if isinstance(ends_at_str, str):
                try:
                    ends_at = datetime.fromisoformat(ends_at_str.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    # If parsing fails, skip this schedule
                    continue
            else:
                ends_at = ends_at_str
            
            # Check: current_time < created_at + duration_seconds (i.e., now < ends_at)
            # If past the duration window, auto-pause the schedule
            if now >= ends_at:
                schedule["status"] = ScheduleStatus.PAUSED
                schedules_updated = True
                continue
        
        # Schedule is active and within window
        active_schedules.append(schedule)
    
    # Save updated schedules if any were auto-paused
    if schedules_updated:
        storage.save_schedules(all_schedules)
    
    return active_schedules


def should_run_now(schedule: Dict[str, Any]) -> bool:
    """
    Check if a schedule should execute now based on its interval.
    
    Algorithm check: current_time >= last_run_at + interval_seconds
    
    Args:
        schedule: Schedule dictionary
        
    Returns:
        True if schedule should run now, False otherwise
        
    Why: Determines if enough time has passed since the last execution
    to trigger a new execution based on interval_seconds.
    
    Note: We track last_run_at via the most recent attempt timestamp in runs.json,
    which is functionally equivalent to tracking it in the schedule itself.
    """
    schedule_id = schedule.get("id")
    interval_seconds = schedule.get("interval_seconds", 60)
    
    # Load all runs to find the most recent one for this schedule
    runs = storage.load_runs()
    
    # Find the most recent run for this schedule
    schedule_runs = [r for r in runs if r.get("schedule_id") == schedule_id]
    
    if not schedule_runs:
        # No runs yet, should run immediately
        return True
    
    # Get the most recent run
    most_recent_run = max(schedule_runs, key=lambda r: r.get("started_at", ""))
    
    # Get the most recent attempt from this run
    attempts = most_recent_run.get("attempts", [])
    if not attempts:
        # Run exists but no attempts yet, should run
        return True
    
    # Get the most recent attempt timestamp (this is our last_run_at)
    most_recent_attempt = max(attempts, key=lambda a: a.get("timestamp", ""))
    last_attempt_time_str = most_recent_attempt.get("timestamp")
    
    if not last_attempt_time_str:
        return True
    
    # Parse timestamp
    try:
        if isinstance(last_attempt_time_str, str):
            last_attempt_time = datetime.fromisoformat(last_attempt_time_str.replace('Z', '+00:00'))
        else:
            last_attempt_time = last_attempt_time_str
    except (ValueError, AttributeError):
        # If parsing fails, run it
        return True
    
    # Algorithm check: current_time >= last_run_at + interval_seconds
    now = datetime.now()
    time_since_last = (now - last_attempt_time).total_seconds()
    
    return time_since_last >= interval_seconds


async def execute_schedule(schedule: Dict[str, Any]):
    """
    Execute a schedule: create run, execute request, save attempt.
    
    Args:
        schedule: Schedule dictionary to execute
        
    Why: Handles the full execution flow for a schedule:
    1. Loads the target configuration
    2. Creates or updates a run record
    3. Executes the HTTP request
    4. Saves the attempt to the run
    5. Updates the run in storage
    """
    schedule_id = schedule.get("id")
    target_id = schedule.get("target_id")
    
    # Load the target
    targets = storage.load_targets()
    target = next((t for t in targets if t.get("id") == target_id), None)
    
    if not target:
        # Target not found, skip execution
        return
    
    # Load runs to find or create a run for this schedule
    runs = storage.load_runs()
    
    # Find the most recent run for this schedule that is still "running"
    schedule_runs = [r for r in runs if r.get("schedule_id") == schedule_id]
    current_run = None
    
    for run in schedule_runs:
        if run.get("status") == "running":
            current_run = run
            break
    
    # Create new run if none exists or all are completed
    if not current_run:
        run_id = str(uuid.uuid4())
        current_run = {
            "id": run_id,
            "schedule_id": schedule_id,
            "started_at": datetime.now().isoformat(),
            "status": "running",
            "attempts": []
        }
        runs.append(current_run)
        storage.save_runs(runs)
    
    # Execute the HTTP request
    attempt_result = await execute_request(target)
    
    # Ensure timestamp is set
    if "timestamp" not in attempt_result or not attempt_result["timestamp"]:
        attempt_result["timestamp"] = datetime.now().isoformat()
    
    # Add attempt to current run
    current_run["attempts"].append(attempt_result)
    
    # Update the run in the runs list
    for i, r in enumerate(runs):
        if r.get("id") == current_run.get("id"):
            runs[i] = current_run
            break
    
    # Save updated runs
    storage.save_runs(runs)


async def run_scheduler():
    """
    Main scheduler loop that runs in the background.
    
    This implements the Simple Start Algorithm:
    1. ✅ Initialize data/ folder with empty JSON files (done at startup)
    2. ✅ Start FastAPI server (done in main.py)
    3. ✅ Start background scheduler task (done in main.py lifespan)
    4. Scheduler reads schedules.json every second
    5. For each active schedule:
       - Check: current_time >= last_run_at + interval_seconds
       - Check: current_time < created_at + duration_seconds (if window set)
       - If both true: execute request, save run
    6. Handle pause/resume by updating status field
    
    Why: Runs as a background task to continuously monitor and execute
    scheduled HTTP requests without blocking the FastAPI application.
    """
    while True:
        try:
            # Step 4: Read schedules.json every second
            # Load all active schedules (filters out paused and expired)
            schedules = load_active_schedules()
            
            # Step 5: For each active schedule, check if it should run
            for schedule in schedules:
                # Check: current_time >= last_run_at + interval_seconds
                if should_run_now(schedule):
                    # If both checks pass (interval + duration), execute request
                    # Create background task to execute schedule
                    # This allows multiple schedules to run concurrently
                    asyncio.create_task(execute_schedule(schedule))
            
            # Sleep for 1 second before checking again (step 4)
            # Why: Prevents CPU spinning while still being responsive to schedule changes
            await asyncio.sleep(1)
            
        except Exception as e:
            # Log error but continue running
            # In production, you'd want proper logging here
            print(f"Scheduler error: {e}")
            await asyncio.sleep(1)
