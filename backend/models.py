"""
Pydantic models for Ping Robot API

This module defines the data models used throughout the application:
- Target: HTTP request configuration
- Schedule: Scheduling configuration with timing
- Run: Execution record for a schedule
- Attempt: Individual HTTP request attempt with metrics
"""

from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum


class ScheduleStatus(str, Enum):
    """Schedule status enumeration"""
    ACTIVE = "active"
    PAUSED = "paused"


class Target(BaseModel):
    """
    Target model - represents an HTTP request configuration
    
    Fields:
    - id: Unique identifier (auto-generated)
    - url: Target URL to ping
    - method: HTTP method (GET, POST, etc.)
    - headers: Optional HTTP headers as key-value pairs
    - body_template: Optional request body template
    """
    id: Optional[str] = None
    url: str
    method: str = "GET"
    headers: Optional[Dict[str, str]] = None
    body_template: Optional[str] = None


class Schedule(BaseModel):
    """
    Schedule model - represents a scheduled task
    
    Fields:
    - id: Unique identifier (auto-generated)
    - target_id: Reference to the target to execute
    - interval_seconds: Time between executions
    - duration_seconds: Total duration the schedule should run
    - status: Current status (active/paused)
    - created_at: Timestamp when schedule was created
    - ends_at: Calculated end time (created_at + duration_seconds)
    """
    id: Optional[str] = None
    target_id: str
    interval_seconds: int
    duration_seconds: int
    status: ScheduleStatus = ScheduleStatus.ACTIVE
    created_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class Attempt(BaseModel):
    """
    Attempt model - represents a single HTTP request attempt
    
    Fields:
    - timestamp: When the attempt was made
    - status_code: HTTP status code (None if error)
    - latency_ms: Request latency in milliseconds
    - response_size: Size of response in bytes
    - error_type: Type of error if request failed (timeout, DNS, connection, etc.)
    """
    timestamp: datetime
    status_code: Optional[int] = None
    latency_ms: float
    response_size: int = 0
    error_type: Optional[str] = None


class Run(BaseModel):
    """
    Run model - represents an execution session for a schedule
    
    Fields:
    - id: Unique identifier (auto-generated)
    - schedule_id: Reference to the schedule
    - started_at: When the run started
    - status: Current status of the run
    - attempts: List of HTTP request attempts
    """
    id: Optional[str] = None
    schedule_id: str
    started_at: datetime
    status: str = "running"
    attempts: List[Attempt] = []


# Request/Response models for API endpoints

class TargetCreate(BaseModel):
    """Request model for creating a target"""
    url: str
    method: str = "GET"
    headers: Optional[Dict[str, str]] = None
    body_template: Optional[str] = None


class ScheduleCreate(BaseModel):
    """Request model for creating a schedule"""
    target_id: str
    interval_seconds: int
    duration_seconds: int
