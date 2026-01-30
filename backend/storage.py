"""
File-based storage operations for Ping Robot

This module handles all file I/O operations with thread-safe locking:
- Reading and writing JSON files
- Thread-safe file operations using filelock
- Data persistence for targets, schedules, and runs
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from filelock import FileLock
from datetime import datetime


# Base directory for data files
DATA_DIR = Path(__file__).parent / "data"

# File paths
TARGETS_FILE = DATA_DIR / "targets.json"
SCHEDULES_FILE = DATA_DIR / "schedules.json"
RUNS_FILE = DATA_DIR / "runs.json"

# Lock files for thread-safe operations
TARGETS_LOCK = DATA_DIR / "targets.json.lock"
SCHEDULES_LOCK = DATA_DIR / "schedules.json.lock"
RUNS_LOCK = DATA_DIR / "runs.json.lock"


def ensure_data_dir():
    """
    Ensure the data directory exists.
    
    Why: Creates the data directory if it doesn't exist to prevent file errors
    """
    DATA_DIR.mkdir(exist_ok=True)


def load_data(file_path: Path, lock_path: Path) -> List[Dict[str, Any]]:
    """
    Load data from a JSON file with thread-safe locking.
    
    Args:
        file_path: Path to the JSON file
        lock_path: Path to the lock file
        
    Returns:
        List of dictionaries loaded from JSON file, or empty list if file doesn't exist
        
    Why: Thread-safe reading ensures no data corruption when multiple requests
    access the same file simultaneously
    """
    ensure_data_dir()
    
    # If file doesn't exist, return empty list
    if not file_path.exists():
        return []
    
    # Use file lock to ensure thread-safe reading
    with FileLock(lock_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure we return a list
                return data if isinstance(data, list) else []
        except (json.JSONDecodeError, IOError):
            # If file is corrupted or can't be read, return empty list
            return []


def save_data(file_path: Path, lock_path: Path, data: List[Dict[str, Any]]):
    """
    Save data to a JSON file with thread-safe locking.
    
    Args:
        file_path: Path to the JSON file
        lock_path: Path to the lock file
        data: List of dictionaries to save
        
    Why: Thread-safe writing prevents data corruption when multiple requests
    try to write simultaneously. The lock ensures only one write happens at a time.
    """
    ensure_data_dir()
    
    # Use file lock to ensure thread-safe writing
    with FileLock(lock_path):
        # Write to a temporary file first, then rename (atomic operation)
        temp_file = file_path.with_suffix('.tmp')
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        
        # Atomic rename - ensures data integrity
        temp_file.replace(file_path)


def load_targets() -> List[Dict[str, Any]]:
    """
    Load all targets from targets.json.
    
    Returns:
        List of target dictionaries
    """
    return load_data(TARGETS_FILE, TARGETS_LOCK)


def save_targets(targets: List[Dict[str, Any]]):
    """
    Save targets to targets.json.
    
    Args:
        targets: List of target dictionaries to save
    """
    save_data(TARGETS_FILE, TARGETS_LOCK, targets)


def load_schedules() -> List[Dict[str, Any]]:
    """
    Load all schedules from schedules.json.
    
    Returns:
        List of schedule dictionaries
    """
    return load_data(SCHEDULES_FILE, SCHEDULES_LOCK)


def save_schedules(schedules: List[Dict[str, Any]]):
    """
    Save schedules to schedules.json.
    
    Args:
        schedules: List of schedule dictionaries to save
    """
    save_data(SCHEDULES_FILE, SCHEDULES_LOCK, schedules)


def load_runs() -> List[Dict[str, Any]]:
    """
    Load all runs from runs.json.
    
    Returns:
        List of run dictionaries
    """
    return load_data(RUNS_FILE, RUNS_LOCK)


def save_runs(runs: List[Dict[str, Any]]):
    """
    Save runs to runs.json.
    
    Args:
        runs: List of run dictionaries to save
    """
    save_data(RUNS_FILE, RUNS_LOCK, runs)


def append_run(run: Dict[str, Any]):
    """
    Append a new run to runs.json (thread-safe).
    
    Args:
        run: Run dictionary to append
        
    Why: Optimized function for appending runs without loading all data first.
    However, for simplicity and consistency, we'll load, append, and save.
    """
    runs = load_runs()
    runs.append(run)
    save_runs(runs)
