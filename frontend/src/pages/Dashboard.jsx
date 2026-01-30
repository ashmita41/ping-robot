/**
 * Dashboard Page
 * 
 * Overview page with:
 * - Health status badge
 * - Create Target form
 * - Create Schedule form
 * - Recent runs (last 5)
 */

import { useState, useEffect } from 'react';
import { getHealth, getRuns } from '../services/api';
import CreateTargetForm from '../components/CreateTargetForm';
import CreateScheduleForm from '../components/CreateScheduleForm';
import RunsList from '../components/RunsList';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load health status and recent runs on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check health once on load
      const healthData = await getHealth();
      setHealth(healthData);

      // Get recent runs (last 5)
      const runsData = await getRuns({ limit: 5 });
      setRuns(runsData.runs || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setHealth({ status: 'unhealthy' });
    } finally {
      setLoading(false);
    }
  };

  const handleTargetCreated = (target) => {
    // Refresh data if needed
    console.log('Target created:', target);
  };

  const handleScheduleCreated = (schedule) => {
    // Refresh runs after a short delay to see new activity
    setTimeout(() => {
      loadData();
    }, 2000);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Health Badge */}
      <div className="health-section">
        <h2>API Status</h2>
        {loading ? (
          <div className="health-badge loading">Checking...</div>
        ) : health ? (
          <div className={`health-badge ${health.status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
            <span className="status-indicator"></span>
            Status: {health.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
            {health.service && <span className="service-name">({health.service})</span>}
          </div>
        ) : (
          <div className="health-badge error">Unable to connect to API</div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Create Target Form */}
        <div className="dashboard-section">
          <CreateTargetForm onTargetCreated={handleTargetCreated} />
        </div>

        {/* Create Schedule Form */}
        <div className="dashboard-section">
          <CreateScheduleForm onScheduleCreated={handleScheduleCreated} />
        </div>
      </div>

      {/* Recent Runs */}
      <div className="dashboard-section">
        <h2>Recent Runs</h2>
        {loading ? (
          <div className="loading">Loading runs...</div>
        ) : (
          <RunsList runs={runs} />
        )}
      </div>
    </div>
  );
}
