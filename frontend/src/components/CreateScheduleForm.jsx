/**
 * CreateScheduleForm Component
 * 
 * Form to create a new schedule
 * Loads targets from localStorage
 * Saves schedule to localStorage after creation
 */

import { useState, useEffect } from 'react';
import { createSchedule } from '../services/api';
import { saveSchedule, getTargets } from '../utils/storage';

export default function CreateScheduleForm({ onScheduleCreated }) {
  const [targetId, setTargetId] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [durationSeconds, setDurationSeconds] = useState(3600);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load targets from localStorage
  useEffect(() => {
    const loadedTargets = getTargets();
    setTargets(loadedTargets);
    
    // Auto-select first target if available
    if (loadedTargets.length > 0 && !targetId) {
      setTargetId(loadedTargets[0].id);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!targetId) {
      setError('Please select a target');
      setLoading(false);
      return;
    }

    try {
      // Create schedule via API
      const scheduleData = {
        target_id: targetId,
        interval_seconds: parseInt(intervalSeconds),
        duration_seconds: parseInt(durationSeconds)
      };

      const schedule = await createSchedule(scheduleData);

      // Save to localStorage for tracking
      saveSchedule(schedule);

      // Reset form
      setTargetId(targets.length > 0 ? targets[0].id : '');
      setIntervalSeconds(30);
      setDurationSeconds(3600);
      setSuccess(true);

      // Notify parent component
      if (onScheduleCreated) {
        onScheduleCreated(schedule);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const formatInterval = (seconds) => {
    if (seconds < 60) return `Every ${seconds} seconds`;
    if (seconds < 3600) return `Every ${Math.floor(seconds / 60)} minutes`;
    return `Every ${Math.floor(seconds / 3600)} hours`;
  };

  return (
    <div className="create-schedule-form">
      <h2>Create Schedule</h2>

      {targets.length === 0 ? (
        <div className="warning-message">
          No targets available. Please create a target first.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="targetId">Target *</label>
            <select
              id="targetId"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a target</option>
              {targets.map(target => (
                <option key={target.id} value={target.id}>
                  {target.method} {target.url}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="intervalSeconds">
              Interval: {formatInterval(intervalSeconds)}
            </label>
            <input
              id="intervalSeconds"
              type="number"
              min="1"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(e.target.value)}
              required
              disabled={loading}
            />
            <small>Time between executions (in seconds)</small>
          </div>

          <div className="form-group">
            <label htmlFor="durationSeconds">
              Duration: {formatDuration(durationSeconds)}
            </label>
            <input
              id="durationSeconds"
              type="number"
              min="1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              required
              disabled={loading}
            />
            <small>Total duration the schedule should run (in seconds)</small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              Schedule created successfully!
            </div>
          )}

          <button type="submit" disabled={loading || !targetId}>
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </form>
      )}
    </div>
  );
}
