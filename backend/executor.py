"""
HTTP request execution for Ping Robot

This module handles the actual HTTP request execution:
- Async HTTP requests using httpx
- Timeout handling (default 10 seconds)
- Error classification (timeout, DNS, connection, 4xx, 5xx)
- Metrics capture (status code, latency, response size)
"""

import httpx
import time
from typing import Dict, Any, Optional
from datetime import datetime


# Default timeout for HTTP requests (10 seconds)
DEFAULT_TIMEOUT = 10.0


async def execute_request(target: Dict[str, Any], timeout: float = DEFAULT_TIMEOUT) -> Dict[str, Any]:
    """
    Execute an HTTP request for a target.
    
    Args:
        target: Target dictionary with url, method, headers, body_template
        timeout: Request timeout in seconds (default: 10.0)
        
    Returns:
        Attempt dictionary with:
        - timestamp: When the attempt was made
        - status_code: HTTP status code (None if error)
        - latency_ms: Request latency in milliseconds
        - response_size: Size of response in bytes
        - error_type: Type of error if request failed
        
    Why: Centralized HTTP execution with comprehensive error handling and metrics collection.
    Uses httpx for async HTTP requests with proper timeout and error classification.
    """
    # Record start time for latency calculation
    start_time = time.time()
    timestamp = datetime.now()
    
    # Extract target configuration
    url = target.get("url")
    method = target.get("method", "GET").upper()
    headers = target.get("headers") or {}
    body_template = target.get("body_template")
    
    # Prepare request body if provided
    content = None
    if body_template and method in ["POST", "PUT", "PATCH"]:
        content = body_template.encode('utf-8') if isinstance(body_template, str) else body_template
    
    # Initialize attempt result with defaults
    attempt = {
        "timestamp": timestamp.isoformat(),
        "status_code": None,
        "latency_ms": 0.0,
        "response_size": 0,
        "error_type": None
    }
    
    try:
        # Create httpx client with timeout
        # Why: Using context manager ensures proper cleanup of connections
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Prepare request kwargs
            request_kwargs = {
                "method": method,
                "url": url,
                "headers": headers,
            }
            
            # Add content/body for methods that support it
            if content:
                request_kwargs["content"] = content
            
            # Execute the HTTP request
            response = await client.request(**request_kwargs)
            
            # Calculate latency
            latency_ms = (time.time() - start_time) * 1000
            
            # Get response size
            response_size = len(response.content) if response.content else 0
            
            # Classify response status
            status_code = response.status_code
            
            # Classify 4xx and 5xx as errors
            if 400 <= status_code < 500:
                error_type = "4xx"
            elif 500 <= status_code < 600:
                error_type = "5xx"
            else:
                error_type = None
            
            # Build attempt result
            attempt.update({
                "status_code": status_code,
                "latency_ms": round(latency_ms, 2),
                "response_size": response_size,
                "error_type": error_type
            })
            
    except httpx.TimeoutException:
        # Request timed out
        latency_ms = (time.time() - start_time) * 1000
        attempt.update({
            "latency_ms": round(latency_ms, 2),
            "error_type": "timeout"
        })
        
    except httpx.ConnectError:
        # Connection error (server unreachable, connection refused, etc.)
        latency_ms = (time.time() - start_time) * 1000
        attempt.update({
            "latency_ms": round(latency_ms, 2),
            "error_type": "connection"
        })
        
    except httpx.NetworkError as e:
        # Network-related errors (DNS, network unreachable, etc.)
        latency_ms = (time.time() - start_time) * 1000
        
        # Check if it's a DNS error
        error_str = str(e).lower()
        if "name resolution" in error_str or "dns" in error_str or "name or service not known" in error_str:
            error_type = "DNS"
        else:
            error_type = "connection"
        
        attempt.update({
            "latency_ms": round(latency_ms, 2),
            "error_type": error_type
        })
        
    except Exception as e:
        # Catch any other unexpected errors
        latency_ms = (time.time() - start_time) * 1000
        attempt.update({
            "latency_ms": round(latency_ms, 2),
            "error_type": "unknown",
            "error_message": str(e)
        })
    
    return attempt


def classify_error(status_code: Optional[int], exception: Optional[Exception] = None) -> Optional[str]:
    """
    Classify error type based on status code or exception.
    
    Args:
        status_code: HTTP status code (if available)
        exception: Exception object (if available)
        
    Returns:
        Error type string or None if no error
        
    Why: Centralized error classification logic for consistent error reporting.
    """
    if status_code:
        if 400 <= status_code < 500:
            return "4xx"
        elif 500 <= status_code < 600:
            return "5xx"
    
    if exception:
        if isinstance(exception, httpx.TimeoutException):
            return "timeout"
        elif isinstance(exception, httpx.ConnectError):
            return "connection"
        elif isinstance(exception, httpx.NetworkError):
            error_str = str(exception).lower()
            if "dns" in error_str or "name resolution" in error_str:
                return "DNS"
            return "connection"
    
    return None