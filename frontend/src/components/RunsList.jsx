/**
 * RunsList Component
 * 
 * Displays a list of runs with their attempts
 * Used for recent runs on dashboard
 */

export default function RunsList({ runs = [], showAllAttempts = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatLatency = (ms) => {
    if (!ms) return 'N/A';
    return `${ms.toFixed(2)}ms`;
  };

  const getStatusBadge = (attempt) => {
    if (attempt.error_type) {
      return <span className="badge error">{attempt.error_type}</span>;
    }
    if (attempt.status_code) {
      if (attempt.status_code >= 200 && attempt.status_code < 300) {
        return <span className="badge success">{attempt.status_code}</span>;
      }
      if (attempt.status_code >= 400 && attempt.status_code < 500) {
        return <span className="badge warning">{attempt.status_code}</span>;
      }
      if (attempt.status_code >= 500) {
        return <span className="badge error">{attempt.status_code}</span>;
      }
    }
    return <span className="badge">Unknown</span>;
  };

  if (runs.length === 0) {
    return (
      <div className="runs-list empty">
        <p>No runs yet. Create a schedule to start tracking runs.</p>
      </div>
    );
  }

  return (
    <div className="runs-list">
      {runs.map((run) => (
        <div key={run.id} className="run-card">
          <div className="run-header">
            <h3>Run: {run.id.substring(0, 8)}...</h3>
            <span className="run-status">{run.status}</span>
            <span className="run-date">{formatDate(run.started_at)}</span>
          </div>
          
          <div className="run-info">
            <p><strong>Schedule ID:</strong> {run.schedule_id}</p>
            <p><strong>Attempts:</strong> {run.attempts?.length || 0}</p>
          </div>

          {run.attempts && run.attempts.length > 0 && (
            <div className="attempts-list">
              <h4>{showAllAttempts ? 'All Attempts' : 'Recent Attempts'}:</h4>
              {(showAllAttempts ? run.attempts : run.attempts.slice(-5)).map((attempt, index) => (
                <div key={index} className="attempt-item">
                  <div className="attempt-header">
                    {getStatusBadge(attempt)}
                    <span className="attempt-time">{formatDate(attempt.timestamp)}</span>
                  </div>
                  <div className="attempt-details">
                    <span>Latency: {formatLatency(attempt.latency_ms)}</span>
                    {attempt.response_size > 0 && (
                      <span>Size: {(attempt.response_size / 1024).toFixed(2)} KB</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
