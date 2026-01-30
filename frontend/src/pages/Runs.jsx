/**
 * Runs & Metrics Page
 * 
 * View execution history and metrics
 * 
 * Features:
 * - Tab 1: Runs History (with filtering and pagination)
 * - Tab 2: Metrics (with statistics and breakdowns)
 */

import { useState, useEffect } from 'react';
import { getRuns, getMetrics } from '../services/api';
import { getSchedules } from '../utils/storage';
import RunsList from '../components/RunsList';
import MetricsCard from '../components/MetricsCard';

export default function Runs() {
  const [activeTab, setActiveTab] = useState('runs'); // 'runs' or 'metrics'
  
  // Runs tab state
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState(null);
  const [scheduleFilter, setScheduleFilter] = useState('');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  
  // Metrics tab state
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [metricsScheduleFilter, setMetricsScheduleFilter] = useState('');
  
  // Schedules for dropdown
  const [schedules, setSchedules] = useState([]);

  // Load schedules for dropdown
  useEffect(() => {
    const loadedSchedules = getSchedules();
    setSchedules(loadedSchedules);
  }, []);

  // Load runs when tab is active or filters change
  useEffect(() => {
    if (activeTab === 'runs') {
      loadRuns();
    }
  }, [activeTab, scheduleFilter, limit, offset]);

  // Load metrics when tab is active or filter changes
  useEffect(() => {
    if (activeTab === 'metrics') {
      loadMetrics();
    }
  }, [activeTab, metricsScheduleFilter]);

  const loadRuns = async () => {
    setRunsLoading(true);
    setRunsError(null);

    try {
      const params = {
        limit,
        offset
      };
      
      if (scheduleFilter) {
        params.schedule_id = scheduleFilter;
      }

      const data = await getRuns(params);
      setRuns(data.runs || []);
      setTotalRuns(data.total || 0);
    } catch (err) {
      setRunsError(err.message || 'Failed to load runs');
    } finally {
      setRunsLoading(false);
    }
  };

  const loadMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const params = {};
      
      if (metricsScheduleFilter) {
        params.schedule_id = metricsScheduleFilter;
      }

      const data = await getMetrics(params);
      setMetrics(data);
    } catch (err) {
      setMetricsError(err.message || 'Failed to load metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScheduleFilterChange = (value) => {
    setScheduleFilter(value);
    setOffset(0); // Reset to first page when filter changes
  };

  const handleMetricsScheduleFilterChange = (value) => {
    setMetricsScheduleFilter(value);
  };

  const totalPages = Math.ceil(totalRuns / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="runs-page">
      <h1>Runs & Metrics</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'runs' ? 'active' : ''}`}
          onClick={() => setActiveTab('runs')}
        >
          Runs History
        </button>
        <button
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'runs' ? (
          <div className="runs-tab">
            {/* Filter Section */}
            <div className="filter-section">
              <div className="filter-group">
                <label htmlFor="scheduleFilter">Filter by Schedule:</label>
                <select
                  id="scheduleFilter"
                  value={scheduleFilter}
                  onChange={(e) => handleScheduleFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Schedules</option>
                  {schedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.id.substring(0, 8)}... ({schedule.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="limit">Results per page:</label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setOffset(0);
                  }}
                  className="filter-select"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {runsError && (
              <div className="error-message">
                {runsError}
              </div>
            )}

            {/* Runs List */}
            {runsLoading ? (
              <div className="loading">Loading runs...</div>
            ) : (
              <>
                <div className="runs-summary">
                  Showing {runs.length} of {totalRuns} runs
                </div>
                <RunsList runs={runs} showAllAttempts={true} />
              </>
            )}

            {/* Pagination */}
            {totalRuns > 0 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={offset === 0}
                  className="pagination-button"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(offset + limit)}
                  disabled={offset + limit >= totalRuns}
                  className="pagination-button"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange((totalPages - 1) * limit)}
                  disabled={offset + limit >= totalRuns}
                  className="pagination-button"
                >
                  Last
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="metrics-tab">
            {/* Filter Section */}
            <div className="filter-section">
              <div className="filter-group">
                <label htmlFor="metricsScheduleFilter">Filter by Schedule:</label>
                <select
                  id="metricsScheduleFilter"
                  value={metricsScheduleFilter}
                  onChange={(e) => handleMetricsScheduleFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Schedules</option>
                  {schedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.id.substring(0, 8)}... ({schedule.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {metricsError && (
              <div className="error-message">
                {metricsError}
              </div>
            )}

            {/* Metrics Card */}
            {metricsLoading ? (
              <div className="loading">Loading metrics...</div>
            ) : metrics ? (
              <MetricsCard metrics={metrics} />
            ) : (
              <div className="empty-state">
                No metrics available yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
