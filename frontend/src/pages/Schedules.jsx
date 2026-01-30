/**
 * Schedules Page
 * 
 * View all schedules and pause them
 * 
 * Features:
 * - List of all schedules from localStorage
 * - Filter by status (all/active/paused)
 * - Pause active schedules
 * - Display schedule details
 */

import { useState, useEffect } from 'react';
import { pauseScheduleAPI } from '../services/api';
import { getSchedules, updateSchedule } from '../utils/storage';
import ScheduleCard from '../components/ScheduleCard';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'paused'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load schedules from localStorage on component mount
  useEffect(() => {
    loadSchedules();
  }, []);

  // Filter schedules when status filter or schedules change
  useEffect(() => {
    filterSchedules();
  }, [schedules, statusFilter]);

  const loadSchedules = () => {
    const loadedSchedules = getSchedules();
    // Sort by created_at (newest first)
    loadedSchedules.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });
    setSchedules(loadedSchedules);
  };

  const filterSchedules = () => {
    if (statusFilter === 'all') {
      setFilteredSchedules(schedules);
    } else {
      setFilteredSchedules(schedules.filter(s => s.status === statusFilter));
    }
  };

  const handlePause = async (scheduleId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call API to pause schedule
      const updatedSchedule = await pauseScheduleAPI(scheduleId);

      // Update localStorage
      updateSchedule(scheduleId, { status: 'paused' });

      // Update local state
      setSchedules(prevSchedules =>
        prevSchedules.map(s =>
          s.id === scheduleId ? { ...s, status: 'paused' } : s
        )
      );

      setSuccess(`Schedule ${scheduleId.substring(0, 8)}... paused successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to pause schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const active = schedules.filter(s => s.status === 'active').length;
    const paused = schedules.filter(s => s.status === 'paused').length;
    return { active, paused, total: schedules.length };
  };

  const counts = getStatusCounts();

  return (
    <div className="schedules-page">
      <div className="page-header">
        <h1>Schedules</h1>
        <div className="schedule-counts">
          <span className="count-item">Total: {counts.total}</span>
          <span className="count-item active">Active: {counts.active}</span>
          <span className="count-item paused">Paused: {counts.paused}</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Schedules</option>
          <option value="active">Active Only</option>
          <option value="paused">Paused Only</option>
        </select>
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Schedules List */}
      {loading && schedules.length === 0 ? (
        <div className="loading">Loading schedules...</div>
      ) : filteredSchedules.length === 0 ? (
        <div className="empty-state">
          <p>
            {statusFilter === 'all'
              ? 'No schedules found. Create a schedule from the Dashboard.'
              : `No ${statusFilter} schedules found.`}
          </p>
        </div>
      ) : (
        <div className="schedules-list">
          {filteredSchedules.map(schedule => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onPause={handlePause}
            />
          ))}
        </div>
      )}
    </div>
  );
}
