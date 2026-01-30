/**
 * MetricsCard Component
 * 
 * Displays aggregated metrics from run history
 * 
 * Shows:
 * - Success rate
 * - Average latency
 * - Status code distribution
 * - Error type distribution
 */

export default function MetricsCard({ metrics }) {
  if (!metrics) {
    return (
      <div className="metrics-card empty">
        <p>No metrics available.</p>
      </div>
    );
  }

  const {
    total_attempts = 0,
    successful_attempts = 0,
    failed_attempts = 0,
    success_rate = 0,
    average_latency_ms = 0,
    status_code_distribution = {},
    error_type_distribution = {}
  } = metrics;

  const formatLatency = (ms) => {
    if (!ms || ms === 0) return '0ms';
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 95) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  };

  const statusCodes = Object.entries(status_code_distribution).sort((a, b) => b[1] - a[1]);
  const errorTypes = Object.entries(error_type_distribution).sort((a, b) => b[1] - a[1]);

  return (
    <div className="metrics-card">
      <h2>Metrics Overview</h2>

      {/* Summary Cards */}
      <div className="metrics-summary">
        <div className="metric-item">
          <div className="metric-label">Total Attempts</div>
          <div className="metric-value">{total_attempts.toLocaleString()}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Successful</div>
          <div className="metric-value success">{successful_attempts.toLocaleString()}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Failed</div>
          <div className="metric-value error">{failed_attempts.toLocaleString()}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Success Rate</div>
          <div className={`metric-value ${getSuccessRateColor(success_rate)}`}>
            {success_rate.toFixed(2)}%
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Avg Latency</div>
          <div className="metric-value">{formatLatency(average_latency_ms)}</div>
        </div>
      </div>

      {/* Status Code Distribution */}
      {statusCodes.length > 0 && (
        <div className="metrics-section">
          <h3>Status Code Distribution</h3>
          <div className="distribution-list">
            {statusCodes.map(([code, count]) => {
              const percentage = total_attempts > 0 ? (count / total_attempts * 100).toFixed(1) : 0;
              const getCodeColor = (code) => {
                const num = parseInt(code);
                if (num >= 200 && num < 300) return 'success';
                if (num >= 400 && num < 500) return 'warning';
                if (num >= 500) return 'error';
                return '';
              };

              return (
                <div key={code} className="distribution-item">
                  <div className="distribution-header">
                    <span className={`status-code ${getCodeColor(code)}`}>
                      {code}
                    </span>
                    <span className="distribution-count">{count}</span>
                    <span className="distribution-percentage">{percentage}%</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className={`distribution-bar-fill ${getCodeColor(code)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Type Distribution */}
      {errorTypes.length > 0 && (
        <div className="metrics-section">
          <h3>Error Type Distribution</h3>
          <div className="distribution-list">
            {errorTypes.map(([type, count]) => {
              const percentage = total_attempts > 0 ? (count / total_attempts * 100).toFixed(1) : 0;

              return (
                <div key={type} className="distribution-item">
                  <div className="distribution-header">
                    <span className="error-type">{type}</span>
                    <span className="distribution-count">{count}</span>
                    <span className="distribution-percentage">{percentage}%</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-bar-fill error"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty States */}
      {statusCodes.length === 0 && errorTypes.length === 0 && (
        <div className="empty-metrics">
          <p>No status codes or errors recorded yet.</p>
        </div>
      )}
    </div>
  );
}
