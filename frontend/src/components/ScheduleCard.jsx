/**
 * ScheduleCard Component
 * 
 * Displays individual schedule card with:
 * - Target information (from localStorage)
 * - Interval and duration
 * - Status badge
 * - Created and end times
 * - Time remaining (if active)
 * - Pause button (if active)
 */

import { getTargetById } from '../utils/storage';

export default function ScheduleCard({ schedule, onPause }) {
  const target = getTargetById(schedule.target_id);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
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

  const getTimeRemaining = () => {
    if (schedule.status !== 'active' || !schedule.ends_at) return null;
    
    try {
      const endsAt = new Date(schedule.ends_at);
      const now = new Date();
      const remaining = endsAt - now;
      
      if (remaining <= 0) return 'Expired';
      
      const seconds = Math.floor(remaining / 1000);
      return formatDuration(seconds);
    } catch {
      return null;
    }
  };

  const timeRemaining = getTimeRemaining();
  const isExpired = timeRemaining === 'Expired';

  return (
    <div className={`schedule-card ${schedule.status} ${isExpired ? 'expired' : ''}`}>
      <div className="schedule-header">
        <div className="schedule-id">
          <strong>Schedule:</strong> {schedule.id.substring(0, 8)}...
        </div>
        <span className={`status-badge ${schedule.status}`}>
          {schedule.status === 'active' ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="schedule-content">
        <div className="schedule-info-row">
          <div className="info-item">
            <strong>Target:</strong>
            {target ? (
              <span className="target-info">
                {target.method} {target.url}
              </span>
            ) : (
              <span className="target-info missing">
                ID: {schedule.target_id.substring(0, 8)}... (not found)
              </span>
            )}
          </div>
        </div>

        <div className="schedule-info-row">
          <div className="info-item">
            <strong>Interval:</strong>
            <span>{formatInterval(schedule.interval_seconds)}</span>
          </div>
          <div className="info-item">
            <strong>Duration:</strong>
            <span>{formatDuration(schedule.duration_seconds)}</span>
          </div>
        </div>

        <div className="schedule-info-row">
          <div className="info-item">
            <strong>Created:</strong>
            <span>{formatDate(schedule.created_at)}</span>
          </div>
          <div className="info-item">
            <strong>Ends At:</strong>
            <span>{formatDate(schedule.ends_at)}</span>
          </div>
        </div>

        {timeRemaining && (
          <div className="schedule-info-row">
            <div className="info-item time-remaining">
              <strong>Time Remaining:</strong>
              <span className={isExpired ? 'expired' : ''}>{timeRemaining}</span>
            </div>
          </div>
        )}
      </div>

      <div className="schedule-actions">
        {schedule.status === 'active' && !isExpired && (
          <button 
            className="pause-button"
            onClick={() => onPause(schedule.id)}
          >
            Pause Schedule
          </button>
        )}
        {schedule.status === 'paused' && (
          <span className="paused-indicator">Schedule is paused</span>
        )}
        {isExpired && (
          <span className="expired-indicator">Schedule has expired</span>
        )}
      </div>
    </div>
  );
}
